// Set task timeout and file path for data storage
Cypress.config("taskTimeout", 9000000);
const filePath = "cypress/fixtures/mysql.json";
let res;

// Describe the test suite
describe("Fetching data from API and storing it in batch wise and checking elements in all detail pages", () => {
  // Before each test, set up the environment by visiting the website and logging in
  beforeEach(() => {
    cy.viewport(1920, 1080);
    cy.visit("https://boldersciencestage.pixacore.com/");
    // Enter password and click on Login
    cy.get("#password_protected_pass").type("BolderSc!ence");
    cy.get("#wp-submit").click();
  });

  // Test case: Fetch data from MySQL database and store it in JSON files in batches
  it("mysql data", () => {
    // Set the batch size and initialize an array to accumulate the data
    const batchSize = 1000;
    const dataToWrite = [];

    // Fetch data from MySQL using a custom task
    cy.task(
      "queryDB",
      "SELECT post_title FROM bscience_posts INNER JOIN bscience_postmeta ON bscience_posts.ID = bscience_postmeta.post_id WHERE bscience_postmeta.meta_key = 'trial_status_change';"
    ).then((result2) => {
      console.log("result", result2);

      // Split the data into batches
      for (let i = 0; i < result2.length; i += batchSize) {
        const batch = result2.slice(i, i + batchSize);
        dataToWrite.push(batch);
      }

      // Write each batch to a separate JSON file
      const writePromises = dataToWrite.map((batch, index) => {
        const batchFilePath = `${filePath}_${index}.json`;
        return cy
          .writeFile(batchFilePath, JSON.stringify(batch), {
            timeout: 60000,
          })
          .then(() => {
            console.log(
              `Data batch ${index} written to JSON file successfully: ${batchFilePath}`
            );
          });
      });

      // Wait for all write operations to complete
      return Promise.all(writePromises);
    });
  });

  it.skip("visit nct ID data", () => {
    const selectors = [
      {
        selector:
          "#studyDet-eligibility-criteria > .list-unstyled > :nth-child(1) > span",
        name: "Age",
      },
      {
        selector:
          "#studyDet-eligibility-criteria > .list-unstyled > :nth-child(2) > span",
        name: "Eligibility",
      },
      { selector: ".floatNone", name: "Eligible for Study" },
      {
        selector: "#studyDet-contact-and-locations > :nth-child(3)",
        name: "Contact and Locations",
      },
      {
        selector: ":nth-child(2) > .list-unstyled > :nth-child(1) > .mb-0",
        name: "Clinical gov identified",
      },
      {
        selector: ":nth-child(3) > .list-unstyled > :nth-child(1) > .mb-0",
        name: "First posted",
      },
      { selector: ".list-left-border.mb-0 > .mb-0", name: "Recruiting" },
      {
        selector: "#studyDet-description > :nth-child(3)",
        name: "Brief Summary",
      },
      {
        selector:
          "#studyDet-description > .list-unstyled > :nth-child(3) > span",
        name: "Phase",
      },
      {
        selector: "#studyDet-description > :nth-child(6)",
        name: "Study detailed description",
      },
      {
        selector: ".border-right > .list-unstyled > :nth-child(1) > span",
        name: "Study type",
      },
      {
        selector: ".border-right > .list-unstyled > :nth-child(2) > span",
        name: "Estimate enrolment",
      },
      {
        selector: ".border-right > .list-unstyled > :nth-child(4) > span",
        name: "Time perspective",
      },
      {
        selector: ":nth-child(2) > .list-unstyled > :nth-child(1) > span",
        name: "Actual study start date",
      },
      {
        selector: ":nth-child(2) > .list-unstyled > :nth-child(2) > span",
        name: "Estimate primary completion date",
      },
      {
        selector: ":nth-child(2) > .list-unstyled > :nth-child(3) > span",
        name: "Estimate completion date",
      },
      { selector: "#studyDet-description", name: "Study Description" },
      { selector: "#studyDet-design", name: "Study Design" },
      {
        selector: "#studyDet-arms-interventions",
        name: "Arms and Interventions",
      },
      { selector: "#studyDet-outcome-measures", name: "Outcome Measures" },
      {
        selector: "#studyDet-eligibility-criteria",
        name: "Eligibility Criteria",
      },
      {
        selector: "#studyDet-contact-and-locations",
        name: "Contacts and Locations",
      },
      { selector: "#studyDet-more-information", name: "More Information" },
    ];

    // Initialize an object to store empty elements for all NCTIDs
    const allEmptyElements = {};

    // Read data from a JSON file containing NCTIDs
    cy.fixture("mysql.json").then((jsonData) => {
      // Visit each NCT ID's detail page and check specific elements
      Cypress.Promise.each(jsonData, (item) => {
        const nctId = item.post_title;
        const url = "https://boldersciencestage.pixacore.com/trial/" + nctId;

        // Initialize an array to store empty elements for this NCTID
        const emptyElements = [];

        // Visit the URL and check elements
        return cy.visit(url, { failOnStatusCode: false }).then((response) => {
          // Handle 500 Internal Server Error
          if (response.status === 500) {
            console.error(`Error: 500 Internal Server Error for URL: ${url}`);
          }

          // Check each selector for empty elements
          cy.wrap(selectors).each((selectorItem) => {
            cy.get(selectorItem.selector, { timeout: 10000 })
              .should(($element) => {
                const text = $element.text().trim();
                // If element is empty, add its name to the emptyElements array
                if (text === "") {
                  emptyElements.push(selectorItem.name);
                }
              })
              .then(null, () => {
                // Handle selector not found error
                console.error(
                  `Selector not found for NCTID ${nctId}: ${selectorItem.selector}`
                );
              });
          });

          // Store empty elements for this NCTID in the allEmptyElements object
          allEmptyElements[nctId] = emptyElements;

          // Write the result to a JSON file after each visit is complete
          cy.writeFile("cypress/fixtures/emptydata0.json", allEmptyElements);
        });
      }).then(() => {
        // After all visits are complete, print the final result for further analysis
        console.log(allEmptyElements);
      });
    });
  });
});
