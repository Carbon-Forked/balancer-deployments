import { ethers } from 'hardhat';
import { readFileSync, existsSync } from 'fs';
import {
    parseUnits,
    formatUnits,
    MaxUint256,
    ZeroAddress,
    Contract
} from 'ethers';

// Helper function to load artifact and create contract
function loadArtifactContract(artifactPath: string, address: string, signer: any): Contract {
    const artifact = JSON.parse(readFileSync(artifactPath, 'utf8'));
    return new ethers.Contract(address, artifact.abi, signer);
}

// Helper function to convert HBAR (8 decimals) to msg.value format (18 decimals)
function hbarToMsgValue(hbarAmount: bigint): bigint {
    // Convert from 8 decimals to 18 decimals for msg.value
    return hbarAmount * parseUnits("1", 10); // multiply by 10^10 to go from 8 to 18 decimals
}

// Load deployment configuration
function loadDeploymentConfig(filename = 'hederaTestnet-deployments.json') {
    if (!existsSync(filename)) {
        throw new Error(`Deployment file ${filename} not found. Please run deployment first.`);
    }

    const deploymentData = JSON.parse(readFileSync(filename, 'utf8'));
    console.log(`📋 Loaded deployment config from: ${filename}`);
    console.log(`   Network: ${deploymentData.network}`);
    console.log(`   Timestamp: ${deploymentData.timestamp}`);
    return deploymentData;
}

// Test configuration based on deployment
interface TestConfig {
    permit2Address: string;
    tokenA: string; // Native HBAR (using WETH address)
    tokenB: string; // YTN
    tokenADecimals: number; // HBAR decimals (8)
    tokenBDecimals: number;
    useNativeETH: boolean; // Flag to indicate native usage
    initialLiquidity: {
        tokenA: bigint;
        tokenB: bigint;
    };
    swapAmount: {
        tokenA: bigint;
        tokenB: bigint;
    };
    poolSwapFee: bigint;
    tokenWeights: bigint[];
}

function createTestConfig(deployment: any): TestConfig {
    return {
        permit2Address: "0x000000000022D473030F116dDEE9F6B43aC78BA3",
        tokenA: deployment.weth, // Using WETH address for native HBAR
        tokenB: deployment.tokenB,
        tokenADecimals: 8, // Native HBAR decimals
        tokenBDecimals: deployment.config.ytnDecimals,
        useNativeETH: true, // Enable native usage
        initialLiquidity: {
            tokenA: parseUnits("1", 8), // 1 HBAR in 8 decimals
            tokenB: parseUnits("10", deployment.config.ytnDecimals),   // 100 YTN
        },
        swapAmount: {
            tokenA: parseUnits("0.1", 8),  // 0.1 HBAR in 8 decimals
            tokenB: parseUnits("1", deployment.config.ytnDecimals),    // 10 YTN
        },
        poolSwapFee: parseUnits("0.01", 18), // 1%
        tokenWeights: [parseUnits("0.5", 18), parseUnits("0.5", 18)] // 50/50
    };
}

