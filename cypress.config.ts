import { defineConfig } from "cypress";

export default defineConfig({
  retries: {
    runMode: 3,
    openMode: 0,
  },
  env: {},
  e2e: {
    experimentalRunAllSpecs: true,
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      // return require('./cypress/plugins/index.js')(on, config)
    },
    specPattern: './cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
  },
});
