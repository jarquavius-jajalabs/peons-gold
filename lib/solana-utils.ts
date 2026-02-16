import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js'

export const TREASURY_WALLET = new PublicKey('BLhWeQTHnJvxyYoAYvf2i1xaDYw7r8JFPy2pSb44n1nd')

export function getConnection(): Connection {
  return new Connection(process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com', 'confirmed')
}

export async function getSolBalance(publicKey: PublicKey): Promise<number> {
  const connection = getConnection()
  const balance = await connection.getBalance(publicKey)
  return balance / LAMPORTS_PER_SOL
}

export async function createTransferTransaction(
  fromPubkey: PublicKey,
  solAmount: number
): Promise<Transaction> {
  const connection = getConnection()
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey,
      toPubkey: TREASURY_WALLET,
      lamports: Math.round(solAmount * LAMPORTS_PER_SOL),
    })
  )
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
  transaction.recentBlockhash = blockhash
  transaction.lastValidBlockHeight = lastValidBlockHeight
  transaction.feePayer = fromPubkey
  return transaction
}

export async function confirmTransaction(signature: string): Promise<boolean> {
  const connection = getConnection()
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
  const result = await connection.confirmTransaction({
    signature,
    blockhash,
    lastValidBlockHeight,
  })
  return !result.value.err
}

export function explorerUrl(signature: string): string {
  return `https://explorer.solana.com/tx/${signature}`
}

export function truncateAddress(address: string): string {
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}
