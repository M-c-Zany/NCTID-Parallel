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

Cypress.config("taskTimeout", 1000000);
describe("Demo postgres", () => {

 

  it("postgres data", () => {
    //call the task
    cy.task("READFROMDB", {
      //Get config from cypress.config.js
      dbConfig: Cypress.config("DB"),
      //sql we want to perform

      sql: "SELECT studies.nct_id FROM studies LEFT OUTER JOIN LATERAL ( SELECT all_conditions.names FROM all_conditions WHERE studies.nct_id = all_conditions.nct_id LIMIT 1 ) AS all_conditions ON TRUE LEFT OUTER JOIN LATERAL ( SELECT all_design_outcomes.names FROM all_design_outcomes WHERE studies.nct_id = all_design_outcomes.nct_id LIMIT 1 ) AS all_design_outcomes ON TRUE LEFT OUTER JOIN LATERAL ( SELECT all_id_information.names FROM all_id_information WHERE studies.nct_id = all_id_information.nct_id LIMIT 1 ) AS all_id_information ON TRUE LEFT OUTER JOIN LATERAL ( SELECT all_interventions.names FROM all_interventions WHERE studies.nct_id = all_interventions.nct_id LIMIT 1 ) AS all_interventions ON TRUE LEFT OUTER JOIN LATERAL ( SELECT all_sponsors.names FROM all_sponsors WHERE studies.nct_id = all_sponsors.nct_id LIMIT 1 ) AS all_sponsors ON TRUE LEFT OUTER JOIN LATERAL ( SELECT brief_summaries.description FROM brief_summaries WHERE studies.nct_id = brief_summaries.nct_id LIMIT 1 ) AS brief_summaries ON TRUE LEFT OUTER JOIN LATERAL ( SELECT designs.allocation, designs.intervention_model, designs.observational_model, designs.primary_purpose, designs.time_perspective, designs.masking, designs.masking_description, designs.intervention_model_description, designs.subject_masked, designs.caregiver_masked, designs.investigator_masked, designs.outcomes_assessor_masked FROM designs WHERE studies.nct_id = designs.nct_id LIMIT 1 ) AS designs ON TRUE LEFT OUTER JOIN LATERAL ( SELECT detailed_descriptions.description FROM detailed_descriptions WHERE studies.nct_id = detailed_descriptions.nct_id LIMIT 1 ) AS detailed_descriptions ON TRUE LEFT OUTER JOIN LATERAL ( SELECT id_information.id_value FROM id_information WHERE studies.nct_id = id_information.nct_id LIMIT 1 ) AS id_information ON TRUE ;",
    }).then((result) => {
      console.log(result);

      const filePath = "cypress/fixtures/postgres.json";
      // result.forEach((row) => {

      //   row.enrollment = "\""+row.enrollment+"\"";
      //   row.enrollment = row.enrollment.replace("\"", "");
      //   row.enrollment = row.enrollment.replace("\"", "");

      // });
  
      // Write data to JSON file
      cy.writeFile(filePath, JSON.stringify(result)).then(() => {
        cy.log(`Data written to JSON file successfully: ${filePath}`);
      });

    });
  });

  it("mysql data", () => {
    Cypress.config("taskTimeout", 900000);
    const dataToWrite = []; // Array to accumulate the data
    cy.task(
      "queryDB",
      "SELECT post_title FROM bscience_posts INNER JOIN bscience_postmeta ON bscience_posts.ID = bscience_postmeta.post_id WHERE bscience_postmeta.meta_key = 'trial_status_change' ;"

      // "SELECT post_title FROM bscience_posts INNER JOIN bscience_postmeta ON bscience_posts.ID = bscience_postmeta.post_id WHERE bscience_postmeta.meta_key = 'trial_status_change' AND bscience_postmeta.meta_value = '2023-05-11' AND bscience_posts.post_title NOT IN ('NCT00003042','NCT05855746','NCT00408005','NCT00453674','NCT00598026','NCT00691223','NCT00697411','NCT00987532')  order by post_title LIMIT 4;"

    ).then((result2) => {
      console.log('result',result2);
      //cy.wrap(result2)
        //.each((value) => {
          // cy.request({
          //   method: "GET",
          //   url:
          //     "https://boldersciencestage.pixacore.com/scripts/tmp/import/" +
          //     value.post_title +
          //     ".json",
          //   headers: {
          //     "Content-Type": "application/json",
          //   },
          //})
          // .then((response) => {
          //   console.log(response.body.meta_input.aact_data);

          //   res = JSON.stringify(response.body.meta_input.aact_data);
          //  // console.log(res);
          //   const mysqlquerydata = JSON.parse(mysqldata(res));

            // cy.log("SQL query data = " + JSON.stringify(mysqlquerydata));
            // const nctid = mysqlquerydata.nct_id;
            // const studyType = mysqlquerydata.study_type;
            // const briefTitle = mysqlquerydata.brief_title;
            // const status = mysqlquerydata.overall_status;
            // const phaseData = mysqlquerydata.phase;
            // const enrollmentData = mysqlquerydata.enrollment;
            // const enrollmentType = mysqlquerydata.enrollment_type;
            // const summary = mysqlquerydata.brief_summary;

            //cy.log("nct id = " + nctid);
            // const jsonData = {
            //   nct_id: nctid,
            //   study_type: studyType,
            //   brief_title: briefTitle,
            //   overall_status: status,
            //   phase: phaseData,
            //   enrollment:enrollmentData,
            //   enrollment_type: enrollmentType,
            //   brief_summary: summary,
            // };
        //     console.log(jsonData);
        //     dataToWrite.push(jsonData); // Accumulate the data in the array
        //   });
        // })
        // .then(() => {
          cy.writeFile(filePath, JSON.stringify(result2), {
            timeout: 60000,
          }).then(() => {
            cy.log(`Data written to JSON file successfully: ${filePath}`);
          });
      //  });
    });
  });

  it.only("Matching the two databases NCTIDs", () => {
    // Load fixture data for MySQL and Postgres
    cy.fixture("postgres.json").then((postgresData) => {
      cy.fixture("mysql.json").then((mysqlData) => {
        // Extract nct_id from both data sources
        const data1NCTIDs = extractNCTIDpost(postgresData);
        const data2NCTIDs = extractNCTIDmysql(mysqlData);
  
        console.log("postgres NCTIDs:", data1NCTIDs);
        console.log("mysql NCTIDs:", data2NCTIDs);
  
        // Compare the NCTIDs to find matches
        const matchingNCTIDs = findMatchingNCTIDs(data1NCTIDs, data2NCTIDs);
        console.log("Matching NCTIDs:", matchingNCTIDs);
  
        // Assert or perform further actions based on matchingNCTIDs
        // For example, you can use Cypress assertions to verify the matches
        expect(matchingNCTIDs.length).to.be.greaterThan(0);
      });
    });
  });
  
  // Function to extract NCTIDs from data
  function extractNCTIDpost(data1) {
    // Assuming 'nct_id' is the correct property in your JSON data
    return data1.map(entry => entry.nct_id);
  }

  // Function to extract NCTIDs from data
  function extractNCTIDmysql(data2) {
    // Assuming 'nct_id' is the correct property in your JSON data
    return data2.map(entry => entry.post_title);
  }
  
  
  // Function to find matching NCTIDs
  function findMatchingNCTIDs(data1NCTIDs, data2NCTIDs) {
   
    return data1NCTIDs.filter(nct_id => data2NCTIDs.includes(post_title));
  }
  
  
    
  
  
});
