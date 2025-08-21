import { readFileSync, writeFileSync } from "fs";
import { ethers } from "hardhat";

// Constants
export const SECOND = 1;
export const MINUTE = SECOND * 60;
export const HOUR = MINUTE * 60;
export const DAY = HOUR * 24;
export const WEEK = DAY * 7;
export const MONTH = DAY * 30;
export const YEAR = DAY * 365;

// Config object: Tập trung tất cả params để dễ chỉnh sửa
const config = {
    permit2HederaAddress: "0x000000000022D473030F116dDEE9F6B43aC78BA3",
    wHBARAddress: "0xb1f616b8134f602c3bb465fb5b5e6565ccad37ed",
    authorizer: "0x764E0054A7E3274Da20708b7727389A381d7c0D7",
    salt: "0x3877188e9e5da25b11fdb7f5e8d4fdddce2d22707ba04878a8e14700dd46fa82",
    pauseWindowDuration: 4 * MONTH,
    bufferPeriodDuration: 6 * MONTH,
    minTradeAmount: 1e6,
    minWrapAmount: 1e4,
    initialGlobalProtocolSwapFee: ethers.parseEther("0.5"), // 50%
    initialGlobalProtocolYieldFee: ethers.parseEther("0.1"), // 10%
    artifactPaths: {
        vault: "./artifacts-import/vault/Vault.json",
        vaultExtension: "./artifacts-import/vault/VaultExtension.json",
        vaultAdmin: "./artifacts-import/vault/VaultAdmin.json",
        vaultFactory: "./artifacts-import/vault/VaultFactory.json",
        vaultExplorer: "./artifacts-import/vault/VaultExplorer.json",
        wrappedBalancerPoolTokenFactory: "./artifacts-import/vault/WrappedBalancerPoolTokenFactory.json",
        aggregatorBatchRouter: "./artifacts-import/vault/AggregatorBatchRouter.json",
        aggregatorRouter: "./artifacts-import/vault/AggregatorRouter.json",
        protocolFeeController: "./artifacts-import/vault/ProtocolFeeController.json",
        router: "./artifacts-import/vault/Router.json",
        batchRouter: "./artifacts-import/vault/BatchRouter.json",
        bufferRouter: "./artifacts-import/vault/BufferRouter.json",
        compositeLiquidityRouter: "./artifacts-import/vault/CompositeLiquidityRouter.json",
        stablePoolFactory: "./artifacts-import/pool-stable/StablePoolFactory.json",
        stableSurgeHook: "./artifacts-import/pool-hooks/StableSurgeHook.json",
        mevCaptureHook: "./artifacts-import/pool-hooks/MevCaptureHook.json",
        stableSurgePoolFactory: "./artifacts-import/pool-hooks/StableSurgePoolFactory.json",
        poolPauseHelper: "./artifacts-import/standalone-utils/PoolPauseHelper.json",
        poolSwapFeeHelper: "./artifacts-import/standalone-utils/PoolSwapFeeHelper.json",
        protocolFeeHelper: "./artifacts-import/standalone-utils/ProtocolFeeHelper.json",
        balancerContractRegistry: "./artifacts-import/standalone-utils/BalancerContractRegistry.json",
        protocolFeePercentagesProvider: "./artifacts-import/standalone-utils/ProtocolFeePercentagesProvider.json",
        protocolFeeSweeper: "./artifacts-import/standalone-utils/ProtocolFeeSweeper.json",
        balancerFeeBurner: "./artifacts-import/standalone-utils/BalancerFeeBurner.json",
        cowSwapFeeBurner: "./artifacts-import/standalone-utils/CowSwapFeeBurner.json",
        erc4626CowSwapFeeBurner: "./artifacts-import/standalone-utils/ERC4626CowSwapFeeBurner.json",
        tokenPairRegistry: "./artifacts-import/standalone-utils/TokenPairRegistry.json",
        weightedPoolFactory: "./artifacts-import/pool-weighted/WeightedPoolFactory.json",
        lBPMigrationRouter: "./artifacts-import/pool-weighted/lbp/LBPMigrationRouter.json",
        lBPoolFactory: "./artifacts-import/pool-weighted/lbp/LBPoolFactory.json",
        gyro2CLPPoolFactory: "./artifacts-import/pool-gyro/Gyro2CLPPoolFactory.json",
        gyroECLPPoolFactory: "./artifacts-import/pool-gyro/GyroECLPPoolFactory.json",
        reClammPoolFactory: "./artifacts-import/pool-reclamm/ReClammPoolFactory.json",
    },
    jsonMetadata: {
        stablePoolFactory: { name: 'StablePoolFactory', version: 2, deployment: '20250821-v3-stable-pool-v2' },
        stablePool: { name: 'StablePool', version: 2, deployment: '20250821-v3-stable-pool-v2' },
        stableSurgeHook: { name: 'StablePool', version: 2, deployment: '20250821-v3-stable-surge-hook-v2' },
        stableSurgePoolFactory: { name: 'StableSurgePoolFactory', version: 2, deployment: '20250821-v3-stable-surge-pool-factory-v2' },
        stableSurgePool: { name: 'StableSurgePool', version: 2, deployment: '20250821-v3-stable-surge-pool-factory-v2' },
        aggregatorBatchRouter: { name: 'AggregatorBatchRouter', version: 1, deployment: '20250821-v3-aggregator-batch-router' },
        aggregatorRouter: { name: 'AggregatorBatchRouter', version: 1, deployment: '20250821-v3-aggregator-router' },
        cowSwapFeeBurner: { name: 'CowSwapFeeBurner', version: 2, deployment: '20250821-v3-cow-swap-fee-burner' },
        erc4626CowSwapFeeBurner: { name: 'ERC4626CowSwapFeeBurner', version: 2, deployment: '20250821-v3-erc4626-cow-swap-fee-burner-v2' },
        lBPMigrationRouter: { name: 'LBPMigrationRouter', version: 2, deployment: '20250821-v3-liquidity-bootstrapping-pool-v2' },
        lBPoolFactory: { name: 'LBPoolFactory', version: 2, deployment: '20250821-v3-liquidity-bootstrapping-pool-v2' },
        lBPool: { name: 'LBPool', version: 2, deployment: '20250821-v3-liquidity-bootstrapping-pool-v2' },
        router: { name: 'Router', version: 2, deployment: '20250821-v3-router-v2' },
        batchRouter: { name: 'BatchRouter', version: 2, deployment: '20250821-v3-batch-router' },
        bufferRouter: { name: 'BufferRouter', version: 2, deployment: '20250821-v3-buffer-router' },
        weightedPoolFactory: { name: 'WeightedPoolFactory', version: 2, deployment: '20250821-v3-weighted-pool' },
        weightedPool: { name: 'WeightedPool', version: 2, deployment: '20250821-v3-weighted-pool' },
        gyro2CLPPoolFactory: { name: 'Gyro2CLPPoolFactory', version: 2, deployment: '20250821-v3-gyro-2clp' },
        gyro2CLPPool: { name: 'Gyro2CLPPool', version: 2, deployment: '20250821-v3-gyro-2clp' },
        gyroECLPPoolFactory: { name: 'GyroECLPPoolFactory', version: 2, deployment: '20250821-v3-gyro-eclp' },
        gyroECLPPool: { name: 'GyroECLPPool', version: 2, deployment: '20250821-v3-gyro-eclp' },
        compositeLiquidityRouter: { name: 'CompositeLiquidityRouter', version: 2, deployment: '20250821-v3-composite-liquidity-router-v2' },
        reClammPoolFactory: { name: 'ReClammPoolFactory', version: 2, deployment: '20250821-v3-reclamm-pool-v2' },
        reClammPool: { name: 'ReClammPool', version: 2, deployment: '20250821-v3-reclamm-pool-v2' },
    },
};

