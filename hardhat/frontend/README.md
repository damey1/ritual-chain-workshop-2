# RitualPredict — Minimal Frontend

Open `index.html` in a browser with MetaMask installed. Enter the deployed `RitualPredict` contract address and connect your wallet.

Features:
- Connect wallet
- Load contract by address
- List markets (read-only)
- Place small bets (0.01 ETH) on YES/NO
- Claim winnings or refunds

Run locally (no dependencies):

```
# from hardhat folder
node frontend/server.cjs
# open http://localhost:5173 in your browser
```

Or via npm script:

```
npm run frontend:start
```

