Cypress.config("taskTimeout", 9000000);
const filePath = "cypress/fixtures/mysql.json";
let res;
const filePaths = {
  dataFile1: "mysql.json_1257.json",
  dataFile2: "mysql.json_1258.json"
};

const missing_elements = {
  missing1: "cypress/fixtures/missing_elements1257.json",
  missing2: "cypress/fixtures/missing_elements1258.json"
};

describe("Batch 1", () => {
  beforeEach(() => {
    cy.viewport(1920, 1080);
    cy.visit("https://boldersciencestage.pixacore.com/");
    //Enter password
    cy.get("#password_protected_pass").type("BolderSc!ence");
    //Click on Login
    cy.get("#wp-submit").click();
  });

  it("visit nct ID data", () => {
    const selectors = [
      { selector: "#studyDet-eligibility-criteria > .list-unstyled > :nth-child(1) > span", name: "Age", },
      { selector: "#studyDet-eligibility-criteria > .list-unstyled > :nth-child(2) > span", name: "Eligibility", },
      { selector: ".floatNone", name: "Eligible for Study" },
      { selector: "#studyDet-contact-and-locations > :nth-child(3)", name: "Contact and Locations", },
      { selector: ":nth-child(2) > .list-unstyled > :nth-child(1) > .mb-0", name: "Clinical gov identified", },
      { selector: ":nth-child(3) > .list-unstyled > :nth-child(1) > .mb-0", name: "First posted", },
      { selector: ".list-left-border.mb-0 > .mb-0", name: "Recruiting" },
      { selector: "#studyDet-description > :nth-child(3)", name: "Brief Summary", },
      { selector: "#studyDet-description > .list-unstyled > :nth-child(3) > span", name: "Phase", },
      { selector: "#studyDet-description > :nth-child(6)", name: "Study detailed description", },
      { selector: ".border-right > .list-unstyled > :nth-child(1) > span", name: "Study type", },
      { selector: ".border-right > .list-unstyled > :nth-child(2) > span", name: "Estimate enrolment" },
      { selector: ".border-right > .list-unstyled > :nth-child(4) > span", name: "Time perspective", },
      { selector: ":nth-child(2) > .list-unstyled > :nth-child(1) > span", name: "Actual study start date", },
      { selector: ":nth-child(2) > .list-unstyled > :nth-child(2) > span", name: "Estimate primary completion date", },
      { selector: ":nth-child(2) > .list-unstyled > :nth-child(3) > span", name: "Estimate completion date", },
      { selector: "#studyDet-description", name: "Study Description" },
      { selector: "#studyDet-design", name: "Study Design" },
      { selector: "#studyDet-arms-interventions", name: "Arms and Interventions", },
      { selector: "#studyDet-outcome-measures", name: "Outcome Measures" },
      { selector: "#studyDet-eligibility-criteria", name: "Eligibility Criteria", },
      { selector: "#studyDet-contact-and-locations", name: "Contacts and Locations", },
      { selector: "#studyDet-more-information", name: "More Information" },
    ];

    // Initialize an object to store the empty elements for all NCTIDs
    const allEmptyElements = {};

    cy.fixture(filePaths.dataFile1).then((jsonData) => {
      // Use Cypress.Promise.each to visit each URL in sequence
      Cypress.Promise.each(jsonData, (item) => {
        const nctId = item.post_title;
        const url = "https://boldersciencestage.pixacore.com/trial/" + nctId;

        // Initialize an array to store the empty elements for this NCTID
        const emptyElements = [];

        return cy.visit(url, { failOnStatusCode: false }).then((response) => {
          if (response.status === 500) {
            console.error(`Error: 500 Internal Server Error for URL: ${url}`);
          }

          // Check the text for each selector
          cy.wrap(selectors).each((selectorItem) => {
            // Use cy.get with should() to check for the element
            cy.get(selectorItem.selector, { timeout: 10000 })
              .should(($element) => {
                const text = $element.text().trim();
                if (text === "") {
                  emptyElements.push(selectorItem.name);
                }
              })
              .then(null, () => {
                // Handle the case when the selector is not found by logging a message
                console.error(
                  `Selector not found for NCTID ${nctId}: ${selectorItem.selector}`
                );
              });
          });

          // Add the array of empty elements for this NCTID to the allEmptyElements object
          allEmptyElements[nctId] = emptyElements;

          // Write the result to a JSON file after each visit is complete
          cy.writeFile(missing_elements.missing1, allEmptyElements);
        });
      }).then(() => {
        // After all visits are complete, you can access the final result
        console.log(allEmptyElements); // Print the final result for further analysis
      });
    });
  });
});

