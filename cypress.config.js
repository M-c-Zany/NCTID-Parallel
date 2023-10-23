const { defineConfig } = require("cypress");
const pg = require("pg");
const mysql = require("mysql");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      specPattern: "**/*.cy.js", // Use specPattern under the e2e property
      // Implement node event listeners here
      on("task", {
        // Create task
        READFROMDB({ dbConfig, sql }) {
          // Create client using the config argument object
          const client = new pg.Pool(dbConfig);

          // Return the result from the SQL
          return client.query(sql).then((result) => {
            client.end();
            return result.rows;
          });
        },
        queryDB: (query) => {
          return queryTestDb(query, config);
        },
      });
    },
  },
  DB: {
    postgres: {
      user: "vishalpixacore",
      host: "aact-db.ctti-clinicaltrials.org",
      database: "aact",
      password: "Pass@123",
      port: "5432",
    },
  },
  env: {
    DB1: {
      mysql: {
        user: "bolderscience",
        host: "dev-bolderscience-prod-mysql.caxo0amwagvk.us-east-1.rds.amazonaws.com",
        database: "bolder_stage",
        password: "pixacore2020",
        port: "3306",
      },
    },
  },
  videosFolder: "cypress/videos",
  screenshotsFolder: "cypress/screenshots",

  // Cypress Dashboard configuration
  projectId: "wbetes",

  record: true,

  // Parallelization configuration
  numTestsKeptInMemory: 5,

  numTestsKeptInDisk: 20,

  // Any additional configurations or plugins can be added here
  parallel: true
});

function queryTestDb(query, config) {
  const connection = mysql.createConnection(config.env.DB1.mysql);
  connection.connect();
  return new Promise((resolve, reject) => {
    connection.query(query, (error, result) => {
      if (error) reject(error);
      else {
        connection.end();
        return resolve(result);
      }
    });
  });
}
