# Peon's Gold

## Overview
Warcraft-themed idle mining game evolving into a Solana minter/NFT game.

**Live:** https://peons-gold.pages.dev

## Stack
- **Frontend:** Next.js 14 + Tailwind CSS
- **UI Kit:** warcraftcn-ui (Warcraft-themed components)
- **Hosting:** Cloudflare Pages
- **Blockchain:** Solana wallet + SOL transfer flow partially integrated

## Current Features
- Wallet-gated gameplay using Solana wallet adapter
- Dashboard with mines, peons, packs, roster, referrals, economy, and leaderboard surfaces
- Cloudflare Pages Functions backed by KV for player state
- Mine purchase flow that sends `0.01 SOL` to the treasury wallet, then verifies the transaction server-side before adding a mine
- Claim/open-pack/assign-peon APIs with local game state persistence
- Warcraft-style UI, audio/toast feedback, and animated gold counters

## Solana Status

- [x] Wallet connection (Phantom, Solflare)
- [x] SOL transfer for buying a mine
- [x] Server-side transaction lookup and treasury transfer validation
- [ ] NFT peon minting
- [ ] On-chain gold token (`$GOLD` or `$PEON`)
- [ ] Token/NFT-backed staking and reward accounting

## Planned Features (Minter / On-Chain Game)

- [ ] Mint NFT peons
- [ ] Peon staking for passive gold
- [ ] On-chain gold token ($GOLD or $PEON)
- [ ] Upgrades system
- [ ] Leaderboard

## Files
```
peons-gold/
├── app/
│   ├── layout.tsx
│   ├── page.tsx        # Invite/wallet gate
│   ├── dashboard/      # Main game dashboard
│   └── globals.css     # Styles + background
├── functions/api/      # Cloudflare Pages API routes
├── lib/                # Wallet, API, and game helpers
├── components/ui/warcraftcn/
│   ├── button.tsx
│   ├── card.tsx
│   └── ...
├── public/warcraftcn/  # Warcraft assets
└── PROJECT.md
```

## Deploy
```bash
npm run build
npx wrangler pages deploy out --project-name=peons-gold --commit-dirty=true
```

## Notes
- Started: 2026-02-10
- Concept: Simple clicker → evolve into Solana minter game
- UI from: warcraftcn-ui (banteg's components)

## Related

[[Peons Gold]] | [[Solana]] | [[Cloudflare]] | [[jajaLabs]]
