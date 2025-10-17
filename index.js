#!/usr/bin/env bun

import { BSCCopyTradingBot } from './bot.js';

/**
 * BSC Copy Trading Bot - POC Entry Point
 *
 * This bot monitors a target wallet on BSC and executes copy trades
 * when the target wallet performs DEX swaps on PancakeSwap V2.
 */

// Start the bot
const bot = new BSCCopyTradingBot();
