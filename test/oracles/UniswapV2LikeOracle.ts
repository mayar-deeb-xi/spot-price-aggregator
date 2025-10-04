import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect, ether } from "@1inch/solidity-utils";
import {
    tokens,
    deployParams,
    defaultValues,
    deployContract,
} from "../helpers.js";
import { UniswapV2LikeOracleAbi } from "~/artifacts/contracts/oracles/UniswapV2LikeOracle.sol/UniswapV2LikeOracle.js";

const { ShibaSwap, UniswapV2 } = deployParams;

const { thresholdFilter } = defaultValues;

describe("UniswapV2LikeOracle", function () {
    describe("UniswapV2", function () {
        async function initContracts() {
            const uniswapV2Oracle =
                await deployContract<UniswapV2LikeOracleAbi>(
                    "UniswapV2LikeOracle",
                    [UniswapV2.factory, UniswapV2.initcodeHash]
                );
            return { uniswapV2Oracle };
        }

        it("WETH -> DAI", async function () {
            const { uniswapV2Oracle } = await loadFixture(initContracts);
            const rate = await uniswapV2Oracle.getRate(
                tokens.WETH,
                tokens.DAI,
                tokens.NONE,
                thresholdFilter
            );
            expect(rate.rate).to.gt(ether("1000"));
        });

        it("WETH -> USDC -> DAI", async function () {
            const { uniswapV2Oracle } = await loadFixture(initContracts);
            const rate = await uniswapV2Oracle.getRate(
                tokens.WETH,
                tokens.DAI,
                tokens.USDC,
                thresholdFilter
            );
            expect(rate.rate).to.gt(ether("1000"));
        });
    });

    describe("Shibaswap", function () {
        async function initContracts() {
            const shibaswapOracle =
                await deployContract<UniswapV2LikeOracleAbi>(
                    "UniswapV2LikeOracle",
                    [ShibaSwap.factory, ShibaSwap.initcodeHash]
                );
            return { shibaswapOracle };
        }

        it("WETH -> DAI", async function () {
            const { shibaswapOracle } = await loadFixture(initContracts);
            const rate = await shibaswapOracle.getRate(
                tokens.WETH,
                tokens.DAI,
                tokens.NONE,
                thresholdFilter
            );
            expect(rate.rate).to.gt(ether("1000"));
        });

        it("WETH -> USDC -> DAI", async function () {
            const { shibaswapOracle } = await loadFixture(initContracts);
            const rate = await shibaswapOracle.getRate(
                tokens.WETH,
                tokens.DAI,
                tokens.USDC,
                thresholdFilter
            );
            expect(rate.rate).to.gt(ether("1000"));
        });
    });
});
