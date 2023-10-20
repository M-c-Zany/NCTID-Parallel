////<reference type="cypress"/>
import "cypress-file-upload";

const filePath = "cypress/fixtures/mysql.json";

Cypress.config("taskTimeout", 1000000);

describe("Demo databases", () => {
  before(() => {
    // Call the task and cache data
    cy.task("READFROMDB", {
      dbConfig: Cypress.config("DB"),
      sql: "SELECT ...", // Your SQL query here
    }).then((result) => {
      cy.writeFile("cypress/fixtures/postgresData.json", JSON.stringify(result));
    });
  });

  it("mysql data", () => {
    Cypress.config("taskTimeout", 900000);
    cy.task("queryDB", "SELECT ...").then((result2) => {
      cy.writeFile(filePath, JSON.stringify(result2), { timeout: 60000 }).then(() => {
        cy.log(`Data written to JSON file successfully: ${filePath}`);
      });
    });
  });

  it("Matching the two databases NCTIDs", () => {
    // Wait for the file to be generated
    cy.wait(5000); // Adjust the wait time as needed

    cy.readFile("cypress/fixtures/postgresData.json").then((postgresData) => {
      cy.fixture("mysql.json").then((mysqlData) => {
        const data1NCTIDs = extractData(postgresData);
        const data2NCTIDs = extractData(mysqlData);

        const missingData = compareData(data1NCTIDs, data2NCTIDs);

        if (Object.keys(missingData).length === 0) {
          cy.log("All data match.");
        } else {
          cy.writeFile(
            "cypress/fixtures/missingData.json",
            JSON.stringify(missingData, null, 2),
            "utf-8",
            { timeout: 10000 }
          );
        }
      });
    });
  });
});

function extractData(content) {
  return {
    nct_id: content.map((row) => row.nct_id),
  };
}

function compareData(data1NCTIDs, data2NCTIDs) {
  const missingData = {};

  for (const nctId of data1NCTIDs.nct_id) {
    if (!data2NCTIDs.nct_id.includes(nctId)) {
      missingData[nctId] = nctId;
    }
  }

  return missingData;
}
