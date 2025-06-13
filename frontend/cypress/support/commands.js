// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Mock connecting to a wallet
Cypress.Commands.add('connectWallet', () => {
  // This is a simplified mock that simulates wallet connection
  // In a real test with MetaMask, this would be more complex
  localStorage.setItem('walletConnected', 'true');
  localStorage.setItem('userAddress', Cypress.env('testWalletAddress'));
  
  // Trigger any events your app listens for when wallet connects
  window.dispatchEvent(new Event('walletConnected'));
  
  cy.log('Mock wallet connected');
});

// Mock a token transfer
Cypress.Commands.add('mockTokenTransfer', (tokenId, recipientAddress) => {
  // This simulates a token transfer without actual blockchain interaction
  cy.log(`Mocking transfer of token #${tokenId} to ${recipientAddress}`);
  
  // Intercept API calls for token transfer
  cy.intercept('POST', '/api/tokens/*/transfer', {
    statusCode: 200,
    body: {
      success: true,
      message: 'Token transferred successfully',
      tokenId,
      to: recipientAddress,
      txHash: '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')
    }
  }).as('tokenTransfer');
  
  // For more realistic testing, you might want to also update localStorage with the new token ownership
});

// Navigate to token detail page
Cypress.Commands.add('visitTokenDetail', (tokenId) => {
  cy.visit(`/token/${tokenId}`);
  cy.get('h1').should('contain', 'Token Details');
  cy.get('[data-cy=token-id]').should('contain', tokenId);
});

// Simulate MetaMask confirmation (simplified mock)
Cypress.Commands.add('confirmMetaMaskTransaction', () => {
  // In real tests with MetaMask, this would interact with the MetaMask UI
  // For now, we're just simulating the confirmation
  cy.log('Mock MetaMask transaction confirmed');
  
  // You might want to trigger events or update state your app listens for
  const mockTxEvent = new CustomEvent('transactionConfirmed', {
    detail: {
      hash: '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')
    }
  });
  window.dispatchEvent(mockTxEvent);
}); 