////<reference type ="cypress"/>
import "cypress-file-upload";
let resultID;
const filePath = "cypress/fixtures/mysql.json";
const fieldToWrite = [];
const responses = [];
var remresultID;
let mysqlquerydata;
let fieldData;
let nctid;
let res;

Cypress.config("taskTimeout", 600000);
describe("Demo postgres", () => {
  it("Demo", () => {
    //call the task
    cy.task("READFROMDB", {
      //Get config from cypress.config.js
      dbConfig: Cypress.config("DB"),
      //sql we want to perform

      sql: "SELECT studies.nct_id, studies.study_type, studies.brief_title, studies.overall_status, studies.phase, studies.enrollment, studies.enrollment_type,  brief_summaries.description as brief_summary FROM studies LEFT OUTER JOIN LATERAL ( SELECT all_conditions.names FROM all_conditions WHERE studies.nct_id = all_conditions.nct_id LIMIT 1 ) AS all_conditions ON TRUE LEFT OUTER JOIN LATERAL ( SELECT all_design_outcomes.names FROM all_design_outcomes WHERE studies.nct_id = all_design_outcomes.nct_id LIMIT 1 ) AS all_design_outcomes ON TRUE LEFT OUTER JOIN LATERAL ( SELECT all_id_information.names FROM all_id_information WHERE studies.nct_id = all_id_information.nct_id LIMIT 1 ) AS all_id_information ON TRUE LEFT OUTER JOIN LATERAL ( SELECT all_interventions.names FROM all_interventions WHERE studies.nct_id = all_interventions.nct_id LIMIT 1 ) AS all_interventions ON TRUE LEFT OUTER JOIN LATERAL ( SELECT all_sponsors.names FROM all_sponsors WHERE studies.nct_id = all_sponsors.nct_id LIMIT 1 ) AS all_sponsors ON TRUE LEFT OUTER JOIN LATERAL ( SELECT brief_summaries.description FROM brief_summaries WHERE studies.nct_id = brief_summaries.nct_id LIMIT 1 ) AS brief_summaries ON TRUE LEFT OUTER JOIN LATERAL ( SELECT designs.allocation, designs.intervention_model, designs.observational_model, designs.primary_purpose, designs.time_perspective, designs.masking, designs.masking_description, designs.intervention_model_description, designs.subject_masked, designs.caregiver_masked, designs.investigator_masked, designs.outcomes_assessor_masked FROM designs WHERE studies.nct_id = designs.nct_id LIMIT 1 ) AS designs ON TRUE LEFT OUTER JOIN LATERAL ( SELECT detailed_descriptions.description FROM detailed_descriptions WHERE studies.nct_id = detailed_descriptions.nct_id LIMIT 1 ) AS detailed_descriptions ON TRUE LEFT OUTER JOIN LATERAL ( SELECT id_information.id_value FROM id_information WHERE studies.nct_id = id_information.nct_id LIMIT 1 ) AS id_information ON TRUE WHERE studies.last_update_posted_date = '2023-05-11' order by studies.nct_id desc LIMIT 3;",
    }).then((result) => {
      console.log(result);

      const filePath = "cypress/fixtures/postgres.json";
      result.forEach((row) => {
        row.enrollment = '"' + row.enrollment + '"';
        row.enrollment = row.enrollment.replace('"', "");
        row.enrollment = row.enrollment.replace('"', "");
      });

      // Write data to JSON file
      cy.writeFile(filePath, JSON.stringify(result)).then(() => {
        cy.log(`Data written to JSON file successfully: ${filePath}`);
      });
    });
  });

  it.only("should do something with the database", () => {
    Cypress.config("taskTimeout", 900000);
    const dataToWrite = []; // Array to accumulate the data
    cy.task(
      "queryDB",
      "SELECT post_title FROM bscience_posts INNER JOIN bscience_postmeta ON bscience_posts.ID = bscience_postmeta.post_id WHERE bscience_postmeta.meta_key = 'trial_status_change' AND bscience_postmeta.meta_value = '2023-05-11' AND  post_title = 'NCT00453674' ;"

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
              enrollment: enrollmentData,
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
    const search = [
      "\\n",
      "\\r",
      "\\f",
      "\\t",
      "\\b",
      "\\\\",
      "'",
      '"',
      '{"',
      '":',
      '":"',
      '",',
      '","',
      '"}',
      ':""',
      '}"',
      '"{',
      '""',
      "/:/g",
    ];
    const replace = [
      "",
      "",
      "",
      "",
      "",
      "",
      "&#039;",
      '"',
      '{"',
      '":',
      '":"',
      '",',
      '","',
      '"}',
      '":"',
      "}",
      "{",
      '"',
      '":"',
    ];
    for (let i = 0; i < search.length; i++) {
      json = json.replaceAll(new RegExp(search[i], "g"), replace[i]);
    }
    return json;
  }

  it.only("Matching the two databases NCTIDs", () => {
    let nct_id;

    cy.readFile("cypress/fixtures/postgres.json").then((file1Content) => {
      const data1 = extractData(file1Content);

      cy.readFile("cypress/fixtures/mysql.json").then((file2Content) => {
        const data2 = extractData(file2Content);

        const missingData = compareData(data1, data2);

        if (Object.keys(missingData).length === 0) {
          console.log("All data match.");
        } else {
          console.log("Missing data:", missingData);
        }
        const alldata = { nct_id, missingData };
        cy.writeFile(
          "missingData.json",
          JSON.stringify(missingData, null, 2),
          "utf-8"
        );
      });
    });
  });

  function extractData(content) {
    return {
      nct_id: content.map((row) => row.nct_id),
      study_first_submitted_date: content.map(
        (row) => row.study_first_submitted_date
      ),
      study_type: content.map((row) => row.study_type),
      brief_title: content.map((row) => row.brief_title),
      overall_status: content.map((row) => row.overall_status),
      phase: content.map((row) => row.phase),
      enrollment: content.map((row) => row.enrollment),
      enrollment_type: content.map((row) => row.enrollment_type),
      brief_summary: content.map((row) => row.brief_summary),
    };
  }

  function compareData(data1, data2) {
    const missingData = {};

    for (let nctIndex = 0; nctIndex < data1.nct_id.length; nctIndex++) {
      const nctId = data1.nct_id[nctIndex];

      let match = true;
      const matchedData = {};

      for (const key in data1) {
        const value1 = data1[key][nctIndex];
        const value2 = data2[key] ? data2[key][nctIndex] : undefined;

        if (value1 !== value2) {
          match = false;
          if (!(nctId in missingData)) {
            missingData[nctId] = {};
          }

          missingData[nctId][key] = value1;
        } else {
          matchedData[key] = value1;
        }
      }

      if (match) {
        console.log("Matching data:", matchedData);
      }
    }

    return missingData;
  }

  function findMissingData(array1, array2) {
    return array1.filter((value) => !array2.includes(value));
  }

  function arraysAreEqual(array1, array2) {
    return (
      array1.length === array2.length &&
      array1.every((value, index) => value === array2[index])
    );
  }
});
