Cypress.config("taskTimeout", 1000000);
describe("Demo postgres", () => {
  const filePath = 'cypress/fixtures/missingValues.json';
  it("mysql data", () => {
    cy.visit('https://boldersciencestage.pixacore.com/')
    //Enter password 
    cy.get('#password_protected_pass').type('BolderSc!ence');
    //Click on Login 
    cy.get('#wp-submit').click();
    Cypress.config("taskTimeout", 900000);
    const dataToWrite = []; // Array to accumulate the data 
    cy.task(
      "queryDB",
      "SELECT post_title FROM bscience_posts INNER JOIN bscience_postmeta ON bscience_posts.ID = bscience_postmeta.post_id WHERE bscience_postmeta.meta_key = 'trial_status_change' AND post_title IN ('NCT04771481', 'NCT00411879','NCT05583110','NCT05715346','nct05754957');"
    ).then((result2) => {
      console.log('result', result2);
      // Iterate through the result2 array and add entries to dataToWrite 
      result2.forEach((value) => {
        cy.visit('https://boldersciencestage.pixacore.com/trial/' + value.post_title);
        // Initialize the entry object 
        const entry = {
          post_title: value.post_title,
          isEmpty: false, // Initially set to false 
        };
        // Check if any <li> elements are empty within #studyDet-contact-and-locations 
        cy.get('#studyDet-contact-and-locations li').each(($li) => {
          const text = $li.text().trim();
          if (text === '') {
            cy.log('Found an empty <li> element in #studyDet-contact-and-locations');
            entry.isEmpty = true;
          }
        });
        // Push the entry to dataToWrite 
        dataToWrite.push(entry);
      });
    }).then(() => {
      // Filter dataToWrite to include only entries with isEmpty: true 
      const filteredData = dataToWrite.filter((entry) => entry.isEmpty);
      // Write filtered data to a JSON file 
      cy.writeFile(filePath, JSON.stringify(filteredData), {
        timeout: 60000,
      }).then(() => {
        cy.log(`Data written to JSON file successfully: ${filePath}`);
      });
    });
  });
});

Cypress.config("taskTimeout", 1000000);

describe("Demo postgres", () => {

  const filePath = 'cypress/fixtures/missingValues.json';
  it("mysql data", () => {
    cy.visit('https://boldersciencestage.pixacore.com/')
    //Enter password 
    cy.get('#password_protected_pass').type('BolderSc!ence');
    //Click on Login 
    cy.get('#wp-submit').click();
    Cypress.config("taskTimeout", 900000);
    const dataToWrite = []; // Array to accumulate the data 
    cy.task(
      "queryDB",
      "SELECT post_title FROM bscience_posts INNER JOIN bscience_postmeta ON bscience_posts.ID = bscience_postmeta.post_id WHERE bscience_postmeta.meta_key = 'trial_status_change' AND post_title IN ('NCT04771481', 'NCT00411879','NCT05583110','NCT05715346','nct05754957');"
    ).then((result2) => {
      console.log('result', result2);
      result2.forEach((value) => {
        const entry = {
          post_title: value.post_title,
          isEmpty: true, // Initially set to true 
        };
        // Push the entry to dataToWrite 
        dataToWrite.push(entry);
        cy.visit('https://boldersciencestage.pixacore.com/trial/' + value.post_title);
      });
    }).then(() => {
      // Filter dataToWrite to include only entries with isEmpty: true
      const filteredData = dataToWrite.filter((entry) => entry.isEmpty);
      // Write data to the JSON file, even if it's empty 
      cy.writeFile(filePath, JSON.stringify(filteredData), {
        timeout: 60000,
      }).then(() => {
        cy.log(`Data written to JSON file successfully: ${filePath}`);
      });
    });
  });
});


