// Mock data for Peon's Gold

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic'

export interface Peon {
  id: string
  name: string
  rarity: Rarity
  miningPower: number
  image: string // legacy emoji
  icon: string // SVG icon letter/symbol
  assignedMineId?: string
  assignedShaft?: number
}

export interface Mine {
  id: string
  name: string
  level: number
  shafts: number
  assignedPeons: string[]
  goldPerEpoch: number
}

export interface PlayerState {
  gold: number
  unclaimedGold: number
  lastClaimTime: number
  mines: Mine[]
  peons: Peon[]
  packs: number
  inviteCode: string
  referrals: Referral[]
  solBalance: number
  totalPacksOpened: number
}

export interface Referral {
  address: string
  earnings: number
  tier: 1 | 2
  joinedAt: number
}

export interface LeaderboardEntry {
  rank: number
  name: string
  address: string
  totalGold: number
  mines: number
}

export const RARITY_CONFIG: Record<Rarity, {
  color: string
  glow: string
  chance: number
  bg: string
  border: string
  multiplier: number
  frameBg: string
  frameGlow: string
  label: string
}> = {
  common: {
    color: '#9d9d9d',
    glow: 'none',
    chance: 0.45,
    bg: 'from-gray-800 to-gray-900',
    border: 'border-gray-600',
    multiplier: 1,
    frameBg: 'linear-gradient(135deg, #4a4a4a, #2a2a2a)',
    frameGlow: 'none',
    label: 'Common',
  },
  uncommon: {
    color: '#1eff00',
    glow: '0 0 10px rgba(30,255,0,0.5)',
    chance: 0.30,
    bg: 'from-green-900 to-green-950',
    border: 'border-green-500',
    multiplier: 1.5,
    frameBg: 'linear-gradient(135deg, #1a4a1a, #0a2a0a)',
    frameGlow: '0 0 15px rgba(30,255,0,0.3)',
    label: 'Uncommon',
  },
  rare: {
    color: '#0070dd',
    glow: '0 0 15px rgba(0,112,221,0.6)',
    chance: 0.15,
    bg: 'from-blue-900 to-blue-950',
    border: 'border-blue-500',
    multiplier: 2.5,
    frameBg: 'linear-gradient(135deg, #0a2a5a, #051a3a)',
    frameGlow: '0 0 20px rgba(0,112,221,0.4)',
    label: 'Rare',
  },
  epic: {
    color: '#a335ee',
    glow: '0 0 20px rgba(163,53,238,0.6)',
    chance: 0.07,
    bg: 'from-purple-900 to-purple-950',
    border: 'border-purple-500',
    multiplier: 5,
    frameBg: 'linear-gradient(135deg, #3a1a5a, #1a0a3a)',
    frameGlow: '0 0 25px rgba(163,53,238,0.5)',
    label: 'Epic',
  },
  legendary: {
    color: '#ff8000',
    glow: '0 0 25px rgba(255,128,0,0.7)',
    chance: 0.025,
    bg: 'from-orange-900 to-orange-950',
    border: 'border-orange-500',
    multiplier: 10,
    frameBg: 'linear-gradient(135deg, #5a2a0a, #3a1a05)',
    frameGlow: '0 0 30px rgba(255,128,0,0.6)',
    label: 'Legendary',
  },
  mythic: {
    color: '#e6cc80',
    glow: '0 0 30px rgba(230,204,128,0.8), 0 0 60px rgba(255,215,0,0.4)',
    chance: 0.005,
    bg: 'from-yellow-800 to-amber-950',
    border: 'border-yellow-400',
    multiplier: 25,
    frameBg: 'linear-gradient(135deg, #5a4a1a, #3a2a0a)',
    frameGlow: '0 0 40px rgba(230,204,128,0.7), 0 0 80px rgba(255,215,0,0.3)',
    label: 'Mythic',
  },
}

export const PEON_POOL: Record<Rarity, { name: string, emoji: string, icon: string }[]> = {
  common: [
    { name: 'Basic Peon', emoji: '⛏️', icon: 'P' },
    { name: 'Grunt', emoji: '🪓', icon: 'G' },
    { name: 'Headhunter', emoji: '🏹', icon: 'H' },
    { name: 'Witch Doctor Apprentice', emoji: '🧪', icon: 'W' },
  ],
  uncommon: [
    { name: 'Troll Berserker', emoji: '🏹', icon: 'TB' },
    { name: 'Tauren Miner', emoji: '🐂', icon: 'TM' },
    { name: 'Orc Raider', emoji: '🐺', icon: 'OR' },
    { name: 'Spirit Walker', emoji: '👻', icon: 'SW' },
  ],
  rare: [
    { name: 'Goblin Sapper', emoji: '💣', icon: 'GS' },
    { name: 'Dark Ranger', emoji: '🏴', icon: 'DR' },
    { name: 'Kodo Rider', emoji: '🦏', icon: 'KR' },
    { name: 'Wyvern Tamer', emoji: '🦅', icon: 'WT' },
  ],
  epic: [
    { name: 'Blademaster', emoji: '⚔️', icon: 'BM' },
    { name: 'Shadow Hunter', emoji: '🗡️', icon: 'SH' },
    { name: 'Far Seer', emoji: '🔮', icon: 'FS' },
    { name: 'Tauren Chieftain', emoji: '🛡️', icon: 'TC' },
  ],
  legendary: [
    { name: 'Thrall', emoji: '⚡', icon: 'Th' },
    { name: 'Grommash', emoji: '🔥', icon: 'Gr' },
    { name: "Vol'jin", emoji: '💀', icon: 'Vj' },
    { name: 'Cairne Bloodhoof', emoji: '🦬', icon: 'CB' },
  ],
  mythic: [
    { name: 'Deathwing', emoji: '🐉', icon: 'DW' },
    { name: 'Arthas', emoji: '👑', icon: 'Ar' },
    { name: 'Illidan', emoji: '😈', icon: 'Il' },
    { name: 'Sargeras', emoji: '🌋', icon: 'Sa' },
  ],
}

