# BSC Copy Trading Bot - POC

A simple proof-of-concept copy trading bot for Binance Smart Chain that monitors a target wallet and executes similar trades.

## Features

- 🔍 **Two Monitoring Modes**:
  - **Validator Mode**: Monitors specific wallet for transactions
  - **Mempool Mode**: Monitors all pending transactions in mempool
- 🎯 Detects DEX swaps (PancakeSwap V2)
- 📊 Detailed logging with timestamps for observation and testing
- ⚡ Built with Bun.js for optimal performance
- ⏱️ Rate limiting to avoid RPC limits

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
- ⏱️ Rate limiting to avoid RPC limits
- 📊 Detailed logging with timestamps
- 🎯 Copy trading disabled (observation only)

## POC Limitations

- Only supports PancakeSwap V2
- No error recovery or retry logic
- Basic transaction decoding (may miss some edge cases)
- Simple P&L estimation for logging only
- No gas optimization or balance checks

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

## Safety Note

This is a POC for observation only. **Never use with real funds or production environments.** Always test thoroughly in a safe environment first.
