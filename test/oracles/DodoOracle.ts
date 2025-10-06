import { deployContract, expect } from "@1inch/solidity-utils";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { DodoOracleAbi } from "~/artifacts/contracts/oracles/DodoOracle.sol/DodoOracle.js";
import { UniswapV3LikeOracleAbi } from "~/artifacts/contracts/oracles/UniswapV3LikeOracle.sol/UniswapV3LikeOracle.js";
import { deployParams, testRate, tokens } from "../helpers.js";

const { Dodo, UniswapV3 } = deployParams;

describe("DodoOracle", function () {
    async function initContracts() {
        const dodoOracle = await deployContract<DodoOracleAbi>("DodoOracle", [
            Dodo.dodoZoo,
        ]);
        const uniswapV3Oracle = await deployContract<UniswapV3LikeOracleAbi>(
            "UniswapV3LikeOracle",
            [UniswapV3.factory, UniswapV3.initcodeHash, UniswapV3.fees]
        );
        return {
            dodoOracle,
            uniswapV3Oracle,
        };
    }

    it("should revert with amount of pools error", async function () {
        const { dodoOracle } = await loadFixture(initContracts);

        await expect(
            testRate(tokens.USDT, tokens["1INCH"], tokens.NONE, dodoOracle)
        ).to.be.revertedWithCustomError(dodoOracle, "PoolNotFound");
    });

    it("WETH -> USDC", async function () {
        const { dodoOracle, uniswapV3Oracle } = await loadFixture(
            initContracts
        );
        await testRate(
            tokens.WETH,
            tokens.USDC,
            tokens.NONE,
            dodoOracle,
            uniswapV3Oracle
        );
    });

    it("USDC -> WETH", async function () {
        const { dodoOracle, uniswapV3Oracle } = await loadFixture(
            initContracts
        );
        await testRate(
            tokens.USDC,
            tokens.WETH,
            tokens.NONE,
            dodoOracle,
            uniswapV3Oracle
        );
    });

    it("WETH -> USDC -> WBTC", async function () {
        const { dodoOracle, uniswapV3Oracle } = await loadFixture(
            initContracts
        );
        await testRate(
            tokens.WETH,
            tokens.WBTC,
            tokens.USDC,
            dodoOracle,
            uniswapV3Oracle
        );
    });

    it("WBTC -> USDC -> WETH", async function () {
        const { dodoOracle, uniswapV3Oracle } = await loadFixture(
            initContracts
        );
        await testRate(
            tokens.WBTC,
            tokens.WETH,
            tokens.USDC,
            dodoOracle,
            uniswapV3Oracle
        );
    });
});
