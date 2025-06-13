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
    experimentalOriginDependencies: true, // Added to allow testing without server
    experimentalRunAllSpecs: true,
  },
  env: {
    testWalletAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    recipientAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
  },
}); 