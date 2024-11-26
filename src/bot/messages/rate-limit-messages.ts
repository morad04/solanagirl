export class RateLimitMessages {
  constructor() {}

  static walletWasPaused(walletAddress: string): string {
    const messageText = `
Your wallet <code>${walletAddress}</code> is spamming to many txs per second and it will be paused for 2 hours
`

    return messageText
  }

  static walletWasResumed(walletAddress: string): string {
    const messageText = `
Your wallet <code>${walletAddress}</code> has been resumed from sleeping after 2 hours!
        `

    return messageText
  }

  static walletWasBanned(walletAddress: string): string {
    const messageText = `
Your wallet <code>${walletAddress}</code> was banned and no longer being tracked due to hard spamming txs
`

    return messageText
  }
}
