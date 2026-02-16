# Peon's Gold

## Overview
Warcraft-themed clicker game that will evolve into a Solana minter/NFT game.

**Live:** https://peons-gold.pages.dev

## Stack
- **Frontend:** Next.js 14 + Tailwind CSS
- **UI Kit:** warcraftcn-ui (Warcraft-themed components)
- **Hosting:** Cloudflare Pages
- **Blockchain:** Solana (planned)

## Current Features
- Click to mine gold
- Gold counter with pulse animation
- Floating gold coin particles
- Random peon voice line quotes
- Warcraft-style UI (buttons, cards, fonts)
- Atmospheric background with vignette + noise texture

## Planned Features (Solana Minter)
- [ ] Wallet connection (Phantom, Solflare)
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
│   ├── page.tsx        # Main clicker UI
│   └── globals.css     # Styles + background
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
