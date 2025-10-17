import { ethers } from 'ethers';
import { Config } from './config.js';
import { Logger } from './logger.js';
import { TransactionDecoder } from './decoder.js';
import { Trader } from './trader.js';
import { WalletMonitor } from './monitor.js';
import { MempoolMonitor } from './mempool-monitor.js';

/**
 * Main BSC Copy Trading Bot orchestrator
 */
export class BSCCopyTradingBot {
  constructor() {
    this.config = null;
    this.provider = null;
    this.wallet = null;
    this.decoder = null;
    this.trader = null;
    this.monitor = null;

    this.init();
  }

  init() {
    try {
      // Load configuration
      this.config = new Config();

      // Initialize provider and wallet
      this.provider = new ethers.JsonRpcProvider(this.config.getRpcUrl());
      this.wallet = new ethers.Wallet(this.config.getBotPrivateKey(), this.provider);

      // Initialize components
      this.decoder = new TransactionDecoder();
      this.trader = new Trader(this.wallet, this.config);

      // Choose monitor based on configuration
      if (this.config.getMonitoringMode() === 'mempool') {
        this.monitor = new MempoolMonitor(this.provider);
      } else {
        this.monitor = new WalletMonitor(this.provider, this.config.getTargetAddress(), this.decoder, this.trader);
      }

      // Log startup information
      this.logStartupInfo();

      // Start monitoring
      this.monitor.startMonitoring();

    } catch (error) {
      Logger.error(`Failed to initialize bot: ${error.message}`);
      process.exit(1);
    }
  }

  logStartupInfo() {
    Logger.botStarted();
    Logger.configLoaded(this.config);

    if (this.config.getMonitoringMode() === 'mempool') {
      Logger.info('🔍 MEMPOOL MONITORING MODE - OBSERVATION ONLY');
    } else {
      Logger.info('🎯 VALIDATOR MONITORING MODE - OBSERVATION ONLY');
    }
  }
}
