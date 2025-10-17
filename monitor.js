import { Logger } from './logger.js';
import { ethers } from 'ethers';

/**
 * Wallet monitoring handler for BSC transactions
 */
export class WalletMonitor {
  constructor(provider, targetAddress, decoder, trader) {
    this.provider = provider;
    this.targetAddress = targetAddress.toLowerCase();
    this.decoder = decoder;
    this.trader = trader;
    this.WBNB = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';
    this.USDT = '0x55d398326f99059fF775485246999027B3197955';
  }

  startMonitoring() {
    Logger.monitoringStarted(this.targetAddress);

    // Monitor for new blocks and check for transactions from target address
    this.provider.on('block', async (blockNumber) => {
      try {
        await this.checkTargetTransactions(blockNumber);
      } catch (error) {
        Logger.error(`Error checking transactions: ${error.message}`);
      }
    });
  }

  async checkTargetTransactions(blockNumber) {
    const block = await this.provider.getBlock(blockNumber, true);

    if (!block || !block.transactions) return;

    for (const txHash of block.transactions) {
      try {
        const tx = await this.provider.getTransaction(txHash);

        // Check if this transaction is from our target address
        if (tx && tx.from && tx.from.toLowerCase() === this.targetAddress) {
          await this.processTargetTransaction(tx);
        }
      } catch (error) {
        // Skip failed transaction lookups
        continue;
      }
    }
  }

  async processTargetTransaction(tx) {
    try {
      // First, check if it's a regular transaction (not necessarily a swap)
      const valueInBNB = tx.value ? parseFloat(ethers.formatEther(tx.value)) : 0;

      if (valueInBNB > 0 || tx.data !== '0x') {
        Logger.validatorTransactionDetected(tx.hash, valueInBNB.toFixed(6), tx.to);

        // Decode the full transaction
        const decodedTx = this.decoder.decodeTransaction(tx);

        if (decodedTx) {
          decodedTx.txHash = tx.hash; // Add the transaction hash for reference
          Logger.detailedTransactionInfo(decodedTx);
        }

        // For now, skip copy trading and just observe
        Logger.info('📋 Copy trading disabled for validator monitoring');
      }
    } catch (error) {
      Logger.error(`Error processing transaction: ${error.message}`);
    }
  }
}
