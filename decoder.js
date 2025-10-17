import { ethers } from 'ethers';

/**
 * Transaction decoder for PancakeSwap V2 swaps
 */
export class TransactionDecoder {
  constructor() {
    this.ETH_FOR_TOKENS_SIG = '0x7ff36ab5';
    this.TOKENS_FOR_ETH_SIG = '0x18cbafe5';
    this.TOKENS_FOR_TOKENS_SIG = '0x38ed1739';
  }

  decodeTransaction(tx) {
    try {
      // Skip empty transactions
      if (!tx.data || tx.data === '0x') {
        return this.decodeSimpleTransfer(tx);
      }

      // PancakeSwap V2 swapExactETHForTokens
      if (tx.data.startsWith(this.ETH_FOR_TOKENS_SIG)) {
        return this.decodeETHForTokensSwap(tx);
      }

      // PancakeSwap V2 swapExactTokensForETH
      if (tx.data.startsWith(this.TOKENS_FOR_ETH_SIG)) {
        return this.decodeTokensForETHSwap(tx);
      }

      // PancakeSwap V2 swapExactTokensForTokens
      if (tx.data.startsWith(this.TOKENS_FOR_TOKENS_SIG)) {
        return this.decodeTokensForTokensSwap(tx);
      }

      // ERC-20 Transfer
      if (tx.data.startsWith('0xa9059cbb')) {
        return this.decodeERC20Transfer(tx);
      }

      // ERC-20 Approve
      if (tx.data.startsWith('0x095ea7b3')) {
        return this.decodeERC20Approve(tx);
      }

      // Try to decode as a general contract call
      return this.decodeGenericContractCall(tx);

    } catch (error) {
      return null;
    }
  }

  decodeSimpleTransfer(tx) {
    return {
      type: 'transfer',
      method: 'Native Transfer',
      from: tx.from,
      to: tx.to,
      value: tx.value,
      token: 'BNB',
      description: `Transfer ${tx.value ? ethers.formatEther(tx.value) : '0'} BNB`
    };
  }

  decodeERC20Transfer(tx) {
    try {
      const iface = new ethers.Interface([
        'function transfer(address to, uint256 amount)'
      ]);

      const decoded = iface.decodeFunctionData('transfer', tx.data);
      const toAddress = decoded[0];
      const amount = decoded[1];

      return {
        type: 'erc20_transfer',
        method: 'transfer',
        contract: tx.to,
        from: tx.from,
        to: toAddress,
        amount: amount,
        token: tx.to, // Contract address is the token
        description: `Transfer ${ethers.formatUnits(amount, 18)} tokens to ${toAddress.substring(0, 6)}...${toAddress.substring(toAddress.length - 4)}`
      };
    } catch (error) {
      return null;
    }
  }

  decodeERC20Approve(tx) {
    try {
      const iface = new ethers.Interface([
        'function approve(address spender, uint256 amount)'
      ]);

      const decoded = iface.decodeFunctionData('approve', tx.data);
      const spender = decoded[0];
      const amount = decoded[1];

      return {
        type: 'erc20_approve',
        method: 'approve',
        contract: tx.to,
        from: tx.from,
        spender: spender,
        amount: amount,
        description: `Approve ${spender.substring(0, 6)}...${spender.substring(spender.length - 4)} to spend ${ethers.formatUnits(amount, 18)} tokens`
      };
    } catch (error) {
      return null;
    }
  }

  decodeGenericContractCall(tx) {
    try {
      // Try to get method signature (first 4 bytes)
      const methodSignature = tx.data.substring(0, 10);

      return {
        type: 'contract_call',
        method: 'Unknown',
        methodSignature: methodSignature,
        contract: tx.to,
        from: tx.from,
        data: tx.data,
        description: `Contract call to ${tx.to} with method signature ${methodSignature}`
      };
    } catch (error) {
      return null;
    }
  }

  decodeETHForTokensSwap(tx) {
    try {
      const iface = new ethers.Interface([
        'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline)'
      ]);

      const decoded = iface.decodeFunctionData('swapExactETHForTokens', tx.data);

      return {
        type: 'dex_swap',
        method: 'swapExactETHForTokens',
        contract: tx.to,
        from: tx.from,
        fromToken: 'BNB',
        fromAmount: tx.value,
        fromDecimals: 18,
        toToken: decoded.path[1], // Last token in path
        toAmount: decoded.amountOutMin,
        toDecimals: 18, // Assume 18 decimals for estimation
        path: decoded.path,
        deadline: decoded.deadline,
        description: `Swap ${ethers.formatEther(tx.value)} BNB for tokens via PancakeSwap V2`
      };
    } catch (error) {
      return null;
    }
  }

  decodeTokensForETHSwap(tx) {
    try {
      const iface = new ethers.Interface([
        'function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)'
      ]);

      const decoded = iface.decodeFunctionData('swapExactTokensForETH', tx.data);

      return {
        type: 'dex_swap',
        method: 'swapExactTokensForETH',
        contract: tx.to,
        from: tx.from,
        fromToken: decoded.path[0], // First token in path
        fromAmount: decoded.amountIn,
        fromDecimals: 18, // Assume 18 decimals for estimation
        toToken: 'BNB',
        toAmount: decoded.amountOutMin,
        toDecimals: 18,
        path: decoded.path,
        deadline: decoded.deadline,
        description: `Swap ${ethers.formatUnits(decoded.amountIn, 18)} tokens for BNB via PancakeSwap V2`
      };
    } catch (error) {
      return null;
    }
  }

  decodeTokensForTokensSwap(tx) {
    try {
      const iface = new ethers.Interface([
        'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)'
      ]);

      const decoded = iface.decodeFunctionData('swapExactTokensForTokens', tx.data);

      return {
        type: 'dex_swap',
        method: 'swapExactTokensForTokens',
        contract: tx.to,
        from: tx.from,
        fromToken: decoded.path[0], // First token in path
        fromAmount: decoded.amountIn,
        fromDecimals: 18, // Assume 18 decimals for estimation
        toToken: decoded.path[decoded.path.length - 1], // Last token in path
        toAmount: decoded.amountOutMin,
        toDecimals: 18, // Assume 18 decimals for estimation
        path: decoded.path,
        deadline: decoded.deadline,
        description: `Swap ${ethers.formatUnits(decoded.amountIn, 18)} tokens for other tokens via PancakeSwap V2`
      };
    } catch (error) {
      return null;
    }
  }

  formatTokenAmount(amount, decimals) {
    return ethers.formatUnits(amount, decimals);
  }

  getTokenSymbol(tokenAddress, WBNB, USDT) {
    if (tokenAddress === WBNB) return 'WBNB';
    if (tokenAddress === USDT) return 'USDT';
    return tokenAddress.substring(0, 6) + '...' + tokenAddress.substring(tokenAddress.length - 4);
  }
}
