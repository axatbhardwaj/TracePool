# BSC Copy Trading Bot - POC (WIP)

A simple proof-of-concept copy trading bot for Binance Smart Chain that monitors blockchain activity and demonstrates potential copy trading mechanisms.

**⚠️ WORK IN PROGRESS - For educational and testing purposes only**

## Features

- 🔍 **Two Monitoring Modes**:
  - **Validator Mode**: Monitors specific wallet for transactions
  - **Mempool Mode**: Monitors all pending transactions in mempool
- 🎯 Advanced transaction decoding (DEX swaps, ERC-20 transfers, approvals, contract calls)
- 📊 Detailed logging with method signatures, parameters, and descriptions
- ⚡ Built with Bun.js for optimal performance
- 🔗 WebSocket event listeners for real-time blockchain monitoring

## Setup

1. **Install dependencies:**
   ```bash
   bun install
   ```

2. **Configure environment variables in `.env`:**
   ```env
   TARGET_WALLET_ADDRESS=0x1234567890123456789012345678901234567890
   BOT_PRIVATE_KEY=0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdef
   BSC_RPC_URL=https://bsc-dataseed1.binance.org/
   TRADE_SIZE_MULTIPLIER=1.0
   SLIPPAGE_TOLERANCE=0.01
   MONITORING_MODE=validator
   ```

3. **Run the bot:**
   ```bash
   bun run start
   ```

## Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `TARGET_WALLET_ADDRESS` | Wallet address to monitor | `0x1234...` |
| `BOT_PRIVATE_KEY` | Bot's wallet private key | `0xabcd...` |
| `BSC_RPC_URL` | BSC RPC endpoint | `https://bsc-dataseed1.binance.org/` |
| `TRADE_SIZE_MULTIPLIER` | Trade size multiplier | `1.0` (same size), `0.5` (half) |
| `SLIPPAGE_TOLERANCE` | Slippage tolerance | `0.01` (1%), `0.02` (2%) |
| `MONITORING_MODE` | Monitoring mode | `validator` or `mempool` |

## How it Works

**Validator Mode:**
1. **Monitoring**: Listens for new BSC blocks and checks transactions from the target wallet address
2. **Detection**: When a DEX swap is detected from the target wallet, decodes the transaction
3. **Logging**: Logs all validator transactions and swaps for observation

**Mempool Mode:**
1. **Monitoring**: Listens for all pending transactions in the BSC mempool
2. **Detection**: Detects and decodes any DEX swaps in the mempool
3. **Logging**: Logs all mempool transactions and swaps for observation

**Both Modes:**
- 🔗 WebSocket event listeners for real-time blockchain monitoring
- 📊 Detailed logging with timestamps and transaction analysis
- 🎯 Copy trading disabled (observation only)

## Technical Implementation

### Event Listening Architecture

The bot uses **WebSocket connections** to BSC RPC nodes for real-time blockchain monitoring:

**Validator Mode:**
```javascript
// Listens for new block events
provider.on('block', async (blockNumber) => {
  // Fetches block with transactions
  const block = await provider.getBlock(blockNumber, true);

  // Filters transactions from target address
  for (const txHash of block.transactions) {
    const tx = await provider.getTransaction(txHash);
    if (tx.from.toLowerCase() === targetAddress.toLowerCase()) {
      // Decode and analyze transaction
      const decoded = decoder.decodeTransaction(tx);
      // Log detailed transaction info
    }
  }
});
```

**Mempool Mode:**
```javascript
// Listens for pending transactions in mempool
provider.on('pending', async (txHash) => {
  // Fetches pending transaction
  const tx = await provider.getTransaction(txHash);

  if (tx) {
    // Decode and analyze transaction
    const decoded = decoder.decodeTransaction(tx);
    // Log detailed transaction info
  }
});
```

### Transaction Decoding Engine

The bot includes a sophisticated decoder that analyzes:

1. **Method Signatures**: Identifies function calls by their 4-byte signatures
2. **Parameter Extraction**: Decodes function parameters using ABI specifications
3. **Transaction Classification**: Categorizes transactions by type (DEX swaps, transfers, approvals, etc.)
4. **Contract Interaction Analysis**: Identifies which contracts are being called and why

**Example Decoding:**
```javascript
// DEX Swap Detection
if (tx.data.startsWith('0x7ff36ab5')) { // swapExactETHForTokens
  const decoded = iface.decodeFunctionData('swapExactETHForTokens', tx.data);
  return {
    type: 'dex_swap',
    method: 'swapExactETHForTokens',
    fromToken: 'BNB',
    toToken: decoded.path[1],
    amount: tx.value,
    path: decoded.path,
    deadline: decoded.deadline
  };
}
```

### Potential Copy Trading Mechanism

**How Copy Trading Could Work:**

1. **Transaction Detection**: Monitor target wallet for DEX swap transactions
2. **Trade Analysis**: Extract swap details (token pair, amount, direction)
3. **Position Sizing**: Apply multiplier to original trade size
4. **Slippage Management**: Use configured slippage tolerance for execution
5. **Trade Execution**: Execute identical swap using bot's wallet
6. **Risk Management**: Implement stop-loss, position limits, and gas optimization

