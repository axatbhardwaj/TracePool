import { ethers } from 'ethers';
import { Logger } from './logger.js';

/**
 * Trade execution handler for PancakeSwap V2
 */
export class Trader {
  constructor(wallet, config) {
    this.wallet = wallet;
    this.config = config;
    this.pancakeRouterAddress = '0x10ED43C718714eb63d5aA57B78B54704E256024E';
    this.WBNB = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';
  }

  async executeCopyTrade(swapData) {
    try {
      const copyAmount = this.calculateCopyAmount(swapData.fromAmount, swapData.fromDecimals);
      const tokenSymbol = this.getTokenSymbol(swapData.fromToken);

      const formattedAmount = this.formatTokenAmount(copyAmount, swapData.fromDecimals);
      Logger.copyTradeExecuting(formattedAmount, tokenSymbol);

      const tx = await this.performSwap(swapData.fromToken, swapData.toToken, copyAmount, swapData.fromDecimals);

      Logger.copyTradeSuccess(tx.hash);

      const pnl = await this.estimatePnL(tx.hash);
      Logger.pnlEstimate(pnl);

      return tx;
    } catch (error) {
      Logger.copyTradeFailed(error.message);
      throw error;
    }
  }

  calculateCopyAmount(originalAmount, decimals) {
    return (originalAmount * this.config.getTradeSizeMultiplier()).toString();
  }

  formatTokenAmount(amount, decimals) {
    return ethers.formatUnits(amount, decimals);
  }

  async performSwap(fromToken, toToken, amount, decimals) {
    const router = new ethers.Contract(
      this.pancakeRouterAddress,
      [
        'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) payable returns (uint[] memory amounts)',
        'function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) returns (uint[] memory amounts)',
        'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) returns (uint[] memory amounts)'
      ],
      this.wallet
    );

    const deadline = Math.floor(Date.now() / 1000) + 300; // 5 minutes
    const amountOutMin = 0; // For POC, accept any output amount

    // BNB to Token swap
    if (fromToken === 'BNB') {
      const path = [this.WBNB, toToken];
      return await router.swapExactETHForTokens(
        amountOutMin,
        path,
        this.wallet.address,
        deadline,
        { value: amount }
      );
    }

    // Token to BNB swap
    if (toToken === 'BNB') {
      const path = [fromToken, this.WBNB];
      await this.approveToken(fromToken, amount);
      return await router.swapExactTokensForETH(
        amount,
        amountOutMin,
        path,
        this.wallet.address,
        deadline
      );
    }

    // Token to Token swap
    const path = [fromToken, toToken];
    await this.approveToken(fromToken, amount);
    return await router.swapExactTokensForTokens(
      amount,
      amountOutMin,
      path,
      this.wallet.address,
      deadline
    );
  }

  async approveToken(tokenAddress, amount) {
    const token = new ethers.Contract(
      tokenAddress,
      ['function approve(address spender, uint256 amount) returns (bool)'],
      this.wallet
    );

    return await token.approve(this.pancakeRouterAddress, amount);
  }

  async estimatePnL(txHash) {
    try {
      const provider = this.wallet.provider;
      const txReceipt = await provider.getTransactionReceipt(txHash);

      if (!txReceipt) return 0;

      // Estimate gas cost in BNB
      const gasCost = txReceipt.gasUsed * txReceipt.gasPrice;
      const gasCostBNB = parseFloat(ethers.formatEther(gasCost));

      // For POC, just return negative gas cost as "loss"
      return -gasCostBNB;
    } catch (error) {
      return 0;
    }
  }

  getTokenSymbol(tokenAddress) {
    if (tokenAddress === this.WBNB) return 'WBNB';
    if (tokenAddress === '0x55d398326f99059fF775485246999027B3197955') return 'USDT';
    return tokenAddress.substring(0, 6) + '...' + tokenAddress.substring(tokenAddress.length - 4);
  }
}
