'use client'
import { useState, useEffect, useCallback } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { LAMPORTS_PER_SOL, SystemProgram, Transaction, PublicKey } from '@solana/web3.js'

const TREASURY = new PublicKey('BLhWeQTHnJvxyYoAYvf2i1xaDYw7r8JFPy2pSb44n1nd')

export function useSolBalance() {
  const { connection } = useConnection()
  const { publicKey } = useWallet()
  const [balance, setBalance] = useState<number | null>(null)

  const refresh = useCallback(async () => {
    if (!publicKey) { setBalance(null); return }
    try {
      const bal = await connection.getBalance(publicKey)
      setBalance(bal / LAMPORTS_PER_SOL)
    } catch {
      setBalance(null)
    }
  }, [publicKey, connection])

  useEffect(() => { refresh() }, [refresh])

  return { balance, refresh }
}

export function useSolTransfer() {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()
  const [loading, setLoading] = useState(false)

  const transfer = useCallback(async (solAmount: number): Promise<{ signature: string } | { error: string }> => {
    if (!publicKey || !sendTransaction) return { error: 'Wallet not connected' }
    setLoading(true)
    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: TREASURY,
          lamports: Math.round(solAmount * LAMPORTS_PER_SOL),
        })
      )
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.lastValidBlockHeight = lastValidBlockHeight
      transaction.feePayer = publicKey

      const signature = await sendTransaction(transaction, connection)
      await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight })
      return { signature }
    } catch (err: any) {
      const msg = err?.message || 'Transaction failed'
      if (msg.includes('User rejected')) return { error: 'Transaction cancelled' }
      if (msg.includes('insufficient')) return { error: 'Insufficient SOL balance' }
      return { error: msg }
    } finally {
      setLoading(false)
    }
  }, [publicKey, sendTransaction, connection])

  return { transfer, loading }
}
