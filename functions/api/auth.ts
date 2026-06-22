import bs58 from 'bs58'
import { verifyAsync } from '@noble/ed25519'
import { PublicKey } from '@solana/web3.js'
import { createAuthMessage, type GameAction } from '../../lib/auth-message'

export interface SignedActionAuth {
  nonce: number
  signature: string
}

const AUTH_WINDOW_MS = 5 * 60 * 1000

export async function verifySignedAction(
  kv: KVNamespace,
  wallet: string,
  action: GameAction,
  payload: string,
  auth?: SignedActionAuth,
) {
  if (!auth?.nonce || !auth.signature) return 'wallet signature required'

  const ageMs = Math.abs(Date.now() - auth.nonce)
  if (ageMs > AUTH_WINDOW_MS) return 'wallet signature expired'

  const replayKey = `auth:${wallet}:${action}:${auth.nonce}`
  const replayed = await kv.get(replayKey)
  if (replayed) return 'wallet signature already used'

  let publicKey: PublicKey
  try {
    publicKey = new PublicKey(wallet)
  } catch {
    return 'invalid wallet'
  }

  const message = new TextEncoder().encode(createAuthMessage(action, wallet, auth.nonce, payload))
  let signature: Uint8Array
  try {
    signature = bs58.decode(auth.signature)
  } catch {
    return 'invalid wallet signature'
  }

  const verified = await verifyAsync(signature, message, publicKey.toBytes())
  if (!verified) return 'invalid wallet signature'

  await kv.put(replayKey, '1', { expirationTtl: Math.ceil(AUTH_WINDOW_MS / 1000) * 2 })
  return null
}