// Helper function: Đọc artifact từ file
function loadArtifact(path: string) {
    try {
        return JSON.parse(readFileSync(path, "utf8"));
    } catch (error) {
        console.error(`Error loading artifact from ${path}:`, error);
        throw error;
    }
}

// Helper function: Deploy contract và log
async function deployContract(
    name: string,
    abi: any,
    bytecode: string,
    args: any[],
    deployer: any
) {
    const factory = new ethers.ContractFactory(abi, bytecode, deployer);
    console.log(`Deploying ${name} with args:`, args);

    const contract = await factory.deploy(...args);
    await contract.waitForDeployment();

    const address = await contract.getAddress();
    const txHash = contract.deploymentTransaction()?.hash;

    console.log(`${name} deployed to: ${address} (tx: ${txHash})`);
    return { contract, address };
}

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deployer:", await deployer.getAddress());

    // Step 1: Load bytecodes cho Vault-related
    const vaultArtifact = loadArtifact(config.artifactPaths.vault);
    const vaultCreationCode = vaultArtifact.bytecode;

    const vaultExtensionArtifact = loadArtifact(config.artifactPaths.vaultExtension);
    const vaultExtensionCreationCode = vaultExtensionArtifact.bytecode;

    const vaultAdminArtifact = loadArtifact(config.artifactPaths.vaultAdmin);
    const vaultAdminCreationCode = vaultAdminArtifact.bytecode;

    // Step 2: Deploy VaultFactory
    const vaultFactoryArtifact = loadArtifact(config.artifactPaths.vaultFactory);
    const { address: vaultFactoryAddress, contract: vaultFactory } = await deployContract(
        "VaultFactory",
        vaultFactoryArtifact.abi,
        vaultFactoryArtifact.bytecode,
        [
            config.authorizer,
            config.pauseWindowDuration,
            config.bufferPeriodDuration,
            config.minTradeAmount,
            config.minWrapAmount,
            ethers.keccak256(vaultCreationCode),
            ethers.keccak256(vaultExtensionCreationCode),
            ethers.keccak256(vaultAdminCreationCode),
        ],
        deployer
    );

    // Step 3: Lấy vault address dự đoán từ salt
    const vaultAddress = await vaultFactory.getDeploymentAddress(config.salt);
    console.log("Predicted Vault address:", vaultAddress);

    // Step 4: Deploy ProtocolFeeController
    const protocolFeeControllerArtifact = loadArtifact(config.artifactPaths.protocolFeeController);
    const { address: protocolFeeControllerAddress } = await deployContract(
        "ProtocolFeeController",
        protocolFeeControllerArtifact.abi,
        protocolFeeControllerArtifact.bytecode,
        [
            vaultAddress, // Sử dụng vaultAddress dự đoán thay vì targetVaultAddress
            config.initialGlobalProtocolSwapFee,
            config.initialGlobalProtocolYieldFee,
        ],
        deployer
    );

    // Step 5: Create Vault qua VaultFactory
    const createTx = await vaultFactory.create(
        config.salt,
        vaultAddress, // Sử dụng vaultAddress dự đoán
        protocolFeeControllerAddress,
        vaultCreationCode,
        vaultExtensionCreationCode,
        vaultAdminCreationCode
    );
    await createTx.wait();
    console.log("Vault created via VaultFactory (tx:", createTx.hash, ")");

    const vaultAdminAddress = await vaultFactory.deployedVaultAdmins(vaultAddress);
    console.log("VaultAdmin deployed to:", vaultAdminAddress);

    const vaultExtensionAddress = await vaultFactory.deployedVaultExtensions(vaultAddress);
    console.log("VaultExtension deployed to:", vaultExtensionAddress);

    // Step 6: Deploy StablePoolFactory
    const stablePoolFactoryArtifact = loadArtifact(config.artifactPaths.stablePoolFactory);
    const { address: stablePoolFactoryAddress } = await deployContract(
        "StablePoolFactory",
        stablePoolFactoryArtifact.abi,
        stablePoolFactoryArtifact.bytecode,
        [
            vaultAddress, // Sử dụng vaultAddress dự đoán
            4 * 12 * MONTH,
            JSON.stringify(config.jsonMetadata.stablePoolFactory),
            JSON.stringify(config.jsonMetadata.stablePool),
        ],
        deployer
    );

    // Step 7: Deploy StableSurgeHook
    const stableSurgeHookArtifact = loadArtifact(config.artifactPaths.stableSurgeHook);
    const { address: stableSurgeHookAddress } = await deployContract(
        "StableSurgeHook",
        stableSurgeHookArtifact.abi,
        stableSurgeHookArtifact.bytecode,
        [
            vaultAddress, // Sử dụng vaultAddress dự đoán
            ethers.parseEther("0.95"),
            ethers.parseEther("0.3"),
            JSON.stringify(config.jsonMetadata.stableSurgeHook),
        ],
        deployer
    );

    // Step 8: Deploy StableSurgePoolFactory
    const stableSurgePoolFactoryArtifact = loadArtifact(config.artifactPaths.stableSurgePoolFactory);
    const { address: stableSurgePoolFactoryAddress } = await deployContract(
        "StableSurgePoolFactory",
        stableSurgePoolFactoryArtifact.abi,
        stableSurgePoolFactoryArtifact.bytecode,
        [
            stableSurgeHookAddress,
            4 * 12 * MONTH,
            JSON.stringify(config.jsonMetadata.stableSurgePoolFactory),
            JSON.stringify(config.jsonMetadata.stableSurgePool),
        ],
        deployer
    );

    // Step 9: Deploy VaultExplorer
    const vaultExplorerArtifact = loadArtifact(config.artifactPaths.vaultExplorer);
    const { address: vaultExplorerAddress } = await deployContract(
        "VaultExplorer",
        vaultExplorerArtifact.abi,
        vaultExplorerArtifact.bytecode,
        [
            vaultAddress
        ],
        deployer
    );

    // Step 10: Deploy WrappedBalancerPoolTokenFactory
    const wrappedBalancerPoolTokenFactoryArtifact = loadArtifact(config.artifactPaths.wrappedBalancerPoolTokenFactory);
    const { address: wrappedBalancerPoolTokenFactoryAddress } = await deployContract(
        "WrappedBalancerPoolTokenFactory",
        wrappedBalancerPoolTokenFactoryArtifact.abi,
        wrappedBalancerPoolTokenFactoryArtifact.bytecode,
        [
            vaultAddress
        ],
        deployer
    );

    // Step 11: Deploy PoolPauseHelper
    const poolPauseHelperArtifact = loadArtifact(config.artifactPaths.poolPauseHelper);
    const { address: poolPauseHelperAddress } = await deployContract(
        "PoolPauseHelper",
        poolPauseHelperArtifact.abi,
        poolPauseHelperArtifact.bytecode,
        [
            vaultAddress
        ],
        deployer
    );

    // Step 12: Deploy PoolSwapFeeHelper
    const poolSwapFeeHelperArtifact = loadArtifact(config.artifactPaths.poolSwapFeeHelper);
    const { address: poolSwapFeeHelperAddress } = await deployContract(
        "PoolSwapFeeHelper",
        poolSwapFeeHelperArtifact.abi,
        poolSwapFeeHelperArtifact.bytecode,
        [
            vaultAddress
        ],
        deployer
    );

    // Step 13: Deploy ProtocolFeeHelper
    const protocolFeeHelperArtifact = loadArtifact(config.artifactPaths.protocolFeeHelper);
    const { address: protocolFeeHelperAddress } = await deployContract(
        "ProtocolFeeHelper",
        protocolFeeHelperArtifact.abi,
        protocolFeeHelperArtifact.bytecode,
        [
            vaultAddress
        ],
        deployer
    );

    // Step 14: Deploy BalancerContractRegistry
    const balancerContractRegistryArtifact = loadArtifact(config.artifactPaths.balancerContractRegistry);
    const { address: balancerContractRegistryAddress } = await deployContract(
        "BalancerContractRegistry",
        balancerContractRegistryArtifact.abi,
        balancerContractRegistryArtifact.bytecode,
        [
            vaultAddress
        ],
        deployer
    );

    // Step 15: Deploy ProtocolFeePercentagesProvider
    const protocolFeePercentagesProviderArtifact = loadArtifact(config.artifactPaths.protocolFeePercentagesProvider);
    const { address: protocolFeePercentagesProviderAddress } = await deployContract(
        "ProtocolFeePercentagesProvider",
        protocolFeePercentagesProviderArtifact.abi,
        protocolFeePercentagesProviderArtifact.bytecode,
        [
            vaultAddress,
            balancerContractRegistryAddress
        ],
        deployer
    );

    // Step 16: Deploy ProtocolFeeSweeper
    const protocolFeeSweeperArtifact = loadArtifact(config.artifactPaths.protocolFeeSweeper);
    const { address: protocolFeeSweeperAddress } = await deployContract(
        "ProtocolFeeSweeper",
        protocolFeeSweeperArtifact.abi,
        protocolFeeSweeperArtifact.bytecode,
        [
            vaultAddress,
            deployer.address
        ],
        deployer
    );

    // Step 17: Deploy AggregatorBatchRouter
    const aggregatorBatchRouterArtifact = loadArtifact(config.artifactPaths.aggregatorBatchRouter);
    const { address: aggregatorBatchRouterAddress } = await deployContract(
        "AggregatorBatchRouter",
        aggregatorBatchRouterArtifact.abi,
        aggregatorBatchRouterArtifact.bytecode,
        [
            vaultAddress,
            config.wHBARAddress,
            JSON.stringify(config.jsonMetadata.aggregatorBatchRouter)
        ],
        deployer
    );

    // Step 18: Deploy BalancerFeeBurner
    const balancerFeeBurnerArtifact = loadArtifact(config.artifactPaths.balancerFeeBurner);
    const { address: balancerFeeBurnerAddress } = await deployContract(
        "BalancerFeeBurner",
        balancerFeeBurnerArtifact.abi,
        balancerFeeBurnerArtifact.bytecode,
        [
            vaultAddress,
            protocolFeeSweeperAddress,
            deployer.address
        ],
        deployer
    );

    // Step 19: Deploy CowSwapFeeBurner
    const cowSwapFeeBurnerArtifact = loadArtifact(config.artifactPaths.cowSwapFeeBurner);
    const { address: cowSwapFeeBurnerAddress } = await deployContract(
        "CowSwapFeeBurner",
        cowSwapFeeBurnerArtifact.abi,
        cowSwapFeeBurnerArtifact.bytecode,
        [
            protocolFeeSweeperAddress,
            "0xfdaFc9d1902f4e0b84f65F49f244b32b31013b74",
            "0xC92E8bdf79f0507f65a392b0ab4667716BFE0110",
            "0x88745ca0e311940750ba181641eec0b17adc53e3d3ae3359a5a23e84bf2ba0a9",
            deployer.address,
            JSON.stringify(config.jsonMetadata.cowSwapFeeBurner)
        ],
        deployer
    );

    // Step 20: Deploy ERC4626CowSwapFeeBurner
    const erc4626CowSwapFeeBurnerArtifact = loadArtifact(config.artifactPaths.erc4626CowSwapFeeBurner);
    const { address: erc4626CowSwapFeeBurnerAddress } = await deployContract(
        "ERC4626CowSwapFeeBurner",
        erc4626CowSwapFeeBurnerArtifact.abi,
        erc4626CowSwapFeeBurnerArtifact.bytecode,
        [
            protocolFeeSweeperAddress,
            "0xfdaFc9d1902f4e0b84f65F49f244b32b31013b74",
            "0xC92E8bdf79f0507f65a392b0ab4667716BFE0110",
            "0x327a25bb854cc3b776b4157d70cecfc6dbb2d6408e3d5ddeeb45f855542b7063",
            deployer.address,
            JSON.stringify(config.jsonMetadata.erc4626CowSwapFeeBurner)
        ],
        deployer
    );

    // Step 21: Deploy Router
    const routerArtifact = loadArtifact(config.artifactPaths.router);
    const { address: routerAddress } = await deployContract(
        "Router",
        routerArtifact.abi,
        routerArtifact.bytecode,
        [
            vaultAddress,
            config.wHBARAddress,
            config.permit2HederaAddress,
            JSON.stringify(config.jsonMetadata.router)
        ],
        deployer
    );

    // Step 22: Deploy BatchRouter
    const batchRouterArtifact = loadArtifact(config.artifactPaths.batchRouter);
    const { address: batchRouterAddress } = await deployContract(
        "BatchRouter",
        batchRouterArtifact.abi,
        batchRouterArtifact.bytecode,
        [
            vaultAddress,
            config.wHBARAddress,
            config.permit2HederaAddress,
            JSON.stringify(config.jsonMetadata.batchRouter)
        ],
        deployer
    );

    // Step 23: Deploy BufferRouter
    const bufferRouterArtifact = loadArtifact(config.artifactPaths.bufferRouter);
    const { address: bufferRouterAddress } = await deployContract(
        "BufferRouter",
        bufferRouterArtifact.abi,
        bufferRouterArtifact.bytecode,
        [
            vaultAddress,
            config.wHBARAddress,
            config.permit2HederaAddress,
            JSON.stringify(config.jsonMetadata.bufferRouter)
        ],
        deployer
    );

    // Step 24: Deploy WeightedPoolFactory
    const weightedPoolFactoryArtifact = loadArtifact(config.artifactPaths.weightedPoolFactory);
    const { address: weightedPoolFactoryAddress } = await deployContract(
        "WeightedPoolFactory",
        weightedPoolFactoryArtifact.abi,
        weightedPoolFactoryArtifact.bytecode,
        [
            vaultAddress,
            4 * 12 * MONTH,
            JSON.stringify(config.jsonMetadata.weightedPoolFactory),
            JSON.stringify(config.jsonMetadata.weightedPool)
        ],
        deployer
    );

    // Step 25: Deploy Gyro2CLPPoolFactory
    const gyro2CLPPoolFactoryArtifact = loadArtifact(config.artifactPaths.gyro2CLPPoolFactory);
    const { address: gyro2CLPPoolFactoryAddress } = await deployContract(
        "Gyro2CLPPoolFactory",
        gyro2CLPPoolFactoryArtifact.abi,
        gyro2CLPPoolFactoryArtifact.bytecode,
        [
            vaultAddress,
            4 * 12 * MONTH,
            JSON.stringify(config.jsonMetadata.gyro2CLPPoolFactory),
            JSON.stringify(config.jsonMetadata.gyro2CLPPool)
        ],
        deployer
    );

    // Step 26: Deploy GyroECLPPoolFactory
    const gyroECLPPoolFactoryArtifact = loadArtifact(config.artifactPaths.gyroECLPPoolFactory);
    const { address: gyroECLPPoolFactoryAddress } = await deployContract(
        "GyroECLPPoolFactory",
        gyroECLPPoolFactoryArtifact.abi,
        gyroECLPPoolFactoryArtifact.bytecode,
        [
            vaultAddress,
            4 * 12 * MONTH,
            JSON.stringify(config.jsonMetadata.gyroECLPPoolFactory),
            JSON.stringify(config.jsonMetadata.gyroECLPPool)
        ],
        deployer
    );

    // Step 27: Deploy CompositeLiquidityRouter
    const compositeLiquidityRouterArtifact = loadArtifact(config.artifactPaths.compositeLiquidityRouter);
    const { address: compositeLiquidityRouterAddress } = await deployContract(
        "CompositeLiquidityRouter",
        compositeLiquidityRouterArtifact.abi,
        compositeLiquidityRouterArtifact.bytecode,
        [
            vaultAddress,
            config.wHBARAddress,
            config.permit2HederaAddress,
            JSON.stringify(config.jsonMetadata.compositeLiquidityRouter)
        ],
        deployer
    );

    // Step 28: Deploy MevCaptureHook
    const mevCaptureHookArtifact = loadArtifact(config.artifactPaths.mevCaptureHook);
    const { address: mevCaptureHookAddress } = await deployContract(
        "MevCaptureHook",
        mevCaptureHookArtifact.abi,
        mevCaptureHookArtifact.bytecode,
        [
            vaultAddress,
            balancerContractRegistryAddress,
            1.5e6,
            0.3e9
        ],
        deployer
    );

    // Step 29: Deploy AggregatorRouter
    const aggregatorRouterArtifact = loadArtifact(config.artifactPaths.aggregatorRouter);
    const { address: aggregatorRouterAddress } = await deployContract(
        "AggregatorRouter",
        aggregatorRouterArtifact.abi,
        aggregatorRouterArtifact.bytecode,
        [
            vaultAddress,
            JSON.stringify(config.jsonMetadata.aggregatorRouter)
        ],
        deployer
    );

    // Step 30: Deploy TokenPairRegistry
    const tokenPairRegistryArtifact = loadArtifact(config.artifactPaths.tokenPairRegistry);
    const { address: tokenPairRegistryAddress } = await deployContract(
        "TokenPairRegistry",
        tokenPairRegistryArtifact.abi,
        tokenPairRegistryArtifact.bytecode,
        [
            vaultAddress,
            deployer.address
        ],
        deployer
    );

    // Step 30: Deploy ReClammPoolFactory
    const reClammPoolFactoryArtifact = loadArtifact(config.artifactPaths.reClammPoolFactory);
    const { address: reClammPoolFactoryAddress } = await deployContract(
        "ReClammPoolFactory",
        reClammPoolFactoryArtifact.abi,
        reClammPoolFactoryArtifact.bytecode,
        [
            vaultAddress,
            4 * 12 * MONTH,
            JSON.stringify(config.jsonMetadata.reClammPoolFactory),
            JSON.stringify(config.jsonMetadata.reClammPool)
        ],
        deployer
    );

    // // Step 22: Deploy LBPMigrationRouter
    // const lBPMigrationRouterArtifact = loadArtifact(config.artifactPaths.lBPMigrationRouter);
    // const { address: lBPMigrationRouterAddress } = await deployContract(
    //     "LBPMigrationRouter",
    //     lBPMigrationRouterArtifact.abi,
    //     lBPMigrationRouterArtifact.bytecode,
    //     [
    //         balancerContractRegistryAddress,
    //         JSON.stringify(config.jsonMetadata.lBPMigrationRouter)
    //     ],
    //     deployer
    // );

    // // Step 23: Deploy LBPoolFactory
    // const lBPoolFactoryArtifact = loadArtifact(config.artifactPaths.lBPoolFactory);
    // const { address: lBPoolFactoryAddress } = await deployContract(
    //     "LBPoolFactory",
    //     lBPoolFactoryArtifact.abi,
    //     lBPoolFactoryArtifact.bytecode,
    //     [
    //         vaultAddress,
    //         4 * YEAR,
    //         JSON.stringify(config.jsonMetadata.lBPoolFactory),
    //         JSON.stringify(config.jsonMetadata.lBPool),
    //         routerAddress,
    //         lBPMigrationRouterAddress
    //     ],
    //     deployer
    // );

    // Step 9: Lưu kết quả
    const result = {
        timestamp: new Date().toISOString(),
        VaultFactory: vaultFactoryAddress,
        Vault: vaultAddress,
        ProtocolFeeController: protocolFeeControllerAddress,
        VaultAdmin: vaultAdminAddress,
        VaultExtension: vaultExtensionAddress,
        StablePoolFactory: stablePoolFactoryAddress,
        StableSurgeHook: stableSurgeHookAddress,
        StableSurgePoolFactory: stableSurgePoolFactoryAddress,
        VaultExplorer: vaultExplorerAddress,
        WrappedBalancerPoolTokenFactory: wrappedBalancerPoolTokenFactoryAddress,
        PoolPauseHelper: poolPauseHelperAddress,
        PoolSwapFeeHelper: poolSwapFeeHelperAddress,
        ProtocolFeeHelper: protocolFeeHelperAddress,
        BalancerContractRegistry: balancerContractRegistryAddress,
        ProtocolFeePercentagesProvider: protocolFeePercentagesProviderAddress,
        ProtocolFeeSweeper: protocolFeeSweeperAddress,
        AggregatorBatchRouter: aggregatorBatchRouterAddress,
        BalancerFeeBurner: balancerFeeBurnerAddress,
        CowSwapFeeBurner: cowSwapFeeBurnerAddress,
        ERC4626CowSwapFeeBurner: erc4626CowSwapFeeBurnerAddress,
        Router: routerAddress,
        BatchRouter: batchRouterAddress,
        BufferRouter: bufferRouterAddress,
        WeightedPoolFactory: weightedPoolFactoryAddress,
        Gyro2CLPPoolFactory: gyro2CLPPoolFactoryAddress,
        GyroECLPPoolFactory: gyroECLPPoolFactoryAddress,
        CompositeLiquidityRouter: compositeLiquidityRouterAddress,
        MevCaptureHook: mevCaptureHookAddress,
        AggregatorRouter: aggregatorRouterAddress,
        TokenPairRegistry: tokenPairRegistryAddress,
        ReClammPoolFactory: reClammPoolFactoryAddress
        // LBPMigrationRouter: lBPMigrationRouterAddress,
        // LBPoolFactory: lBPoolFactoryAddress
    };
    writeFileSync("deployments.json", JSON.stringify(result, null, 2));
    console.log("All deployments completed. Saved to deployments.json");
}

main().catch((error) => {
    console.error("Deployment failed:", error);
    process.exitCode = 1;
});