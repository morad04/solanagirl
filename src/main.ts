import dotenv from 'dotenv'
import { bot } from './providers/telegram'
import { StartCommand } from './bot/commands/start-command'
import { AddCommand } from './bot/commands/add-command'
import { CallbackQueryHandler } from './bot/handlers/callback-query-handler'
import express, { Express } from 'express'
import { DeleteCommand } from './bot/commands/delete-command'
import { TrackWallets } from './lib/track-wallets'
import { CronJobs } from './lib/cron-jobs'
import { ASCII_TEXT } from './constants/handi-cat'
import chalk from 'chalk'
import gradient from 'gradient-string'

dotenv.config()

const PORT = process.env.PORT || 3001

class Main {
  private trackWallets: TrackWallets

  private cronJobs: CronJobs
  private callbackQueryHandler: CallbackQueryHandler
  private startCommand: StartCommand
  private addCommand: AddCommand
  private deleteCommand: DeleteCommand
  constructor(private app: Express = express()) {
    this.app.use(express.json({ limit: '50mb' }))

    this.setupRoutes()
    this.cronJobs = new CronJobs()

    this.trackWallets = new TrackWallets()

    this.callbackQueryHandler = new CallbackQueryHandler(bot)
    this.startCommand = new StartCommand(bot)
    this.addCommand = new AddCommand(bot)
    this.deleteCommand = new DeleteCommand(bot)

    this.app.listen(PORT, () =>
      console.log(`${chalk.bold.white.bgMagenta(`Server running on http://localhost:${PORT}`)}`),
    )
  }

  setupRoutes() {
    // Default endpoint
    this.app.get('/', async (req, res) => {
      try {
        res.status(200).send('Hello world')
      } catch (error) {
        console.error('Default route error', error)
        res.status(500).send('Error processing default rpute')
      }
    })
    this.app.post(`/webhook/telegram`, async (req, res) => {
      try {
        bot.processUpdate(req.body)

        res.status(200).send('Update received')
      } catch (error) {
        console.log('Error processing update:', error)
        res.status(500).send('Error processing update')
      }
    })
  }

  public async init(): Promise<void> {
    const gradientText = gradient.retro
    console.log(gradientText(ASCII_TEXT))

    // bot
    this.callbackQueryHandler.call()
    this.startCommand.start()
    this.addCommand.addCommandHandler()
    this.deleteCommand.deleteCommandHandler()

    // cron jobs
    // await this.cronJobs.monthlySubscriptionFee()

    // setup
    await this.trackWallets.setupWalletWatcher({ event: 'initial' })
    await this.trackWallets.listenForDatabaseChanges()
  }
}

const main = new Main()
main.init()
