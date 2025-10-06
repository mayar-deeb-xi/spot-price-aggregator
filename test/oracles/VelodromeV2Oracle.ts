import { deployContract } from "@1inch/solidity-utils";
import { resetHardhatNetworkFork } from "@1inch/solidity-utils/hardhat-setup";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { network } from "hardhat";
import { SolidlyOracleAbi } from "~/artifacts/contracts/oracles/SolidlyOracle.sol/SolidlyOracle.js";
import { UniswapV3LikeOracleAbi } from "~/artifacts/contracts/oracles/UniswapV3LikeOracle.sol/UniswapV3LikeOracle.js";
import {
    defaultValues,
    deployParams,
    measureGas,
    testRate,
    tokens,
} from "../helpers.js";

const { VelodromeV2, UniswapV3 } = deployParams;
const { thresholdFilter } = defaultValues;

describe("VelodromeV2Oracle", function () {
    before(async function () {
        await resetHardhatNetworkFork(network, "optimistic");
    });

    after(async function () {
        await resetHardhatNetworkFork(network, "mainnet");
    });

    async function initContracts() {
        const velodromeV2Oracle = await deployContract<SolidlyOracleAbi>(
            "SolidlyOracle",
            [VelodromeV2.factory, VelodromeV2.initcodeHash]
        );
        const uniswapV3Oracle = await deployContract<UniswapV3LikeOracleAbi>(
            "UniswapV3LikeOracle",
            [UniswapV3.factory, UniswapV3.initcodeHash, UniswapV3.fees]
        );
        return { velodromeV2Oracle, uniswapV3Oracle };
    }

    it("WETH -> USDC", async function () {
        const { velodromeV2Oracle, uniswapV3Oracle } = await loadFixture(
            initContracts
        );
        await testRate(
            tokens.optimistic.WETH,
            tokens.optimistic.USDC,
            tokens.NONE,
            velodromeV2Oracle,
            uniswapV3Oracle
        );
    });

    it("USDC -> WETH", async function () {
        const { velodromeV2Oracle, uniswapV3Oracle } = await loadFixture(
            initContracts
        );
        await testRate(
            tokens.optimistic.USDC,
            tokens.optimistic.WETH,
            tokens.NONE,
            velodromeV2Oracle,
            uniswapV3Oracle
        );
    });

    it("WETH -> OP -> USDC", async function () {
        const { velodromeV2Oracle, uniswapV3Oracle } = await loadFixture(
            initContracts
        );
        await testRate(
            tokens.optimistic.WETH,
            tokens.optimistic.USDC,
            tokens.optimistic.OP,
            velodromeV2Oracle,
            uniswapV3Oracle
        );
    });

    describe("Measure gas", function () {
        it("WETH -> USDC", async function () {
            const { velodromeV2Oracle, uniswapV3Oracle } = await loadFixture(
                initContracts
            );
            await measureGas(
                await velodromeV2Oracle
                    .getFunction("getRate")
                    .send(
                        tokens.optimistic.WETH,
                        tokens.optimistic.USDC,
                        tokens.NONE,
                        thresholdFilter
                    ),
                "VelodromeV2Oracle WETH -> USDC"
            );
            await measureGas(
                await uniswapV3Oracle
                    .getFunction("getRate")
                    .send(
                        tokens.optimistic.WETH,
                        tokens.optimistic.USDC,
                        tokens.NONE,
                        thresholdFilter
                    ),
                "UniswapV3Oracle WETH -> USDC"
            );
        });

        it("USDC -> WETH", async function () {
            const { velodromeV2Oracle, uniswapV3Oracle } = await loadFixture(
                initContracts
            );
            await measureGas(
                await velodromeV2Oracle
                    .getFunction("getRate")
                    .send(
                        tokens.optimistic.USDC,
                        tokens.optimistic.WETH,
                        tokens.NONE,
                        thresholdFilter
                    ),
                "VelodromeV2Oracle USDC -> WETH"
            );
            await measureGas(
                await uniswapV3Oracle
                    .getFunction("getRate")
                    .send(
                        tokens.optimistic.USDC,
                        tokens.optimistic.WETH,
                        tokens.NONE,
                        thresholdFilter
                    ),
                "UniswapV3Oracle USDC -> WETH"
            );
        });

        it("WETH -> OP -> USDC", async function () {
            const { velodromeV2Oracle, uniswapV3Oracle } = await loadFixture(
                initContracts
            );
            await measureGas(
                await velodromeV2Oracle
                    .getFunction("getRate")
                    .send(
                        tokens.optimistic.WETH,
                        tokens.optimistic.USDC,
                        tokens.optimistic.OP,
                        thresholdFilter
                    ),
                "VelodromeV2Oracle WETH -> OP -> USDC"
            );
            await measureGas(
                await uniswapV3Oracle
                    .getFunction("getRate")
                    .send(
                        tokens.optimistic.WETH,
                        tokens.optimistic.USDC,
                        tokens.optimistic.OP,
                        thresholdFilter
                    ),
                "UniswapV3Oracle WETH -> OP -> USDC"
            );
        });
    });
});