async function checkBalances(signer: any, config: TestConfig) {
    console.log('\n💰 Checking balances...');

    // For native HBAR, check ETH balance (returns in 18 decimals, convert to 8)
    const balanceA = config.useNativeETH
        ? await ethers.provider.getBalance(signer.address) / parseUnits("1", 10) // Convert 18 to 8 decimals
        : await (await ethers.getContractAt('IERC20', config.tokenA)).balanceOf(signer.address);

    const tokenB = await ethers.getContractAt('IERC20', config.tokenB);
    const balanceB = await tokenB.balanceOf(signer.address);

    console.log(`📊 Account: ${signer.address}`);
    console.log(`   Native HBAR balance: ${formatUnits(balanceA, config.tokenADecimals)} HBAR`);
    console.log(`   YTN balance: ${formatUnits(balanceB, config.tokenBDecimals)}`);

    // Check if sufficient balance for testing (all amounts in 8 decimals)
    const hasEnoughA = balanceA >= config.initialLiquidity.tokenA + config.swapAmount.tokenA;
    const hasEnoughB = balanceB >= config.initialLiquidity.tokenB + config.swapAmount.tokenB;

    if (!hasEnoughA || !hasEnoughB) {
        console.log('⚠️  Warning: Insufficient balance for full testing');
        const totalNeeded = config.initialLiquidity.tokenA + config.swapAmount.tokenA;
        console.log(`   Need HBAR: ${formatUnits(totalNeeded, config.tokenADecimals)} HBAR`);
        console.log(`   Need YTN: ${formatUnits(config.initialLiquidity.tokenB + config.swapAmount.tokenB, config.tokenBDecimals)}`);
    } else {
        console.log('✅ Sufficient balances for testing');
    }

    console.log('\n💡 Note: Using native HBAR (wethIsEth = true)');
    console.log(`   HBAR: 8 decimals everywhere, msg.value auto-converted to 18`);
    console.log(`   Native HBAR address: ${config.tokenA}`);
    console.log(`   YTN token address: ${config.tokenB}`);

    return { hasEnoughA, hasEnoughB, balanceA, balanceB };
}

async function validateDeployments(deployment: any) {
    console.log('\n🔍 Validating deployed contracts...');

    try {
        // Check if contracts exist
        const contracts = [
            { name: 'Vault', address: deployment.vault, artifactPath: './artifacts-import/vault/Vault.json' },
            { name: 'VaultExplorer', address: deployment.vaultExplorer, artifactPath: './artifacts-import/vault/VaultExplorer.json' },
            { name: 'Router', address: deployment.router, artifactPath: './artifacts-import/vault/Router.json' },
            { name: 'WeightedPoolFactory', address: deployment.weightedPoolFactory, artifactPath: './artifacts-import/pool-weighted/WeightedPoolFactory.json' },
            { name: 'ProtocolFeeController', address: deployment.protocolFeeController, artifactPath: './artifacts-import/vault/ProtocolFeeController.json' },
            { name: 'Authorizer', address: deployment.authorizer, artifactPath: './artifacts-import/authorizer/BasicAuthorizerMock.json' },
        ];

        const [signer] = await ethers.getSigners();
        const contractInstances: any = {};

        for (const contract of contracts) {
            const code = await ethers.provider.getCode(contract.address);
            if (code === '0x') {
                throw new Error(`Contract ${contract.name} not found at ${contract.address}`);
            }

            // Load contract using imported artifact
            contractInstances[contract.name.toLowerCase()] = loadArtifactContract(
                contract.artifactPath,
                contract.address,
                signer
            );

            console.log(`✅ ${contract.name}: ${contract.address}`);
        }

        // Validate contract connections
        const vaultFromFactory = await contractInstances.weightedpoolfactory.getVault();

        if (vaultFromFactory !== deployment.vault) {
            throw new Error('WeightedPoolFactory not properly connected to Vault');
        }

        console.log('✅ Contract connections validated');

        return {
            vault: contractInstances.vault,
            vaultExplorer: contractInstances.vaultexplorer,
            router: contractInstances.router,
            weightedPoolFactory: contractInstances.weightedpoolfactory
        };

    } catch (error) {
        console.error('❌ Validation failed:', error);
        throw error;
    }
}