**Example Copy Trading Flow:**
```javascript
// 1. Detect validator swap
const decodedSwap = decoder.decodeTransaction(validatorTx);

// 2. Calculate copy trade parameters
const copyAmount = originalAmount * tradeSizeMultiplier;
const slippage = copyAmount * slippageTolerance;

// 3. Execute copy trade
const copyTx = await executeSwap({
  fromToken: decodedSwap.fromToken,
  toToken: decodedSwap.toToken,
  amount: copyAmount,
  maxSlippage: slippage
});
```

### Real-Time Monitoring Benefits

- **Mempool Visibility**: See transactions before they're confirmed
- **Front-Running Detection**: Identify when traders are being front-run
- **Market Analysis**: Understand trading patterns and behaviors
- **Risk Assessment**: Evaluate strategy effectiveness in real-time

## Current Status (WIP)

**✅ Implemented:**
- Real-time blockchain monitoring via WebSocket
- Advanced transaction decoding (DEX swaps, ERC-20 transfers, approvals)
- Dual monitoring modes (validator-specific and mempool-wide)
- Detailed transaction analysis with method signatures and parameters

**🚧 In Development:**
- Copy trading execution engine
- Risk management and position sizing
- Gas optimization and balance monitoring
- Multi-DEX support (PancakeSwap V2/V3, Uniswap clones)
- Error recovery and retry mechanisms

**⚠️ Known Limitations:**
- Copy trading execution is currently disabled (observation only)
- No production-ready error handling or recovery
- Limited to BSC network and specific DEX protocols
- No gas price optimization or MEV protection

## Example Output

**Validator Mode:**
```
🤖 BSC Validator Monitor Started
🔍 VALIDATOR MONITORING MODE - OBSERVATION ONLY
📍 Target Address: 0xCa503a7eD99eca485da2E875aedf7758472c378C
🔄 Trade Multiplier: 1x
📊 Slippage: 1.0%
🌐 RPC: https://bsc-dataseed1.binance.org/
🔍 Mode: VALIDATOR
🎯 VALIDATOR MONITORING MODE
🎯 Monitoring validator: 0xca503a7ed99eca485da2e875aedf7758472c378c
📋 Copy trading: DISABLED (observation only)
⏱️  Rate limiting: 100ms minimum interval between checks

🔍 VALIDATOR TRANSACTION DETECTED:
   TX: 0x1234...
   Value: 0.500000 BNB
   To: 0xabcd...
   ⏰ Timestamp: 2024-01-01T12:00:00.000Z

🎯 VALIDATOR SWAP DETECTED:
   From: BNB (1.5)
   To: USDT (1650.1234)
   TX: 0xabcd...
   ⏰ Timestamp: 2024-01-01T12:00:00.000Z
```

**Mempool Mode:**
```
🤖 BSC Validator Monitor Started
🔍 MEMPOOL MONITORING MODE - OBSERVATION ONLY
📍 Target Address: 0x1234567890123456789012345678901234567890
🔄 Trade Multiplier: 1x
📊 Slippage: 1.0%
🌐 RPC: https://bsc-dataseed1.binance.org/
🔍 Mode: MEMPOOL
🔍 MEMPOOL MONITORING MODE - OBSERVATION ONLY
🔍 MEMPOOL MONITORING MODE
📡 Listening for pending transactions in mempool...
⏱️  Rate limiting: 200ms minimum interval between checks

📡 MEMPOOL TRANSACTION:
   From: 0x31ac5EF3Eb6aDe1807a0A7C5423f95c3A25C2417
   To: 0x27E242c1E4E21a1895aac9A3523a965C0c8cE5cc
   Value: 0.000000 BNB
   TX: 0x1f0d1665fc05489c759da759eb8f2d2a2f4eca0b1eb887487feaefbeac465d4f
   ⏰ Timestamp: 2025-10-17T23:43:14.126Z

🎯 MEMPOOL SWAP DETECTED:
   From: WBNB (0.1234)
   To: USDT (456.7890)
   TX: 0x5678...
   ⏰ Timestamp: 2024-01-01T12:00:00.000Z
```

## ⚠️ Important Safety Notice

**🚨 WORK IN PROGRESS - EDUCATIONAL PURPOSES ONLY**

This bot is a **proof-of-concept** and **work-in-progress** designed for:
- Learning blockchain monitoring techniques
- Understanding DEX transaction structures
- Demonstrating copy trading concepts
- Educational and research purposes

**🚫 NOT FOR PRODUCTION USE:**
- Copy trading execution is currently disabled
- No risk management or safety mechanisms implemented
- No error handling for production environments
- **Never use with real funds or in production**

**🔬 For Testing Only:**
- Use testnet environments (BSC Testnet)
- Monitor known test addresses only
- All transactions are logged for analysis, not executed
- Perfect for understanding blockchain mechanics

**📚 Educational Value:**
- Real-time transaction monitoring
- Advanced ABI decoding techniques
- WebSocket event handling
- BSC mempool analysis
