import { deployContract } from "@1inch/solidity-utils";
import { resetHardhatNetworkFork } from "@1inch/solidity-utils/hardhat-setup";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { network } from "hardhat";
import { UniswapV3LikeOracleAbi } from "~/artifacts/contracts/oracles/UniswapV3LikeOracle.sol/UniswapV3LikeOracle.js";
import {
    defaultValues,
    deployParams,
    measureGas,
    testRate,
    tokens,
} from "../helpers.js";

const { UniswapV3, Slipstream } = deployParams;

const { thresholdFilter } = defaultValues;

describe("SlipstreamOracle", function () {
    before(async function () {
        await resetHardhatNetworkFork(network, "optimistic");
    });

    after(async function () {
        await resetHardhatNetworkFork(network, "mainnet");
    });

    async function initContracts() {
        const uniswapV3Oracle = await deployContract<UniswapV3LikeOracleAbi>(
            "UniswapV3LikeOracle",
            [UniswapV3.factory, UniswapV3.initcodeHash, UniswapV3.fees]
        );
        const slipstreamOracle = await deployContract<UniswapV3LikeOracleAbi>(
            "UniswapV3LikeOracle",
            [
                Slipstream.factory,
                Slipstream.initcodeHash,
                Slipstream.tickSpacings,
            ]
        );
        return { uniswapV3Oracle, slipstreamOracle };
    }

    it("USDC -> WETH", async function () {
        const { uniswapV3Oracle, slipstreamOracle } = await loadFixture(
            initContracts
        );

        await testRate(
            tokens.optimistic.USDC,
            tokens.optimistic.WETH,
            tokens.NONE,
            uniswapV3Oracle,
            slipstreamOracle
        );
    });

    it("WETH -> USDC", async function () {
        const { uniswapV3Oracle, slipstreamOracle } = await loadFixture(
            initContracts
        );
        await testRate(
            tokens.optimistic.WETH,
            tokens.optimistic.USDC,
            tokens.NONE,
            uniswapV3Oracle,
            slipstreamOracle
        );
    });

    it("OP -> WETH", async function () {
        const { uniswapV3Oracle, slipstreamOracle } = await loadFixture(
            initContracts
        );
        await testRate(
            tokens.optimistic.OP,
            tokens.optimistic.WETH,
            tokens.NONE,
            uniswapV3Oracle,
            slipstreamOracle
        );
    });

    it("WETH -> OP", async function () {
        const { uniswapV3Oracle, slipstreamOracle } = await loadFixture(
            initContracts
        );
        await testRate(
            tokens.optimistic.WETH,
            tokens.optimistic.OP,
            tokens.NONE,
            uniswapV3Oracle,
            slipstreamOracle
        );
    });

    it("WETH -> USDC -> OP", async function () {
        const { uniswapV3Oracle, slipstreamOracle } = await loadFixture(
            initContracts
        );
        await testRate(
            tokens.optimistic.WETH,
            tokens.optimistic.OP,
            tokens.optimistic.USDC,
            uniswapV3Oracle,
            slipstreamOracle
        );
    });

    it("OP -> USDC -> WETH", async function () {
        const { uniswapV3Oracle, slipstreamOracle } = await loadFixture(
            initContracts
        );
        await testRate(
            tokens.optimistic.OP,
            tokens.optimistic.WETH,
            tokens.optimistic.USDC,
            uniswapV3Oracle,
            slipstreamOracle
        );
    });

    describe("Measure gas", function () {
        it("WETH -> USDC", async function () {
            const { uniswapV3Oracle, slipstreamOracle } = await loadFixture(
                initContracts
            );
            await measureGas(
                await slipstreamOracle
                    .getRate(
                        tokens.optimistic.WETH,
                        tokens.optimistic.USDC,
                        tokens.NONE,
                        thresholdFilter
                    )
                    .then((el) => el.tx),
                "SlipstreamOracle WETH -> USDC"
            );
            await measureGas(
                await uniswapV3Oracle
                    .getRate(
                        tokens.optimistic.WETH,
                        tokens.optimistic.USDC,
                        tokens.NONE,
                        thresholdFilter
                    )
                    .then((el) => el.tx),
                "UniswapV3Oracle WETH -> USDC"
            );
        });

        it("USDC -> WETH", async function () {
            const { uniswapV3Oracle, slipstreamOracle } = await loadFixture(
                initContracts
            );
            await measureGas(
                await slipstreamOracle
                    .getRate(
                        tokens.optimistic.USDC,
                        tokens.optimistic.WETH,
                        tokens.NONE,
                        thresholdFilter
                    )
                    .then((el) => el.tx),
                "SlipstreamOracle USDC -> WETH"
            );
            await measureGas(
                await uniswapV3Oracle
                    .getRate(
                        tokens.optimistic.USDC,
                        tokens.optimistic.WETH,
                        tokens.NONE,
                        thresholdFilter
                    )
                    .then((el) => el.tx),
                "UniswapV3Oracle USDC -> WETH"
            );
        });

        it("WETH -> OP -> USDC", async function () {
            const { uniswapV3Oracle, slipstreamOracle } = await loadFixture(
                initContracts
            );
            await measureGas(
                await slipstreamOracle
                    .getRate(
                        tokens.optimistic.WETH,
                        tokens.optimistic.USDC,
                        tokens.optimistic.OP,
                        thresholdFilter
                    )
                    .then((el) => el.tx),
                "SlipstreamOracle WETH -> OP -> USDC"
            );
            await measureGas(
                await uniswapV3Oracle
                    .getRate(
                        tokens.optimistic.WETH,
                        tokens.optimistic.USDC,
                        tokens.optimistic.OP,
                        thresholdFilter
                    )
                    .then((el) => el.tx),
                "UniswapV3Oracle WETH -> OP -> USDC"
            );
        });
    });
});
