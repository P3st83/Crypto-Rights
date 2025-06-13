# Token Transfer Functionality - CryptoRights Platform

## Overview
The token transfer functionality enables users to transfer their owned NFTs (tokens) to other users on the platform. This is a critical functionality for any NFT platform as it enables ownership changes and establishes the foundation for secondary markets.

## Technical Implementation

### User Interface Components
- Token details page (`/token/[id].tsx`) - Contains the "Transfer Token" button for tokens owned by the current user
- Transfer modal - A dialog that appears when the transfer process is initiated
- Recipient input field - For entering the recipient's Ethereum address
- Confirmation button - To confirm the transfer after entering a valid address
- Loading indicator - Displayed during transaction processing
- Success notification - Shown when the transfer completes successfully

### Backend/Smart Contract Interaction
- The `transferToken` function in `useCryptoRightsToken.ts` hook is responsible for the actual transfer
- It calls the `transferFrom` method on the CryptoRightsToken smart contract
- The function requires:
  - The token ID to transfer
  - The recipient's Ethereum address
  - The current user's connected wallet for authentication

### Process Flow
1. User navigates to a token details page for a token they own
2. User clicks "Transfer Token" button
3. Transfer modal appears
4. User enters recipient Ethereum address
5. UI validates the address format
6. User confirms the transfer
7. MetaMask (or other wallet) prompts for transaction approval
8. User approves the transaction
9. Platform shows loading indicator during transaction processing
10. On successful completion, success notification is displayed
11. Token ownership is updated in the UI
12. User is redirected to dashboard
13. Token is removed from user's content list and appears in recipient's content list

## Address Validation

The transfer functionality includes validation for Ethereum addresses:
- Must start with "0x"
- Must be 42 characters in length (including "0x")
- Must contain valid hexadecimal characters

## Testing Considerations

When testing the token transfer functionality, consider the following:

1. **Happy Path Testing**:
   - Successful transfer with valid address
   - Proper UI feedback during each step
   - Correct ownership changes reflected after transfer

2. **Validation Testing**:
   - Invalid addresses are rejected with appropriate error messages
   - Addresses with incorrect format (missing 0x, wrong length, invalid characters)
   - Attempts to transfer to the zero address (0x0000...)
   - Attempts to transfer to the current owner

3. **Error Handling**:
   - User rejects the transaction in their wallet
   - Network issues during transaction
   - Contract execution failures (gas issues, etc.)
   - Token no longer owned by user when transaction submitted

4. **Permission Testing**:
   - Only the token owner should see the transfer button
   - Non-owners should not be able to initiate transfers
   - Approved addresses (if implemented) can transfer tokens

5. **Transaction State Testing**:
   - Proper loading indicators during transaction processing
   - Success notifications on completion
   - Error handling for failed transactions

6. **History Tracking**:
   - Token history should be updated with transfer event
   - Event should include from/to addresses and timestamp

## Best Practices

1. Always validate addresses before sending transactions
2. Provide clear feedback during the transaction process
3. Update UI immediately on successful transfer
4. Implement proper error handling for failed transfers
5. Track token transfer history for transparency
6. Consider gas optimization for the transfer function
7. Test transfers with different wallets and network conditions

## Related Features
- Token listing for sale
- Token history tracking
- License transfers (if applicable)
- Royalty payments on secondary sales 