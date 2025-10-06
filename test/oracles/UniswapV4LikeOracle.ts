import { deployContract } from "@1inch/solidity-utils";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { Address } from "abitype";
import { ethers } from "hardhat";
import { MultiWrapperAbi } from "~/artifacts/contracts/MultiWrapper.sol/MultiWrapper.js";
import { OffchainOracleAbi } from "~/artifacts/contracts/OffchainOracle.sol/OffchainOracle.js";
import { MooniswapOracleAbi } from "~/artifacts/contracts/oracles/MooniswapOracle.sol/MooniswapOracle.js";
import { UniswapOracleAbi } from "~/artifacts/contracts/oracles/UniswapOracle.sol/UniswapOracle.js";
import { UniswapV2LikeOracleAbi } from "~/artifacts/contracts/oracles/UniswapV2LikeOracle.sol/UniswapV2LikeOracle.js";
import { UniswapV4LikeOracleAbi } from "~/artifacts/contracts/oracles/UniswapV4LikeOracle.sol/UniswapV4LikeOracle.js";
import { AaveWrapperV1Abi } from "~/artifacts/contracts/wrappers/AaveWrapperV1.sol/AaveWrapperV1.js";
import { AaveWrapperV2Abi } from "~/artifacts/contracts/wrappers/AaveWrapperV2.sol/AaveWrapperV2.js";
import { BaseCoinWrapperAbi } from "~/artifacts/contracts/wrappers/BaseCoinWrapper.sol/BaseCoinWrapper.js";
import {
    deployParams,
    testRate,
    testRateOffchainOracle,
    tokens,
} from "../helpers.js";

const { UniswapV2, UniswapV4, Uniswap, AaveWrapperV2 } = deployParams;

describe("UniswapV4LikeOracle", function () {
    async function initContracts() {
        const uniswapV2LikeOracle =
            await deployContract<UniswapV2LikeOracleAbi>(
                "UniswapV2LikeOracle",
                [UniswapV2.factory, UniswapV2.initcodeHash]
            );
        const uniswapV4Oracle = await deployContract<UniswapV4LikeOracleAbi>(
            "UniswapV4LikeOracle",
            [UniswapV4.stateView, UniswapV4.fees, UniswapV4.tickSpacings]
        );
        return { uniswapV2LikeOracle, uniswapV4Oracle };
    }

    describe("UniswapV4", function () {
        it("USDC -> USDT", async function () {
            const { uniswapV2LikeOracle, uniswapV4Oracle } = await loadFixture(
                initContracts
            );
            await testRate(
                tokens.USDC,
                tokens.USDT,
                tokens.NONE,
                uniswapV2LikeOracle,
                uniswapV4Oracle
            );
        });

        it("USDT -> USDC", async function () {
            const { uniswapV2LikeOracle, uniswapV4Oracle } = await loadFixture(
                initContracts
            );
            await testRate(
                tokens.USDT,
                tokens.USDC,
                tokens.NONE,
                uniswapV2LikeOracle,
                uniswapV4Oracle
            );
        });

        it("USDC -> WETH", async function () {
            const { uniswapV2LikeOracle, uniswapV4Oracle } = await loadFixture(
                initContracts
            );
            await testRate(
                tokens.USDC,
                tokens.WETH,
                tokens.NONE,
                uniswapV2LikeOracle,
                uniswapV4Oracle
            );
        });

        it("WETH -> USDC", async function () {
            const { uniswapV2LikeOracle, uniswapV4Oracle } = await loadFixture(
                initContracts
            );
            await testRate(
                tokens.WETH,
                tokens.USDC,
                tokens.NONE,
                uniswapV2LikeOracle,
                uniswapV4Oracle
            );
        });
    });
});