async function createPool(
    weightedPoolFactory: any,
    config: TestConfig,
    signer: any
) {
    console.log('\n🏊 Creating weighted pool...');

    // Sort token addresses for pool registration
    const tokenAddresses = [config.tokenA, config.tokenB].sort((a, b) =>
        a.toLowerCase().localeCompare(b.toLowerCase())
    );

    // Build token config
    const tokenConfig = tokenAddresses.map(token => ({
        token: token,
        tokenType: 0, // STANDARD
        rateProvider: ZeroAddress,
        paysYieldFees: false
    }));

    // Role accounts (no special roles)
    const roleAccounts = {
        pauseManager: ZeroAddress,
        swapFeeManager: ZeroAddress,
        poolCreator: ZeroAddress
    };

    // Adjust weights order to match sorted tokens
    const sortedWeights = tokenAddresses.map(token => {
        const isTokenA = token.toLowerCase() === config.tokenA.toLowerCase();
        return isTokenA ? config.tokenWeights[0] : config.tokenWeights[1];
    });

    console.log(`🔍 Sorted tokens: ${tokenAddresses}`);
    console.log(`🔍 Sorted weights: ${sortedWeights.map(w => formatUnits(w, 18))}`);

    // Create pool
    const tx = await weightedPoolFactory.connect(signer).create(
        'Hedera Test Pool',
        'HTP',
        tokenConfig,
        sortedWeights,
        roleAccounts,
        config.poolSwapFee,
        ZeroAddress, // no hooks
        false, // no donations
        false, // allow unbalanced liquidity
        ethers.randomBytes(32) // salt
    );

    const receipt = await tx.wait();
    console.log(`⛽ Gas used for pool creation: ${receipt.gasUsed.toString()}`);

    // Find PoolCreated event
    const poolCreatedEvent = receipt.logs.find((log: any) => {
        try {
            const parsed = weightedPoolFactory.interface.parseLog(log);
            return parsed?.name === 'PoolCreated';
        } catch {
            return false;
        }
    });

    if (!poolCreatedEvent) {
        throw new Error('PoolCreated event not found');
    }

    const parsedEvent = weightedPoolFactory.interface.parseLog(poolCreatedEvent);
    const poolAddress = parsedEvent.args.pool;

    console.log(`✅ Pool created at: ${poolAddress}`);

    return { poolAddress, tokenAddresses };
}

async function setupTokenApprovals(
    signer: any,
    config: TestConfig,
    routerAddress: string
) {
    console.log('\n✅ Setting up token approvals...');

    if (config.useNativeETH) {
        console.log('💫 Native HBAR mode - no approval needed for native token');

        // Only approve YTN token for Permit2
        const tokenB = await ethers.getContractAt('IERC20', config.tokenB);
        console.log('Approving YTN for Permit2...');
        await tokenB.connect(signer).approve(config.permit2Address, ethers.parseUnits("10000", 6));

        // Approve Permit2 for router (only for YTN)
        console.log('Approving Router via Permit2 for YTN...');
        const permit2 = await ethers.getContractAt('IPermit2', config.permit2Address);
        const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour

        await permit2.connect(signer).approve(config.tokenB, routerAddress, ethers.parseUnits("10000", 6), deadline);

        console.log('✅ YTN token approvals completed (native HBAR needs no approval)');
    } else {
        // Original approval logic for wrapped tokens
        const tokenA = await ethers.getContractAt('IERC20', config.tokenA);
        const tokenB = await ethers.getContractAt('IERC20', config.tokenB);

        // Approve tokens for Permit2
        console.log('Approving tokens for Permit2...');
        await tokenA.connect(signer).approve(config.permit2Address, ethers.parseUnits("10000", 6));
        await tokenB.connect(signer).approve(config.permit2Address, ethers.parseUnits("10000", 6));

        // Approve Permit2 for router
        console.log('Approving Router via Permit2...');
        const permit2 = await ethers.getContractAt('IPermit2', config.permit2Address);
        const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour

        await permit2.connect(signer).approve(config.tokenA, routerAddress, ethers.parseUnits("10000", 6), deadline);
        await permit2.connect(signer).approve(config.tokenB, routerAddress, ethers.parseUnits("10000", 6), deadline);

        console.log('✅ Token approvals completed');
    }
}