describe("Batch 2", () => {
  beforeEach(() => {
    cy.viewport(1920, 1080);
    cy.visit("https://boldersciencestage.pixacore.com/");
    //Enter password
    cy.get("#password_protected_pass").type("BolderSc!ence");
    //Click on Login
    cy.get("#wp-submit").click();
  });

  it("visit nct ID data", () => {
    const selectors = [
      { selector: "#studyDet-eligibility-criteria > .list-unstyled > :nth-child(1) > span", name: "Age", },
      { selector: "#studyDet-eligibility-criteria > .list-unstyled > :nth-child(2) > span", name: "Eligibility", },
      { selector: ".floatNone", name: "Eligible for Study" },
      { selector: "#studyDet-contact-and-locations > :nth-child(3)", name: "Contact and Locations", },
      { selector: ":nth-child(2) > .list-unstyled > :nth-child(1) > .mb-0", name: "Clinical gov identified", },
      { selector: ":nth-child(3) > .list-unstyled > :nth-child(1) > .mb-0", name: "First posted", },
      { selector: ".list-left-border.mb-0 > .mb-0", name: "Recruiting" },
      { selector: "#studyDet-description > :nth-child(3)", name: "Brief Summary", },
      { selector: "#studyDet-description > .list-unstyled > :nth-child(3) > span", name: "Phase", },
      { selector: "#studyDet-description > :nth-child(6)", name: "Study detailed description", },
      { selector: ".border-right > .list-unstyled > :nth-child(1) > span", name: "Study type", },
      { selector: ".border-right > .list-unstyled > :nth-child(2) > span", name: "Estimate enrolment" },
      { selector: ".border-right > .list-unstyled > :nth-child(4) > span", name: "Time perspective", },
      { selector: ":nth-child(2) > .list-unstyled > :nth-child(1) > span", name: "Actual study start date", },
      { selector: ":nth-child(2) > .list-unstyled > :nth-child(2) > span", name: "Estimate primary completion date", },
      { selector: ":nth-child(2) > .list-unstyled > :nth-child(3) > span", name: "Estimate completion date", },
      { selector: "#studyDet-description", name: "Study Description" },
      { selector: "#studyDet-design", name: "Study Design" },
      { selector: "#studyDet-arms-interventions", name: "Arms and Interventions", },
      { selector: "#studyDet-outcome-measures", name: "Outcome Measures" },
      { selector: "#studyDet-eligibility-criteria", name: "Eligibility Criteria", },
      { selector: "#studyDet-contact-and-locations", name: "Contacts and Locations", },
      { selector: "#studyDet-more-information", name: "More Information" },
    ];

    // Initialize an object to store the empty elements for all NCTIDs
    const allEmptyElements = {};

    cy.fixture(filePaths.dataFile2).then((jsonData) => {
      // Use Cypress.Promise.each to visit each URL in sequence
      Cypress.Promise.each(jsonData, (item) => {
        const nctId = item.post_title;
        const url = "https://boldersciencestage.pixacore.com/trial/" + nctId;

        // Initialize an array to store the empty elements for this NCTID
        const emptyElements = [];

        return cy.visit(url, { failOnStatusCode: false }).then((response) => {
          if (response.status === 500) {
            console.error(`Error: 500 Internal Server Error for URL: ${url}`);
          }

          // Check the text for each selector
          cy.wrap(selectors).each((selectorItem) => {
            // Use cy.get with should() to check for the element
            cy.get(selectorItem.selector, { timeout: 10000 })
              .should(($element) => {
                const text = $element.text().trim();
                if (text === "") {
                  emptyElements.push(selectorItem.name);
                }
              })
              .then(null, () => {
                // Handle the case when the selector is not found by logging a message
                console.error(
                  `Selector not found for NCTID ${nctId}: ${selectorItem.selector}`
                );
              });
          });

          // Add the array of empty elements for this NCTID to the allEmptyElements object
          allEmptyElements[nctId] = emptyElements;

          // Write the result to a JSON file after each visit is complete
          cy.writeFile(missing_elements.missing2, allEmptyElements);
        });
      }).then(() => {
        // After all visits are complete, you can access the final result
        console.log(allEmptyElements); // Print the final result for further analysis
      });
    });
  });
});