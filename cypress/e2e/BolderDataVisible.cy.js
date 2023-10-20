Cypress.config("taskTimeout", 1000000);
describe("Demo postgres", () => {
  const filePath = "cypress/fixtures/missingValues.json";
  it("mysql data", () => {
    cy.visit("https://boldersciencestage.pixacore.com/");
    //Enter password
    cy.get("#password_protected_pass").type("BolderSc!ence");
    //Click on Login
    cy.get("#wp-submit").click();
    Cypress.config("taskTimeout", 900000);
    const dataToWrite = []; // Array to accumulate the data
    cy.task(
      "queryDB",
      "SELECT post_title FROM bscience_posts INNER JOIN bscience_postmeta ON bscience_posts.ID = bscience_postmeta.post_id WHERE bscience_postmeta.meta_key = 'trial_status_change' AND post_title IN ('NCT04771481', 'NCT00411879','NCT05583110','NCT05715346','nct05754957');"

      // "SELECT post_title FROM bscience_posts INNER JOIN bscience_postmeta ON bscience_posts.ID = bscience_postmeta.post_id WHERE bscience_postmeta.meta_key = 'trial_status_change';"
    )
      .then((result2) => {
        console.log("result", result2);

        // Modify the result2 array to include empty data
        // Iterate through the result2 array and add entries to dataToWrite
        result2.forEach((value) => {
          const entry = {
            post_title: value.post_title,
            isEmpty: true, // Initially set to true
          };

          dataToWrite.push(entry);
          cy.visit(
            "https://boldersciencestage.pixacore.com/trial/" + value.post_title
          );

          //title should be visible and not empty
          cy.get("h2")
            .should("be.visible")
            .then(($element) => {
              if ($element.text().trim() === "") {
                // If it's empty, fail the test
                cy.fail("Title is empty");
              } else {
                // If it's not empty, continue with other validations
                // Verify nct is present, and its text should not be empty
                cy.get(":nth-child(2) > .list-unstyled > :nth-child(1) > .mb-0")
                  .should("exist")
                  .then(($nctElement) => {
                    if ($nctElement.text().trim() === "") {
                      cy.fail("NCT is empty");
                    } else {
                      // First posted date should exist and not be empty
                      cy.get(
                        ":nth-child(3) > .list-unstyled > :nth-child(1) > .mb-0"
                      )
                        .should("exist")
                        .then(($dateElement) => {
                          if ($dateElement.text().trim() === "") {
                            cy.fail("First posted date is empty");
                          } else {
                            // Last updated Date should exist and not be empty
                            cy.get(":nth-child(3) > ul > li:nth-child(2) > p")
                              .should("exist")
                              .then(($updatedDateElement) => {
                                if ($updatedDateElement.text().trim() === "") {
                                  cy.fail("Last updated Date is empty");
                                } else {
                                  // Brief Summery should exist and not be empty
                                  cy.get(
                                    "#studyDet-description > :nth-child(3)"
                                  )
                                    .should("exist")
                                    .then(($summaryElement) => {
                                      if (
                                        $summaryElement.text().trim() === ""
                                      ) {
                                        cy.fail("Brief Summery is empty");
                                      } else {
                                        // Phase should exist and not be empty
                                        cy.get(
                                          "#studyDet-description > .list-unstyled > :nth-child(3) > span"
                                        )
                                          .should("exist")
                                          .then(($phaseElement) => {
                                            if (
                                              $phaseElement.text().trim() === ""
                                            ) {
                                              cy.fail("Phase is empty");
                                            } else {
                                              // Details Description should exist and not be empty
                                              cy.get(
                                                "#studyDet-description > :nth-child(6)"
                                              )
                                                .should("exist")
                                                .then(($detailsElement) => {
                                                  if (
                                                    $detailsElement
                                                      .text()
                                                      .trim() === ""
                                                  ) {
                                                    cy.fail(
                                                      "Details Description is empty"
                                                    );
                                                  }
                                                });
                                            }
                                            //Ages Eligible for Study:
                                            cy.get(
                                              "#studyDet-eligibility-criteria > ul"
                                            ).each(($li) => {
                                              const $span = $li.find("span");

                                              // Check if the <span> contains the expected text
                                              if ($span.text().trim() === "") {
                                                // If it's empty, assert that it should be blank
                                                expect($span).to.be.empty;
                                              } else {
                                                // If it's not empty, assert the specific value you expect
                                                expect($span.text()).to.not.be
                                                  .empty;
                                                // Update the entry to indicate it's not empty
                                                entry.isEmpty = false;
                                              }
                                            });
                                            //CONTACTS AND LOCATIONS
                                            cy.get(
                                              "#studyDet-contact-and-locations"
                                            ).each(($li) => {
                                              const $span = $li.find("span");

                                              // Check if the $strong element contains text
                                              if ($span.text().trim() === "") {
                                                // If it's empty, assert that it should be blank
                                                expect($span.text().trim()).to
                                                  .be.empty;
                                              } else {
                                                // If it's not empty, assert the specific value you expect
                                                expect($span.text().trim()).to
                                                  .not.be.empty;
                                                // Update the entry to indicate it's not empty
                                                entry.isEmpty = false;
                                              }
                                            });

                                            //MORE INFORMATION
                                            cy.get(
                                              "#studyDet-more-information >ul"
                                            ).each(($li) => {
                                              const $strong =
                                                $li.find(".text-secondary");

                                              // Check if the $strong element contains text
                                              if (
                                                $strong.text().trim() === ""
                                              ) {
                                                // If it's empty, assert that it should be blank
                                                expect($strong.text().trim()).to
                                                  .be.empty;
                                              } else {
                                                // If it's not empty, assert the specific value you expect
                                                expect($strong.text().trim()).to
                                                  .not.be.empty;
                                                // Update the entry to indicate it's not empty
                                                entry.isEmpty = false;
                                              }
                                            });
                                          });
                                      }
                                    });
                                }
                              });
                          }
                        });
                    }
                  });
              }
            });

          dataToWrite.push(entry);
        });
      })
      .then(() => {
        // Filter dataToWrite to include only entries with isEmpty: true
        const filteredData = dataToWrite.filter((entry) => entry.isEmpty);
        cy.writeFile(filePath, JSON.stringify(filteredData), {
          timeout: 60000,
        }).then(() => {
          cy.log(`Data written to JSON file successfully: ${filePath}`);
        });
      });
    //});
  });
});
