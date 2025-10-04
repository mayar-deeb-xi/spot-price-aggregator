import { resetHardhatNetworkFork } from "@1inch/solidity-utils/hardhat-setup";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers, network } from "hardhat";
import { AlgebraOracleAbi } from "~/artifacts/contracts/oracles/AlgebraOracle.sol/AlgebraOracle.js";
import { UniswapV3LikeOracleAbi } from "~/artifacts/contracts/oracles/UniswapV3LikeOracle.sol/UniswapV3LikeOracle.js";
import { deployContract, deployParams, testRate, tokens } from "../helpers.js";

const { QuickSwapV3, UniswapV3Polygon } = deployParams;

describe("AlgebraOracle", function () {
    before(async function () {
        await resetHardhatNetworkFork(network, "matic");
    });

    after(async function () {
        await resetHardhatNetworkFork(network, "mainnet");
    });

    async function initContracts() {
        // [parameters ref](contracts/oracles/AlgebraOracle.sol)
        const algebraOracle = await deployContract<AlgebraOracleAbi>(
            "AlgebraOracle",
            [QuickSwapV3.factory, QuickSwapV3.initcodeHash]
        );

        // [parameters ref](contracts/oracles/UniswapV3LikeOracle.sol)
        const uniswapV3Oracle = await deployContract<UniswapV3LikeOracleAbi>(
            "UniswapV3LikeOracle",
            [
                UniswapV3Polygon.factory,
                UniswapV3Polygon.initcodeHash,
                UniswapV3Polygon.fees,
            ]
        );

        return {
            algebraOracle,
            uniswapV3Oracle,
        };
    }

    describe("QuickSwapV3", function () {
        it("USDC -> WETH", async function () {
            const { algebraOracle, uniswapV3Oracle } = await loadFixture(
                initContracts
            );

            await testRate(
                tokens.matic.USDC,
                tokens.matic.WETH,
                tokens.NONE,
                algebraOracle,
                uniswapV3Oracle
            );
        });

        it("WETH -> USDC", async function () {
            const { algebraOracle, uniswapV3Oracle } = await loadFixture(
                initContracts
            );
            await testRate(
                tokens.matic.WETH,
                tokens.matic.USDC,
                tokens.NONE,
                algebraOracle,
                uniswapV3Oracle
            );
        });

        it("WETH -> WMATIC", async function () {
            const { algebraOracle, uniswapV3Oracle } = await loadFixture(
                initContracts
            );
            await testRate(
                tokens.matic.WETH,
                tokens.matic.WMATIC,
                tokens.NONE,
                algebraOracle,
                uniswapV3Oracle
            );
        });

        it("WMATIC -> WETH", async function () {
            const { algebraOracle, uniswapV3Oracle } = await loadFixture(
                initContracts
            );
            await testRate(
                tokens.matic.WMATIC,
                tokens.matic.WETH,
                tokens.NONE,
                algebraOracle,
                uniswapV3Oracle
            );
        });

        it("WMATIC -> USDC -> WETH", async function () {
            const { algebraOracle, uniswapV3Oracle } = await loadFixture(
                initContracts
            );
            await testRate(
                tokens.matic.WMATIC,
                tokens.matic.WETH,
                tokens.matic.USDC,
                algebraOracle,
                uniswapV3Oracle
            );
        });

        it("WETH -> USDC -> WMATIC", async function () {
            const { algebraOracle, uniswapV3Oracle } = await loadFixture(
                initContracts
            );
            await testRate(
                tokens.matic.WETH,
                tokens.matic.WMATIC,
                tokens.matic.USDC,
                algebraOracle,
                uniswapV3Oracle
            );
        });
    });
});
