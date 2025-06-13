# CryptoRights Platform

A blockchain-powered content ownership and monetization platform where creators can tokenize their content into NFTs, ensuring ownership, copyright protection, and direct monetization.

## Structure

The CryptoRights platform is organized as follows:

```
cryptorights/
├── frontend/                # Next.js frontend application
│   ├── pages/               # Page routes 
│   │   ├── _app.tsx         # Main application wrapper
│   │   ├── index.tsx        # Homepage
│   │   ├── create.tsx       # Content creation page
│   │   ├── explore.tsx      # Content exploration page
│   │   ├── dashboard.tsx    # Creator dashboard
│   │   ├── content/         # Content-related pages
│   │   ├── creators/        # Creator profile pages
│   │   └── subscriptions/   # Subscription management pages
│   ├── src/                 # Source code
│   │   ├── components/      # React components
│   │   │   ├── common/      # Reusable UI components
│   │   │   ├── content/     # Content-related components
│   │   │   ├── creator/     # Creator profile components
│   │   │   ├── layout/      # Layout components (Navbar, Footer)
│   │   │   └── subscription/ # Subscription-related components
│   │   ├── context/         # React context providers
│   │   │   └── Web3Context.tsx # Blockchain connection context
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utility libraries
│   │   │   ├── api/         # API client for backend services
│   │   │   └── contracts/   # Smart contract integrations
│   │   ├── styles/          # CSS and styling
│   │   ├── utils/           # Utility functions
│   │   └── types/           # TypeScript type definitions
│   └── public/              # Static assets
├── backend/                 # Express backend API
│   ├── controllers/         # Route controllers
│   ├── models/              # Database models
│   ├── routes/              # API routes
│   ├── middleware/          # Express middleware
│   ├── services/            # Business logic services
│   ├── config/              # Configuration files
│   └── server.js            # Main Express app
└── blockchain/              # Smart contracts and blockchain code
    ├── contracts/           # Smart contracts
    ├── scripts/             # Deployment scripts
    ├── test/                # Contract tests
    └── artifacts/           # Compiled contract artifacts
```

## Features

- **NFT Content Licensing**: Creators can mint their content as NFTs, ensuring proof of ownership.
- **Pay-Per-View Model**: Users can pay microtransactions in crypto to access premium content.
- **Subscription-Based Access**: Creators can offer exclusive content via NFT memberships.
- **Content Tokenization**: Convert songs, books, videos, and art into unique blockchain assets.
- **Decentralized Storage**: Content is securely stored on IPFS/Filecoin.
- **Automated Royalties**: Smart contracts ensure automatic payments to creators.

## Monetization Model

1. **Transaction Fees**: Small percentage of every content sale.
2. **Subscription Tiers**: Users pay monthly for premium features.
3. **Ad Revenue**: Optional advertising to promote content.
4. **NFT Resale Commissions**: Earn from secondary sales of tokenized content.
5. **Exclusive Auctions & Bidding**: Limited-edition content auctions.

## Tech Stack

- **Blockchain**: Ethereum (Layer 2), Polygon, Solana
- **Storage**: IPFS / Filecoin
- **Smart Contracts**: Solidity
- **Frontend**: Next.js + React
- **Backend**: Node.js + Express
- **Wallet Integration**: MetaMask, WalletConnect

## Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/cryptorights.git
cd cryptorights

# Install dependencies for all workspaces
npm install
```

### Frontend Development

```bash
# Run the frontend development server
npm run dev:frontend

# Open http://localhost:3000 in your browser
```

### Backend Setup

```bash
# Run the backend server
npm run dev:backend
```

### Blockchain Setup

```bash
# Start local blockchain node
npm run dev:blockchain

# In a new terminal, deploy contracts to local network
npm run deploy:contracts
```

## Project Scripts

- `npm run dev:frontend` - Run the Next.js frontend development server
- `npm run dev:backend` - Run the Express backend server
- `npm run dev:blockchain` - Start a local Hardhat blockchain node
- `npm run deploy:contracts` - Deploy smart contracts to the local network
- `npm run build:frontend` - Build the frontend for production
- `npm run start:frontend` - Start the production frontend server
- `npm run lint:frontend` - Lint the frontend code
- `npm run test:contracts` - Run tests for the smart contracts
