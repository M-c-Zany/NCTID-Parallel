const batchSize = 1000;
const totalRecords = 400000;
describe("Batch Processing", () => {
  beforeEach(() => {
    Cypress.config("defaultCommandTimeout", 30000); 
  });

function readPostgresData() {
  return cy.fixture("postgres.json");
}

function readMysqlData() {
  return cy.fixture("mysql.json");
}


  function processBatch(batchStart, nctIds, postgresData) {
    const batchPostgresData = postgresData.slice(
      batchStart,
      batchStart + batchSize
    );
    const foundNctIds = [];

    batchPostgresData.forEach((entry) => {
      if (nctIds.includes(entry.nct_id)) {
        foundNctIds.push(entry.nct_id);
      }
    });
  }

  it("should process batches", () => {
    const batches = Math.ceil(totalRecords / batchSize);

    let promise = Promise.resolve();
    for (let batchNumber = 0; batchNumber < batches; batchNumber++) {
      promise = promise.then(() => {
        return readMysqlData().then((mysqlData) => {
          const nctIds = mysqlData.map((entry) => entry.post_title);

          return readPostgresData().then((postgresData) => {
            processBatch(batchNumber * batchSize, nctIds, postgresData);
          });
        });
      });
    }

    return promise;
  });
});
