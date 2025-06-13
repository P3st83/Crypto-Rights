// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Handle uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  return false
});

// Set up global mocks and fixtures before each test
beforeEach(() => {
  // Clear local storage
  cy.clearLocalStorage();

  // Register a default mock for token requests
  cy.intercept('GET', '/api/tokens/*', { fixture: 'token.json' }).as('getToken');
});

// Automatically preserve or restore local storage between tests
Cypress.Commands.add('preserveLocalStorage', () => {
  const storage = {};
  Object.keys(localStorage).forEach((key) => {
    storage[key] = localStorage.getItem(key);
  });
  cy.on('window:before:load', (win) => {
    Object.keys(storage).forEach((key) => {
      win.localStorage.setItem(key, storage[key]);
    });
  });
});

// Automatically apply JWT token from fixture to local storage (if needed)
Cypress.Commands.add('loginWithJwt', () => {
  cy.fixture('user').then((user) => {
    localStorage.setItem('jwt', user.token);
  });
});

// Prevent TypeScript errors for Cypress global
// https://on.cypress.io/typescript-support
// @ts-ignore
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       preserveLocalStorage(): Chainable<void>;
//       loginWithJwt(): Chainable<void>;
//     }
//   }
// } 