export function rollRarity(): Rarity {
  const roll = Math.random()
  let cumulative = 0
  for (const [rarity, config] of Object.entries(RARITY_CONFIG)) {
    cumulative += config.chance
    if (roll <= cumulative) return rarity as Rarity
  }
  return 'common'
}

export function rollPeon(): Peon {
  const rarity = rollRarity()
  const pool = PEON_POOL[rarity]
  const template = pool[Math.floor(Math.random() * pool.length)]
  return {
    id: `peon-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: template.name,
    rarity,
    miningPower: RARITY_CONFIG[rarity].multiplier,
    image: template.emoji,
    icon: template.icon,
  }
}

export function createMockState(): PlayerState {
  const peons: Peon[] = [
    { id: 'p1', name: 'Basic Peon', rarity: 'common', miningPower: 1, image: '⛏️', icon: 'P', assignedMineId: 'm1', assignedShaft: 0 },
    { id: 'p2', name: 'Grunt', rarity: 'common', miningPower: 1, image: '🪓', icon: 'G', assignedMineId: 'm1', assignedShaft: 1 },
    { id: 'p3', name: 'Troll Berserker', rarity: 'uncommon', miningPower: 1.5, image: '🏹', icon: 'TB', assignedMineId: 'm1', assignedShaft: 2 },
    { id: 'p4', name: 'Goblin Sapper', rarity: 'rare', miningPower: 2.5, image: '💣', icon: 'GS', assignedMineId: 'm2', assignedShaft: 0 },
    { id: 'p5', name: 'Headhunter', rarity: 'common', miningPower: 1, image: '🏹', icon: 'H' },
    { id: 'p6', name: 'Tauren Miner', rarity: 'uncommon', miningPower: 1.5, image: '🐂', icon: 'TM' },
    { id: 'p7', name: 'Blademaster', rarity: 'epic', miningPower: 5, image: '⚔️', icon: 'BM' },
  ]

  return {
    gold: 4206.9,
    unclaimedGold: 127.5,
    lastClaimTime: Date.now() - 1000 * 60 * 42,
    mines: [
      { id: 'm1', name: 'Durotar Mine', level: 2, shafts: 4, assignedPeons: ['p1', 'p2', 'p3'], goldPerEpoch: 3.5 },
      { id: 'm2', name: 'Ashenvale Mine', level: 1, shafts: 3, assignedPeons: ['p4'], goldPerEpoch: 2.5 },
    ],
    peons,
    packs: 3,
    inviteCode: 'LOKTAR',
    solBalance: 4.2,
    totalPacksOpened: 0,
    referrals: [
      { address: '7xK...f3d', earnings: 210.5, tier: 1, joinedAt: Date.now() - 86400000 * 3 },
      { address: '3mP...a8c', earnings: 89.2, tier: 1, joinedAt: Date.now() - 86400000 * 1 },
      { address: '9bQ...k2e', earnings: 15.0, tier: 2, joinedAt: Date.now() - 86400000 * 5 },
    ],
  }
}

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'Warchief_69', address: '4xR...m2k', totalGold: 158420, mines: 12 },
  { rank: 2, name: 'GoldFarmer', address: '8bT...p5n', totalGold: 134200, mines: 10 },
  { rank: 3, name: 'PeonKing', address: '2mN...j8f', totalGold: 98750, mines: 9 },
  { rank: 4, name: 'DeathwingDAO', address: '6kL...w3c', totalGold: 87300, mines: 8 },
  { rank: 5, name: 'ZugZugSol', address: '1pQ...h7a', totalGold: 72150, mines: 7 },
  { rank: 6, name: 'LokTarOgar', address: '5nF...d1g', totalGold: 65800, mines: 7 },
  { rank: 7, name: 'ThrallMaxi', address: '9wE...b4m', totalGold: 51200, mines: 6 },
  { rank: 8, name: 'You', address: 'BLh...1nd', totalGold: 4206, mines: 2 },
  { rank: 9, name: 'MineGoblin', address: '3jR...c9p', totalGold: 3800, mines: 2 },
  { rank: 10, name: 'NewPeon420', address: '7tS...f2k', totalGold: 1200, mines: 1 },
]

// Activity feed mock
export const MOCK_ACTIVITY = [
  { text: 'Warchief_69 pulled a MYTHIC Deathwing!', time: 12, rarity: 'mythic' as Rarity },
  { text: 'GoldFarmer bought their 10th mine!', time: 34, rarity: 'common' as Rarity },
  { text: 'PeonKing opened a LEGENDARY Thrall!', time: 67, rarity: 'legendary' as Rarity },
  { text: 'ZugZugSol claimed 1,247 $GOLD', time: 89, rarity: 'common' as Rarity },
  { text: 'DeathwingDAO upgraded Felwood Mine to Lv.5', time: 120, rarity: 'common' as Rarity },
  { text: 'NewPeon420 just joined the mines!', time: 180, rarity: 'common' as Rarity },
  { text: 'LokTarOgar pulled an EPIC Blademaster!', time: 240, rarity: 'epic' as Rarity },
]
