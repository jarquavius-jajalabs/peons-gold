export type GameAction = 'claim' | 'open-pack' | 'assign-peon'

export function createAuthMessage(action: GameAction, wallet: string, nonce: number, payload = '') {
  return [
    "Peon's Gold signed action",
    `Action: ${action}`,
    `Wallet: ${wallet}`,
    `Nonce: ${nonce}`,
    `Payload: ${payload}`,
  ].join('\n')
}
