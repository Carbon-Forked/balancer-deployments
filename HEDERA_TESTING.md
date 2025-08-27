# Hedera Testnet Testing Guide

This guide explains how to run tests on Hedera testnet using the created scripts.

## Prerequisites

1. **Environment Setup**
   - Node.js v18 or higher
   - Yarn package manager
   - Private key with HBAR balance (≥1 HBAR recommended)
   - WHBAR and YTN tokens in your account

2. **Environment Variables**
   Create a `.env` file with:
   ```
   PRIVATE_KEY=your_private_key_without_0x_prefix
   ```

## Available Scripts

### 1. Validate Existing Deployment
```bash
yarn validate:hedera
```
**What it does:**
- Checks if all deployed contracts are accessible
- Validates contract connections (Router ↔ Vault, Factory ↔ Vault)
- Shows your WHBAR and YTN token balances
- Verifies network connectivity

**Use when:** You want to quickly check if your deployment is working

### 2. Run Full Integration Tests
```bash
yarn test:hedera-runner
```
**What it does:**
- Uses existing deployed contracts from `hederaTestnet-deployments-vaultfactory.json`
- Creates a new weighted pool with native HBAR/YTN pair
- Initializes the pool with liquidity (requires 1 native HBAR + 100 YTN)
- Performs a token swap using native HBAR (requires 0.1 HBAR)
- Uses `wethIsEth = true` for gas-efficient native token handling
- Shows detailed gas usage and balances

**Use when:** You have sufficient native HBAR and want to test the complete flow

### 3. Run Original Test Suite
```bash
yarn test:hedera
```
**What it does:**
- Runs the original FullFlow.test.ts on Hedera testnet
- Deploys AND tests in the same run
- More comprehensive but slower

**Use when:** You want to run the full test suite including deployment

### 4. Deploy Fresh Contracts
```bash
yarn deploy:hedera
```
**What it does:**
- Deploys all Balancer V3 contracts to Hedera testnet
- Updates the deployment file
- Shows deployment addresses and gas costs

**Use when:** You need fresh contract deployments

## Token Requirements

### For Validation Only (`validate:hedera`)
- **No tokens required** - just checks deployment integrity

### For Full Testing (`test:hedera-runner`)
- **Native HBAR:** ~1.1 HBAR (1 for liquidity + 0.1 for swap + gas)
- **YTN:** ~100 tokens (for liquidity initialization)
- **Gas costs:** Included in native HBAR usage

**Note:** Uses native HBAR directly (wethIsEth = true)!
- **HBAR**: 8 decimals everywhere (display, amounts, balances)
- **msg.value**: Auto-converted from 8 to 18 decimals when sending transactions
- **Simple**: No complex decimal handling needed

### Getting Test Tokens

1. **WHBAR (Wrapped HBAR)**
   - Address: `0xb1f616b8134f602c3bb465fb5b5e6565ccad37ed`
   - Can be obtained by wrapping HBAR through Hedera DeFi protocols

2. **YTN Token**
   - Address: `0x0000000000000000000000000000000000639ad3`
   - Testnet token - check Hedera testnet faucets or DeFi protocols

## Troubleshooting

### Common Issues

1. **"Insufficient token balance"**
   ```
   Solution: Get more WHBAR/YTN tokens or run validate:hedera instead
   ```

2. **"Not connected to Hedera testnet"**
   ```
   Solution: Check your RPC URL and network configuration
   ```

3. **"Contract not found"**
   ```
   Solution: Run yarn deploy:hedera to deploy fresh contracts
   ```

4. **"Router connection failed"**
   ```
   Solution: Contracts may be from different deployments - redeploy
   ```

### Network Information
- **Chain ID:** 296
- **RPC URL:** `https://testnet.hashio.io/api`
- **Network Name:** Hedera Testnet

## Example Workflow

1. **First Time Setup:**
   ```bash
   # Deploy contracts
   yarn deploy:hedera
   
   # Validate deployment
   yarn validate:hedera
   ```

2. **Regular Testing:**
   ```bash
   # Quick validation
   yarn validate:hedera
   
   # Full test (if you have tokens)
   yarn test:hedera-runner
   ```

3. **Development:**
   ```bash
   # Test locally first
   yarn test:flow
   
   # Then test on Hedera
   yarn test:hedera-runner
   ```

## Script Details

### hedera-validator.ts
- Lightweight validation script
- No token balance requirements
- Quick deployment integrity check

### hedera-test-runner.ts
- Comprehensive integration testing
- Uses existing deployments
- Requires token balances for pool operations
- Detailed logging and error handling

### FullFlow.test.ts
- Original test suite
- Includes deployment + testing
- Most comprehensive but requires more time and gas

Choose the right script based on your needs:
- **Just checking deployment?** → `validate:hedera`
- **Have tokens and want full test?** → `test:hedera-runner`  
- **Need comprehensive suite?** → `test:hedera`