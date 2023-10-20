it.only("should do something with the database", () => {
    Cypress.config("taskTimeout", 900000);
    const dataToWrite = []; // Array to accumulate the data
    cy.task(
      "queryDB",
      "SELECT post_title FROM bscience_posts INNER JOIN bscience_postmeta ON bscience_posts.ID = bscience_postmeta.post_id WHERE bscience_postmeta.meta_key = 'trial_status_change' AND bscience_postmeta.meta_value = '2023-05-11';"

      // "SELECT post_title FROM bscience_posts INNER JOIN bscience_postmeta ON bscience_posts.ID = bscience_postmeta.post_id WHERE bscience_postmeta.meta_key = 'trial_status_change' AND bscience_postmeta.meta_value = '2023-05-11' AND bscience_posts.post_title NOT IN ('NCT00003042','NCT05855746','NCT00408005','NCT00453674','NCT00598026','NCT00691223','NCT00697411','NCT00987532')  order by post_title LIMIT 4;"

    ).then((result2) => {
      console.log(result2);
      cy.wrap(result2)
        .each((value) => {
          cy.request({
            method: "GET",
            url:
              "https://boldersciencestage.pixacore.com/scripts/tmp/import/" +
              value.post_title +
              ".json",
            headers: {
              "Content-Type": "application/json",
            },
          }).then((response) => {
            console.log(response.body.meta_input.aact_data);

            res = JSON.stringify(response.body.meta_input.aact_data);
           // console.log(res);
            const mysqlquerydata = JSON.parse(mysqldata(res));

            cy.log("SQL query data = " + JSON.stringify(mysqlquerydata));
            const nctid = mysqlquerydata.nct_id;
            const studyType = mysqlquerydata.study_type;
            const briefTitle = mysqlquerydata.brief_title;
            const status = mysqlquerydata.overall_status;
            const phaseData = mysqlquerydata.phase;
            const enrollmentData = mysqlquerydata.enrollment;
            const enrollmentType = mysqlquerydata.enrollment_type;
            const summary = mysqlquerydata.brief_summary;

            cy.log("nct id = " + nctid);
            const jsonData = {
              nct_id: nctid,
              study_type: studyType,
              brief_title: briefTitle,
              overall_status: status,
              phase: phaseData,
              enrollment:enrollmentData,
              enrollment_type: enrollmentType,
              brief_summary: summary,
            };
            console.log(jsonData);
            dataToWrite.push(jsonData); // Accumulate the data in the array
          });
        })
        .then(() => {
          cy.writeFile(filePath, JSON.stringify(dataToWrite), {
            timeout: 60000,
          }).then(() => {
            cy.log(`Data written to JSON file successfully: ${filePath}`);
          });
        });
    });
  });


function mysqldata(json) {
    json = json || "[]";
    const search = ["\\n", "\\r", "\\f", "\\t", "\\b", "\\\\", "'", '"', '{"', '":', '":"', '",', '","', '"}', ':""', '}"', '"{', '""', '/:/g'];
    const replace = ["", "", "", "", "", "", "&#039;", '"', '{"', '":', '":"', '",', '","', '"}', '":"', '}', '{', '"', '":"'];
    for (let i = 0; i < search.length; i++) {
      json = json.replaceAll(new RegExp(search[i], "g"), replace[i]);
    }
    return json;
  }