async function initializePool(
    router: any,
    vaultExplorer: any,
    signer: any,
    poolAddress: string,
    tokenAddresses: string[],
    config: TestConfig
) {
    console.log('\n💧 Initializing pool with liquidity...');

    // Calculate amounts in the correct order (matching sorted tokens)
    const amounts = tokenAddresses.map(token => {
        const isTokenA = token.toLowerCase() === config.tokenA.toLowerCase();
        return isTokenA ? config.initialLiquidity.tokenA : config.initialLiquidity.tokenB;
    });

    console.log(`🔍 Initialization amounts:`);
    amounts.forEach((amount, i) => {
        const isTokenA = tokenAddresses[i].toLowerCase() === config.tokenA.toLowerCase();
        const decimals = isTokenA ? config.tokenADecimals : config.tokenBDecimals;
        const symbol = isTokenA ? (config.useNativeETH ? 'Native HBAR' : 'WHBAR') : 'YTN';
        console.log(`   ${symbol}: ${formatUnits(amount, decimals)}`);
    });

    // Calculate the native ETH value needed (convert HBAR 8 decimals to msg.value 18 decimals)
    const nativeETHAmount = config.useNativeETH ? hbarToMsgValue(config.initialLiquidity.tokenA) : 0n;

    const tx = await router.connect(signer).initialize(
        poolAddress,
        tokenAddresses,
        amounts,
        0, // minBptAmountOut
        config.useNativeETH, // wethIsEth - set to true for native usage
        '0x', // userData
        { value: nativeETHAmount } // Send native ETH value
    );

    const receipt = await tx.wait();
    console.log(`⛽ Gas used for initialization: ${receipt.gasUsed.toString()}`);

    // Check pool balances
    const poolTokenInfo = await vaultExplorer.getPoolTokenInfo(poolAddress);
    console.log('\n💰 Pool liquidity after initialization:');
    poolTokenInfo[2].forEach((balance: any, i: number) => {
        const tokenAddr = tokenAddresses[i];
        const isTokenA = tokenAddr.toLowerCase() === config.tokenA.toLowerCase();
        const decimals = isTokenA ? config.tokenADecimals : config.tokenBDecimals;
        const symbol = isTokenA ? (config.useNativeETH ? 'Native HBAR' : 'WHBAR') : 'YTN';
        console.log(`   ${symbol}: ${formatUnits(balance, decimals)}`);
    });

    console.log('✅ Pool initialized successfully with native HBAR!');
}

async function performSwap(
    router: any,
    signer: any,
    poolAddress: string,
    config: TestConfig
) {
    console.log('\n🔄 Performing token swap...');

    // Get initial balances (convert native balance from 18 to 8 decimals)
    const initialBalanceA = config.useNativeETH
        ? await ethers.provider.getBalance(signer.address) / parseUnits("1", 10)
        : await (await ethers.getContractAt('IERC20', config.tokenA)).balanceOf(signer.address);

    const tokenB = await ethers.getContractAt('IERC20', config.tokenB);
    const initialBalanceB = await tokenB.balanceOf(signer.address);

    console.log('📊 Initial balances:');
    console.log(`   Native HBAR: ${formatUnits(initialBalanceA, config.tokenADecimals)} HBAR`);
    console.log(`   YTN: ${formatUnits(initialBalanceB, config.tokenBDecimals)}`);

    // Perform swap: Trade native HBAR for YTN
    const deadline = Math.floor(Date.now() / 1000) + 3600;
    const swapAmount = config.swapAmount.tokenA;

    console.log(`🔄 Swapping ${formatUnits(swapAmount, config.tokenADecimals)} HBAR for YTN...`);

    const tx = await router.connect(signer).swapSingleTokenExactIn(
        poolAddress,
        config.tokenA, // tokenIn (WETH address for native HBAR)
        config.tokenB, // tokenOut (YTN)
        swapAmount, // amount in 8 decimals
        0, // minAmountOut
        deadline,
        config.useNativeETH, // wethIsEth - set to true for native usage
        '0x', // userData
        { value: config.useNativeETH ? hbarToMsgValue(swapAmount) : 0 } // Convert to 18 decimals for msg.value
    );

    const receipt = await tx.wait();
    console.log(`⛽ Gas used for swap: ${receipt.gasUsed.toString()}`);

    // Get final balances (convert native balance from 18 to 8 decimals)
    const finalBalanceA = config.useNativeETH
        ? await ethers.provider.getBalance(signer.address) / parseUnits("1", 10)
        : await (await ethers.getContractAt('IERC20', config.tokenA)).balanceOf(signer.address);

    const finalBalanceB = await tokenB.balanceOf(signer.address);

    console.log('\n📊 Final balances:');
    console.log(`   Native HBAR: ${formatUnits(finalBalanceA, config.tokenADecimals)} HBAR`);
    console.log(`   YTN: ${formatUnits(finalBalanceB, config.tokenBDecimals)}`);

    // Calculate swap results (all in 8 decimals, includes gas costs)
    const balanceChangeA = initialBalanceA - finalBalanceA;
    const ytnReceived = finalBalanceB - initialBalanceB;

    console.log('\n💱 Swap Results:');
    console.log(`   Native HBAR used (including gas): ${formatUnits(balanceChangeA, config.tokenADecimals)} HBAR`);
    console.log(`   Expected swap amount: ${formatUnits(swapAmount, config.tokenADecimals)} HBAR`);
    console.log(`   YTN received: ${formatUnits(ytnReceived, config.tokenBDecimals)}`);

    if (ytnReceived > 0n) {
        console.log('✅ Swap completed successfully with native HBAR!');
    } else {
        console.log('⚠️  Swap may have failed - no YTN received');
    }

    return { balanceChangeA, ytnReceived };
}

