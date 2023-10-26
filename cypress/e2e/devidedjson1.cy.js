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

  it.only("visit nct ID data", () => {
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
  cy.fixture("mysql.json_0.json").then((jsonData) => {
    // Initialize an object to store empty elements for all NCTIDs
    const allEmptyElements = {};

    return Cypress.Promise.each(jsonData, (item) => {
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
      });
    }).then(() => {
      // Write the result to a separate JSON file for each NCT ID
      Object.keys(allEmptyElements).forEach((nctId) => {
        cy.writeFile(`cypress/fixtures/emptydata_${nctId}.json`, allEmptyElements[nctId]);
      });

      // After all visits are complete, print the final result for further analysis
      console.log(allEmptyElements);
      });
    });
  });
});
