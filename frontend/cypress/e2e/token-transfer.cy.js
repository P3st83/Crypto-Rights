/// <reference types="cypress" />

describe('Token Transfer Functionality', () => {
  const tokenId = 1;
  const recipientAddress = Cypress.env('recipientAddress');
  
  beforeEach(() => {
    // Mock the API calls
    cy.intercept('GET', `/api/tokens/${tokenId}`, { fixture: 'token.json' }).as('getToken');
    
    // Mock the address validation
    cy.intercept('POST', '/api/validate-address', (req) => {
      // Check if the address has the correct format
      const isValid = req.body && 
                      req.body.address && 
                      req.body.address.startsWith('0x') && 
                      req.body.address.length === 42;
      
      if (isValid) {
        req.reply({
          statusCode: 200,
          body: { valid: true }
        });
      } else {
        req.reply({
          statusCode: 200,
          body: { valid: false, error: 'Invalid Ethereum address format' }
        });
      }
    }).as('validateAddress');
    
    // Visit token detail page and wait for data to load
    cy.visit(`/token/${tokenId}`);
    cy.wait('@getToken');
  });
  
  it('should display token details correctly', () => {
    cy.get('[data-cy=token-title]').should('contain', 'Digital Music Rights #153');
    cy.get('[data-cy=token-owner]').should('contain', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
  });
  
  it('should show transfer button only when user is the token owner', () => {
    // Not connected - transfer button should not be visible
    cy.get('[data-cy=transfer-button]').should('not.exist');
    
    // Connect as owner
    cy.connectWallet();
    cy.reload();
    cy.wait('@getToken');
    
    // Now transfer button should be visible
    cy.get('[data-cy=transfer-button]').should('be.visible');
    
    // Disconnect and connect as non-owner
    localStorage.setItem('userAddress', '0x123456789abcdef0123456789abcdef012345678');
    cy.reload();
    cy.wait('@getToken');
    
    // Transfer button should not be visible for non-owner
    cy.get('[data-cy=transfer-button]').should('not.exist');
  });
  
  it('validates recipient address correctly', () => {
    // Connect as token owner
    cy.connectWallet();
    cy.reload();
    cy.wait('@getToken');
    
    // Open transfer modal
    cy.get('[data-cy=transfer-button]').click();
    cy.get('[data-cy=transfer-modal]').should('be.visible');
    
    // Try invalid address
    cy.get('[data-cy=recipient-input]').type('0xinvalid');
    cy.get('[data-cy=confirm-transfer]').click();
    cy.get('[data-cy=address-error]').should('be.visible');
    cy.get('[data-cy=address-error]').should('contain', 'Invalid Ethereum address');
    
    // Clear and try valid address
    cy.get('[data-cy=recipient-input]').clear().type(recipientAddress);
    cy.get('[data-cy=confirm-transfer]').click();
    cy.get('[data-cy=address-error]').should('not.exist');
  });
  
  it('successfully transfers token to new owner', () => {
    // Connect as token owner
    cy.connectWallet();
    cy.reload();
    cy.wait('@getToken');
    
    // Mock the token transfer API call
    cy.mockTokenTransfer(tokenId, recipientAddress);
    
    // Open transfer modal
    cy.get('[data-cy=transfer-button]').click();
    cy.get('[data-cy=transfer-modal]').should('be.visible');
    
    // Enter recipient address
    cy.get('[data-cy=recipient-input]').type(recipientAddress);
    
    // Confirm transfer
    cy.get('[data-cy=confirm-transfer]').click();
    
    // Mock MetaMask confirmation
    cy.confirmMetaMaskTransaction();
    
    // Should show loading state
    cy.get('[data-cy=loading-indicator]').should('be.visible');
    
    // Wait for the mocked API call
    cy.wait('@tokenTransfer');
    
    // Should show success notification
    cy.get('[data-cy=success-notification]').should('be.visible');
    cy.get('[data-cy=success-notification]').should('contain', 'Token transferred successfully');
    
    // Should redirect to dashboard
    cy.url().should('include', '/dashboard');
  });
  
  it('shows error for failed transfers', () => {
    // Connect as token owner
    cy.connectWallet();
    cy.reload();
    cy.wait('@getToken');
    
    // Mock failed token transfer
    cy.intercept('POST', '/api/tokens/*/transfer', {
      statusCode: 500,
      body: {
        success: false,
        message: 'Transfer failed: insufficient gas'
      }
    }).as('failedTransfer');
    
    // Open transfer modal
    cy.get('[data-cy=transfer-button]').click();
    cy.get('[data-cy=transfer-modal]').should('be.visible');
    
    // Enter recipient address
    cy.get('[data-cy=recipient-input]').type(recipientAddress);
    
    // Confirm transfer
    cy.get('[data-cy=confirm-transfer]').click();
    
    // Mock MetaMask confirmation
    cy.confirmMetaMaskTransaction();
    
    // Wait for the mocked API call
    cy.wait('@failedTransfer');
    
    // Should show error notification
    cy.get('[data-cy=error-notification]').should('be.visible');
    cy.get('[data-cy=error-notification]').should('contain', 'Transfer failed');
  });
  
  it('updates token history after transfer', () => {
    // Connect as token owner
    cy.connectWallet();
    cy.reload();
    cy.wait('@getToken');
    
    // Mock successful token transfer
    cy.mockTokenTransfer(tokenId, recipientAddress);
    
    // Open transfer modal
    cy.get('[data-cy=transfer-button]').click();
    cy.get('[data-cy=transfer-modal]').should('be.visible');
    
    // Enter recipient address and confirm
    cy.get('[data-cy=recipient-input]').type(recipientAddress);
    cy.get('[data-cy=confirm-transfer]').click();
    cy.confirmMetaMaskTransaction();
    cy.wait('@tokenTransfer');
    
    // Visit the token page again (after transfer)
    cy.intercept('GET', `/api/tokens/${tokenId}`, (req) => {
      // Return modified token with transfer event in history
      cy.fixture('token.json').then((token) => {
        token.owner = recipientAddress;
        token.tokenHistory.push({
          event: 'transfer',
          from: Cypress.env('testWalletAddress'),
          to: recipientAddress,
          price: null,
          timestamp: new Date().toISOString()
        });
        req.reply(token);
      });
    }).as('getUpdatedToken');
    
    cy.visit(`/token/${tokenId}`);
    cy.wait('@getUpdatedToken');
    
    // Check if token owner is updated
    cy.get('[data-cy=token-owner]').should('contain', recipientAddress);
    
    // Check if history includes transfer event
    cy.get('[data-cy=token-history]').should('contain', 'Transfer');
    cy.get('[data-cy=token-history]').should('contain', recipientAddress);
  });
}); 