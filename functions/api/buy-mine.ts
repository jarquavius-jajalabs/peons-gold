import type { PlayerState, Mine } from '../../lib/mock-data'

interface Env {
  GAME_STATE: KVNamespace
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

const TREASURY = 'BLhWeQTHnJvxyYoAYvf2i1xaDYw7r8JFPy2pSb44n1nd'
const MINE_COST_LAMPORTS = 0.01 * 1_000_000_000 // 0.01 SOL
const MINE_NAMES = ['Barrens Mine', 'Mulgore Mine', 'Silverpine Mine', 'Tanaris Mine', 'Felwood Mine', 'Stonetalon Mine', 'Desolace Mine', 'Feralas Mine', 'Winterspring Mine', 'Silithus Mine', 'Plaguelands Mine', 'Tirisfal Mine', 'Hillsbrad Mine']

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { headers: CORS_HEADERS })
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { wallet, txSignature } = await context.request.json() as { wallet: string; txSignature: string }
  if (!wallet || !txSignature) {
    return new Response(JSON.stringify({ error: 'wallet and txSignature required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    })
  }

  // Verify transaction on-chain
  const rpcUrl = 'https://api.mainnet-beta.solana.com'
  const txRes = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'getTransaction',
      params: [txSignature, { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 }],
    }),
  })
  const txData = await txRes.json() as any

  if (!txData.result) {
    return new Response(JSON.stringify({ error: 'Transaction not found or not confirmed' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    })
  }

  // Check for a transfer to treasury of at least 0.01 SOL
  const instructions = txData.result.transaction?.message?.instructions || []
  let validTransfer = false
  for (const ix of instructions) {
    if (ix.parsed?.type === 'transfer' && ix.program === 'system') {
      const info = ix.parsed.info
      if (info.source === wallet && info.destination === TREASURY && info.lamports >= MINE_COST_LAMPORTS) {
        validTransfer = true
        break
      }
    }
  }

  if (!validTransfer) {
    return new Response(JSON.stringify({ error: 'Transaction does not contain valid payment to treasury' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    })
  }

  const usedTxKey = `tx:${txSignature}`
  const usedBy = await context.env.GAME_STATE.get(usedTxKey)
  if (usedBy) {
    return new Response(JSON.stringify({ error: 'Transaction already used' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    })
  }

  const state = await context.env.GAME_STATE.get(`player:${wallet}`, 'json') as PlayerState | null
  if (!state) {
    return new Response(JSON.stringify({ error: 'player not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    })
  }

  if (state.mines.length >= 15) {
    return new Response(JSON.stringify({ error: 'Max mines reached' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    })
  }

  const mine: Mine = {
    id: `m${Date.now()}`,
    name: MINE_NAMES[Math.floor(Math.random() * MINE_NAMES.length)],
    level: 1,
    shafts: 3,
    assignedPeons: [],
    goldPerEpoch: 0,
  }
  state.mines.push(mine)

  await context.env.GAME_STATE.put(usedTxKey, wallet)
  await context.env.GAME_STATE.put(`player:${wallet}`, JSON.stringify(state))

  return new Response(JSON.stringify({ state, mine }), {
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  })
}
