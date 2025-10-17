import { ethers } from 'ethers';

/**
 * Centralized logger for BSC Copy Trading Bot
 */
export class Logger {
  static info(message) {
    console.log(`ℹ️  ${message}`);
  }

  static success(message) {
    console.log(`✅ ${message}`);
  }

  static error(message) {
    console.error(`❌ ${message}`);
  }

  static warning(message) {
    console.warn(`⚠️  ${message}`);
  }

  static botStarted() {
    console.log('🤖 BSC Validator Monitor Started');
    console.log('🔍 VALIDATOR MONITORING MODE - OBSERVATION ONLY');
  }

  static targetSwapDetected(swapData, txHash) {
    // This is now handled by detailedTransactionInfo
    console.log(`\n🎯 VALIDATOR SWAP DETECTED (see details above)`);
  }

  static validatorTransactionDetected(txHash, value, to) {
    console.log(`\n🔍 VALIDATOR TRANSACTION DETECTED:`);
    console.log(`   TX: ${txHash}`);
    console.log(`   Value: ${value} BNB`);
    console.log(`   To: ${to}`);
    console.log(`   ⏰ Timestamp: ${new Date().toISOString()}`);
  }

  static copyTradeExecuting(copyAmount, tokenSymbol) {
    console.log(`\n🚀 Executing Copy Trade...`);
    console.log(`   Copy Amount: ${copyAmount} ${tokenSymbol}`);
  }

  static copyTradeSuccess(txHash) {
    console.log(`✅ Copy Trade Successful: ${txHash}`);
  }

  static copyTradeFailed(errorMessage) {
    console.error(`❌ Copy Trade Failed: ${errorMessage}`);
  }

  static pnlEstimate(pnl) {
    const sign = pnl > 0 ? '+' : '';
    console.log(`📈 Est. P&L: ${sign}${pnl.toFixed(4)} BNB`);
  }

  static monitoringStarted(targetAddress) {
    console.log(`👀 VALIDATOR MONITORING MODE`);
    console.log(`🎯 Monitoring validator: ${targetAddress}`);
    console.log(`📋 Copy trading: DISABLED (observation only)`);
    console.log(`⚡ Rate limiting: DISABLED for testing`);
  }

  static configLoaded(config) {
    console.log(`📍 Target Address: ${config.getTargetAddress()}`);
    console.log(`🔄 Trade Multiplier: ${config.getTradeSizeMultiplier()}x`);
    console.log(`📊 Slippage: ${config.getSlippagePercentage()}%`);
    console.log(`🌐 RPC: ${config.getRpcUrl()}`);
    console.log(`🔍 Mode: ${config.getMonitoringMode().toUpperCase()}`);
  }

  static mempoolTransactionDetected(tx) {
    const valueInBNB = tx.value ? parseFloat(ethers.formatEther(tx.value)) : 0;
    console.log(`\n📡 MEMPOOL TRANSACTION:`);
    console.log(`   From: ${tx.from}`);
    console.log(`   To: ${tx.to || 'Contract Creation'}`);
    console.log(`   Value: ${valueInBNB.toFixed(6)} BNB`);
    console.log(`   TX: ${tx.hash}`);
    console.log(`   ⏰ Timestamp: ${new Date().toISOString()}`);
  }

  static detailedTransactionInfo(decodedTx) {
    console.log(`\n🔍 TRANSACTION DETAILS:`);
    console.log(`   Type: ${decodedTx.type}`);
    console.log(`   Method: ${decodedTx.method}`);
    console.log(`   From: ${decodedTx.from}`);
    console.log(`   Contract: ${decodedTx.contract || 'N/A'}`);
    console.log(`   Description: ${decodedTx.description}`);

    if (decodedTx.type === 'dex_swap') {
      console.log(`   Swap Path: [${decodedTx.path?.join(' → ') || 'N/A'}]`);
      console.log(`   Deadline: ${new Date((decodedTx.deadline || 0) * 1000).toISOString()}`);
    }

    if (decodedTx.type === 'erc20_transfer') {
      console.log(`   To: ${decodedTx.to}`);
      console.log(`   Amount: ${ethers.formatUnits(decodedTx.amount || 0, 18)} tokens`);
    }

    if (decodedTx.type === 'erc20_approve') {
      console.log(`   Spender: ${decodedTx.spender}`);
      console.log(`   Amount: ${ethers.formatUnits(decodedTx.amount || 0, 18)} tokens`);
    }

    if (decodedTx.type === 'contract_call') {
      console.log(`   Method Signature: ${decodedTx.methodSignature}`);
      console.log(`   Data Length: ${decodedTx.data?.length || 0} characters`);
    }

    console.log(`   Raw TX: ${decodedTx.txHash || 'N/A'}`);
  }

  static mempoolSwapDetected(swapData, tx) {
    // This is now handled by detailedTransactionInfo
    console.log(`\n🎯 MEMPOOL SWAP DETECTED (see details above)`);
  }

  static getTokenSymbol(tokenAddress) {
    const WBNB = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';
    const USDT = '0x55d398326f99059fF775485246999027B3197955';

    if (tokenAddress === WBNB) return 'WBNB';
    if (tokenAddress === USDT) return 'USDT';
    return tokenAddress.substring(0, 6) + '...' + tokenAddress.substring(tokenAddress.length - 4);
  }
}
