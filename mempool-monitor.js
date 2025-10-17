import { Logger } from './logger.js';
import { TransactionDecoder } from './decoder.js';

/**
 * Mempool monitoring handler for BSC pending transactions
 */
export class MempoolMonitor {
  constructor(provider) {
    this.provider = provider;
    this.decoder = new TransactionDecoder();
  }

  startMonitoring() {
    Logger.info('🔍 MEMPOOL MONITORING MODE');
    Logger.info('📡 Listening for pending transactions in mempool...');
    Logger.info('⚡ Rate limiting: DISABLED for testing');

    // Monitor for pending transactions
    this.provider.on('pending', async (txHash) => {
      try {
        await this.checkPendingTransaction(txHash);
      } catch (error) {
        // Silently handle errors for pending transactions (they might not exist yet)
      }
    });
  }

  async checkPendingTransaction(txHash) {
    try {
      const tx = await this.provider.getTransaction(txHash);

      if (tx) {
        Logger.mempoolTransactionDetected(tx);

        // Decode the full transaction
        const decodedTx = this.decoder.decodeTransaction(tx);

        if (decodedTx) {
          decodedTx.txHash = tx.hash; // Add the transaction hash for reference
          Logger.detailedTransactionInfo(decodedTx);
        }
      }
    } catch (error) {
      // Transaction might not be available yet in mempool
      // This is normal, so we don't log errors here
    }
  }
}