describe("UniswapV4LikeOracle doesn't ruin rates", function () {
    async function initContracts() {
        const [deployer] = await ethers.getSigners();
        const deployerAddress = deployer.address as Address;

        const uniswapV2LikeOracle =
            await deployContract<UniswapV2LikeOracleAbi>(
                "UniswapV2LikeOracle",
                [UniswapV2.factory, UniswapV2.initcodeHash]
            );
        const uniswapV4Oracle = await deployContract<UniswapV4LikeOracleAbi>(
            "UniswapV4LikeOracle",
            [UniswapV4.stateView, UniswapV4.fees, UniswapV4.tickSpacings]
        );
        const uniswapOracle = await deployContract<UniswapOracleAbi>(
            "UniswapOracle",
            [Uniswap.factory]
        );
        const mooniswapOracle = await deployContract<MooniswapOracleAbi>(
            "MooniswapOracle",
            [tokens.oneInchLP1]
        );

        const wethWrapper = await deployContract<BaseCoinWrapperAbi>(
            "BaseCoinWrapper",
            [tokens.ETH, tokens.WETH]
        );
        const aaveWrapperV1 = await deployContract<AaveWrapperV1Abi>(
            "AaveWrapperV1",
            []
        );
        const aaveWrapperV2 = await deployContract<AaveWrapperV2Abi>(
            "AaveWrapperV2",
            [AaveWrapperV2.lendingPool]
        );
        await aaveWrapperV1.addMarkets([tokens.DAI]);
        await aaveWrapperV2.addMarkets([tokens.DAI]);

        const wethWrapperAddress = await wethWrapper.getAddress();
        const aaveWrapperV1Address = await aaveWrapperV1.getAddress();
        const aaveWrapperV2Address = await aaveWrapperV2.getAddress();

        const multiWrapper = await deployContract<MultiWrapperAbi>(
            "MultiWrapper",
            [
                [
                    wethWrapperAddress,
                    aaveWrapperV1Address,
                    aaveWrapperV2Address,
                ],
                deployerAddress,
            ]
        );

        const multiWrapperAddress = await multiWrapper.getAddress();
        const uniswapV2LikeOracleAddress =
            await uniswapV2LikeOracle.getAddress();
        const uniswapOracleAddress = await uniswapOracle.getAddress();
        const mooniswapOracleAddress = await mooniswapOracle.getAddress();

        const oldOffchainOracle = await deployContract<OffchainOracleAbi>(
            "OffchainOracle",
            [
                multiWrapperAddress,
                [
                    uniswapV2LikeOracleAddress,
                    uniswapOracleAddress,
                    mooniswapOracleAddress,
                ],
                [0, 1, 2],
                [tokens.NONE, tokens.ETH, tokens.WETH, tokens.USDC, tokens.DAI],
                tokens.WETH,
                deployerAddress,
            ]
        );

        const uniswapV4OracleAddress = await uniswapV4Oracle.getAddress();

        const deployOffchainOracle = await deployContract<OffchainOracleAbi>(
            "OffchainOracle",
            [
                multiWrapperAddress,
                [
                    uniswapV2LikeOracleAddress,
                    uniswapOracleAddress,
                    mooniswapOracleAddress,
                    uniswapV4OracleAddress,
                ],
                [0, 1, 2, 0],
                [tokens.NONE, tokens.ETH, tokens.WETH, tokens.USDC, tokens.DAI],
                tokens.WETH,
                deployerAddress,
            ]
        );
        return { oldOffchainOracle, deployOffchainOracle };
    }

    it("ETH -> DAI", async function () {
        const { oldOffchainOracle, deployOffchainOracle } = await loadFixture(
            initContracts
        );
        await testRateOffchainOracle(
            tokens.ETH,
            tokens.DAI,
            oldOffchainOracle,
            deployOffchainOracle
        );
    });

    it("DAI -> ETH", async function () {
        const { oldOffchainOracle, deployOffchainOracle } = await loadFixture(
            initContracts
        );
        await testRateOffchainOracle(
            tokens.DAI,
            tokens.ETH,
            oldOffchainOracle,
            deployOffchainOracle
        );
    });

    it("WETH -> DAI", async function () {
        const { oldOffchainOracle, deployOffchainOracle } = await loadFixture(
            initContracts
        );
        await testRateOffchainOracle(
            tokens.WETH,
            tokens.DAI,
            oldOffchainOracle,
            deployOffchainOracle
        );
    });

    it("DAI -> WETH", async function () {
        const { oldOffchainOracle, deployOffchainOracle } = await loadFixture(
            initContracts
        );
        await testRateOffchainOracle(
            tokens.DAI,
            tokens.WETH,
            oldOffchainOracle,
            deployOffchainOracle
        );
    });

    it("USDC -> DAI", async function () {
        const { oldOffchainOracle, deployOffchainOracle } = await loadFixture(
            initContracts
        );
        await testRateOffchainOracle(
            tokens.USDC,
            tokens.DAI,
            oldOffchainOracle,
            deployOffchainOracle
        );
    });

    it("DAI -> USDC", async function () {
        const { oldOffchainOracle, deployOffchainOracle } = await loadFixture(
            initContracts
        );
        await testRateOffchainOracle(
            tokens.DAI,
            tokens.USDC,
            oldOffchainOracle,
            deployOffchainOracle
        );
    });

    it("USDC -> WETH", async function () {
        const { oldOffchainOracle, deployOffchainOracle } = await loadFixture(
            initContracts
        );
        await testRateOffchainOracle(
            tokens.USDC,
            tokens.WETH,
            oldOffchainOracle,
            deployOffchainOracle
        );
    });

    it("WETH -> USDC", async function () {
        const { oldOffchainOracle, deployOffchainOracle } = await loadFixture(
            initContracts
        );
        await testRateOffchainOracle(
            tokens.WETH,
            tokens.USDC,
            oldOffchainOracle,
            deployOffchainOracle
        );
    });
});