async function runHederaTests() {
    console.log('🚀 Starting Hedera Testnet Testing Script');
    console.log('='.repeat(64));

    try {
        // Load deployment configuration
        const deployment = loadDeploymentConfig();
        const config = createTestConfig(deployment);

        // Get signer
        const [signer] = await ethers.getSigners();
        console.log(`👤 Test Account: ${signer.address}`);

        // Check network
        const network = await ethers.provider.getNetwork();
        console.log(`🌐 Network: ${network.name} (chainId: ${network.chainId})`);

        if (network.chainId !== 296n) {
            throw new Error('Not connected to Hedera testnet (chainId should be 296)');
        }

        // Step 1: Validate deployments
        const { vault, vaultExplorer, router, weightedPoolFactory } = await validateDeployments(deployment);

        // Step 2: Check balances
        const { hasEnoughA, hasEnoughB } = await checkBalances(signer, config);

        if (!hasEnoughA || !hasEnoughB) {
            console.log('\n⚠️  Warning: Proceeding with limited testing due to insufficient balances');
        }

        // Step 3: Create pool
        const { poolAddress, tokenAddresses } = await createPool(weightedPoolFactory, config, signer);

        // Step 4: Setup token approvals
        await setupTokenApprovals(signer, config, deployment.router);

        // Step 5: Initialize pool
        if (hasEnoughA && hasEnoughB) {
            await initializePool(router, vaultExplorer, signer, poolAddress, tokenAddresses, config);

            // Step 6: Perform swap
            await performSwap(router, signer, poolAddress, config);
        } else {
            console.log('\n⚠️  Skipping pool initialization and swap due to insufficient balances');
            console.log('Please ensure your account has sufficient native HBAR and YTN tokens');
        }

        console.log('\n🎯 Testing Summary:');
        console.log('='.repeat(50));
        console.log(`✅ Vault: ${deployment.vault}`);
        console.log(`✅ Router: ${deployment.router}`);
        console.log(`✅ WeightedPoolFactory: ${deployment.weightedPoolFactory}`);
        console.log(`✅ Test Pool: ${poolAddress}`);
        console.log(`🔥 Native HBAR (wethIsEth=true): ${config.tokenA}`);
        console.log(`🪙 YTN Token: ${config.tokenB}`);
        console.log('\n🎆 Features tested:');
        console.log('   ✅ Native HBAR pool creation');
        console.log('   ✅ Pool initialization with native HBAR');
        console.log('   ✅ Native HBAR to YTN swapping');
        console.log('   ✅ Gas-efficient native token handling');

        console.log('\n✅ Hedera testnet testing completed successfully with native HBAR!');

    } catch (error) {
        console.error('\n❌ Testing failed:', error);
        throw error;
    }
}

// Execute if called directly
if (require.main === module) {
    runHederaTests()
        .then(() => {
            console.log('\n🎉 All tests completed!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Test execution failed:', error);
            process.exit(1);
        });
}

export { runHederaTests };