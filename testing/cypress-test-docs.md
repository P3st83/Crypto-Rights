# Cypress Testing for Token Transfer Functionality

## Overview

This document describes the Cypress testing setup for the token transfer functionality in the CryptoRights platform. Cypress is used for end-to-end testing of the token transfer flow, including UI interactions, validation, and state updates.

## Test Structure

The Cypress tests for token transfer are organized as follows:

```
frontend/
  ├── cypress/
  │   ├── e2e/
  │   │   └── token-transfer.cy.js    # Main test file for token transfer
  │   ├── fixtures/
  │   │   └── token.json              # Mock token data
  │   └── support/
  │       ├── commands.js             # Custom Cypress commands
  │       └── e2e.js                  # Support file for e2e tests
  └── cypress.config.js               # Cypress configuration
```

## Test Coverage

The Cypress tests for token transfer cover the following scenarios:

1. **Token Details Display**
   - Verifies that token details are displayed correctly

2. **Transfer Button Visibility**
   - Confirms that the transfer button is only visible to the token owner
   - Tests visibility with connected and disconnected wallets
   - Tests visibility with owner and non-owner wallets

3. **Address Validation**
   - Tests validation of recipient address format
   - Verifies error message for invalid addresses
   - Confirms successful validation of valid addresses

4. **Transfer Process**
   - Tests the complete token transfer flow
   - Verifies loading indicators during transaction
   - Tests successful completion with notifications
   - Confirms redirection after successful transfer

5. **Error Handling**
   - Tests error handling for failed transfers
   - Verifies error messages are displayed correctly

6. **Token History Updates**
   - Verifies that token history is updated after transfer
   - Confirms changes in token ownership after transfer

## Running the Tests

### Prerequisites

- Node.js and npm installed
- CryptoRights platform running locally (`npm run dev` in frontend directory)

### Commands

```bash
# Open Cypress test runner
npm run cypress

# Run all Cypress tests headlessly
npm run cypress:run

# Run only token transfer tests
npm run cypress:token-transfer

# Run all tests (alias for cypress:run)
npm test
```

## Mock Data & Intercepts

The tests use mock data and API intercepts to simulate blockchain interactions:

- **Token Data**: Uses `token.json` fixture for token information
- **API Intercepts**: Intercepts API calls to simulate blockchain operations
- **Wallet Connection**: Mocks wallet connections using localStorage and custom events
- **MetaMask Confirmation**: Simulates MetaMask transaction confirmations

## Custom Commands

The test suite uses several custom Cypress commands:

- **connectWallet()**: Simulates connecting to a wallet
- **mockTokenTransfer()**: Mocks the token transfer API call
- **visitTokenDetail()**: Navigates to a token detail page and verifies loading
- **confirmMetaMaskTransaction()**: Simulates confirming a transaction in MetaMask

## Test Attributes

The tests expect the following data attributes to be present in the UI components:

- `data-cy=token-title`: Element containing the token title
- `data-cy=token-owner`: Element displaying the token owner
- `data-cy=transfer-button`: Button to initiate token transfer
- `data-cy=transfer-modal`: Modal dialog for transfer
- `data-cy=recipient-input`: Input field for recipient address
- `data-cy=confirm-transfer`: Button to confirm transfer
- `data-cy=address-error`: Element for address validation errors
- `data-cy=loading-indicator`: Loading indicator during transaction
- `data-cy=success-notification`: Success notification element
- `data-cy=error-notification`: Error notification element
- `data-cy=token-history`: Element containing token history

## Best Practices

1. Keep tests independent - each test should be able to run in isolation
2. Use data-cy attributes for test selectors instead of classes or IDs
3. Mock blockchain interactions to avoid real transactions during tests
4. Test both happy paths and error scenarios
5. Avoid using wait timeouts - use intercepts and waitfor instead
6. Keep fixtures updated to match real data structure

## Integration with CI/CD

The Cypress tests can be integrated into a CI/CD pipeline:

```yaml
# Example GitHub Actions workflow step
- name: Run Cypress tests
  run: npm run cypress:run
``` 