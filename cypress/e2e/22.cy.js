Cypress.config("taskTimeout", 9000000);
const filePath = "cypress/fixtures/mysql.json";
let res;
const filePaths = {
  dataFile1: "mysql.json_1245.json",
  dataFile2: "mysql.json_1246.json"
};

const missing_elements = {
  missing1: "cypress/fixtures/missing_elements1245.json",
  missing2: "cypress/fixtures/missing_elements1246.json"
};
function fetchDataAndCheckElements(dataFilePath, outputFilePath) {
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

  const allEmptyElements = {};

  cy.fixture(dataFilePath).then((jsonData) => {
    Cypress.Promise.each(jsonData, (item) => {
      const nctId = item.post_title;
      const url = `https://boldersciencestage.pixacore.com/trial/${nctId}`;

      const emptyElements = [];

      return cy.visit(url, { failOnStatusCode: false }).then((response) => {
        if (response.status === 500) {
          console.error(`Error: 500 Internal Server Error for URL: ${url}`);
        }

        cy.wrap(selectors).each((selectorItem) => {
          cy.get(selectorItem.selector, { timeout: 10000 })
            .should(($element) => {
              const text = $element.text().trim();
              if (text === "") {
                emptyElements.push(selectorItem.name);
              }
            })
            .then(null, () => {
              console.error(`Selector not found for NCTID ${nctId}: ${selectorItem.selector}`);
            });
        });

        allEmptyElements[nctId] = emptyElements;

        cy.writeFile(outputFilePath, allEmptyElements);
      });
    }).then(() => {
      console.log(allEmptyElements);
    });
  });
}

describe("Fetching data from API and storing it in batch wise and checking elements in all detail pages", () => {
  beforeEach(() => {
    cy.viewport(1920, 1080);
    cy.visit("https://boldersciencestage.pixacore.com/");
    cy.get("#password_protected_pass").type("BolderSc!ence");
    cy.get("#wp-submit").click();
  });

  it("visit nct ID data - batch 1", () => {
    fetchDataAndCheckElements(filePaths.dataFile1, missing_elements.missing1);
  });

  it("visit nct ID data - batch 2", () => {
    fetchDataAndCheckElements(filePaths.dataFile2, missing_elements.missing2);
  });
});
