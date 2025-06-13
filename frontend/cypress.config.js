const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 800,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    experimentalOriginDependencies: true,
    experimentalRunAllSpecs: true,
    waitForAnimations: true,
    testIsolation: false
  },
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
    specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}'
  },
  env: {
    testWalletAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    recipientAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    disableNetworkFetching: true
  },
  retries: {
    runMode: 2,
    openMode: 0
  }
}); 