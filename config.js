import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Configuration manager for BSC Copy Trading Bot
 */
export class Config {
  constructor() {
    this.targetAddress = null;
    this.botPrivateKey = null;
    this.rpcUrl = null;
    this.tradeSizeMultiplier = 1.0;
    this.slippageTolerance = 0.01;
    this.monitoringMode = 'validator'; // 'validator' or 'mempool'

    this.loadConfig();
  }

  loadConfig() {
    // Load required environment variables
    this.targetAddress = process.env.TARGET_WALLET_ADDRESS;
    this.botPrivateKey = process.env.BOT_PRIVATE_KEY;
    this.rpcUrl = process.env.BSC_RPC_URL;
    this.tradeSizeMultiplier = parseFloat(process.env.TRADE_SIZE_MULTIPLIER || '1.0');
    this.slippageTolerance = parseFloat(process.env.SLIPPAGE_TOLERANCE || '0.01');
    this.monitoringMode = process.env.MONITORING_MODE || 'validator';

    // Validate required variables
    if (!this.targetAddress || !this.botPrivateKey || !this.rpcUrl) {
      throw new Error('Missing required environment variables');
    }

    // Validate monitoring mode
    if (!['validator', 'mempool'].includes(this.monitoringMode)) {
      throw new Error('Invalid monitoring mode. Must be "validator" or "mempool"');
    }
  }

  getTargetAddress() {
    return this.targetAddress;
  }

  getBotPrivateKey() {
    return this.botPrivateKey;
  }

  getRpcUrl() {
    return this.rpcUrl;
  }

  getTradeSizeMultiplier() {
    return this.tradeSizeMultiplier;
  }

  getSlippageTolerance() {
    return this.slippageTolerance;
  }

  getSlippagePercentage() {
    return (this.slippageTolerance * 100).toFixed(1);
  }

  getMonitoringMode() {
    return this.monitoringMode;
  }
}
