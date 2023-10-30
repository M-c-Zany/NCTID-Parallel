Cypress.config("taskTimeout", 9000000);
const filePath = "cypress/fixtures/mysql.json";
let res;

describe("Fetching data from API and storing it in batch wise and checking elements in all detail pages", () => {
  beforeEach(() => {
    cy.viewport(1920, 1080);
    cy.visit("https://boldersciencestage.pixacore.com/");
    //Enter password
    cy.get("#password_protected_pass").type("BolderSc!ence");
    //Click on Login
    cy.get("#wp-submit").click();
  });

  it("mysql data", () => {
    Cypress.config("taskTimeout", 900000);
    const batchSize = 150; // Specify the size of each batch
    const dataToWrite = []; // Array to accumulate the data

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

      // Write each batch to the JSON file
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
});
