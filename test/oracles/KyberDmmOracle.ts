import { deployContract, expect } from "@1inch/solidity-utils";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { KyberDmmOracleAbi } from "~/artifacts/contracts/oracles/KyberDmmOracle.sol/KyberDmmOracle.js";
import { UniswapV3LikeOracleAbi } from "~/artifacts/contracts/oracles/UniswapV3LikeOracle.sol/UniswapV3LikeOracle.js";
import { deployParams, testRate, tokens } from "../helpers.js";

const { KyberDmm, UniswapV3 } = deployParams;

describe("KyberDmmOracle", function () {
    async function initContracts() {
        const kyberDmmOracle = await deployContract<KyberDmmOracleAbi>(
            "KyberDmmOracle",
            [KyberDmm.factory]
        );
        const uniswapV3Oracle = await deployContract<UniswapV3LikeOracleAbi>(
            "UniswapV3LikeOracle",
            [UniswapV3.factory, UniswapV3.initcodeHash, UniswapV3.fees]
        );
        return {
            kyberDmmOracle,
            uniswapV3Oracle,
        };
    }

    it("should revert with amount of pools error", async function () {
        const { kyberDmmOracle } = await loadFixture(initContracts);
        await expect(
            testRate(tokens.USDT, tokens.EEE, tokens.NONE, kyberDmmOracle)
        ).to.be.revertedWithCustomError(kyberDmmOracle, "PoolNotFound");
    });

    it("should revert with amount of pools with connector error", async function () {
        const { kyberDmmOracle } = await loadFixture(initContracts);
        await expect(
            testRate(tokens.USDT, tokens.WETH, tokens.MKR, kyberDmmOracle)
        ).to.be.revertedWithCustomError(
            kyberDmmOracle,
            "PoolWithConnectorNotFound"
        );
    });

    it("USDC -> USDT", async function () {
        const { kyberDmmOracle, uniswapV3Oracle } = await loadFixture(
            initContracts
        );
        await testRate(
            tokens.USDC,
            tokens.USDT,
            tokens.NONE,
            kyberDmmOracle,
            uniswapV3Oracle
        );
    });

    it("USDT -> USDC", async function () {
        const { kyberDmmOracle, uniswapV3Oracle } = await loadFixture(
            initContracts
        );
        await testRate(
            tokens.USDT,
            tokens.USDC,
            tokens.NONE,
            kyberDmmOracle,
            uniswapV3Oracle
        );
    });

    it("WBTC -> WETH", async function () {
        const { kyberDmmOracle, uniswapV3Oracle } = await loadFixture(
            initContracts
        );
        await testRate(
            tokens.WBTC,
            tokens.WETH,
            tokens.NONE,
            kyberDmmOracle,
            uniswapV3Oracle
        );
    });

    it("WETH -> WBTC", async function () {
        const { kyberDmmOracle, uniswapV3Oracle } = await loadFixture(
            initContracts
        );
        await testRate(
            tokens.WETH,
            tokens.WBTC,
            tokens.NONE,
            kyberDmmOracle,
            uniswapV3Oracle
        );
    });

    it("USDC -> USDT -> WBTC", async function () {
        const { kyberDmmOracle, uniswapV3Oracle } = await loadFixture(
            initContracts
        );
        await testRate(
            tokens.USDC,
            tokens.WBTC,
            tokens.USDT,
            kyberDmmOracle,
            uniswapV3Oracle
        );
    });

    it("WBTC -> USDT -> USDC", async function () {
        const { kyberDmmOracle, uniswapV3Oracle } = await loadFixture(
            initContracts
        );
        await testRate(
            tokens.WBTC,
            tokens.USDC,
            tokens.USDT,
            kyberDmmOracle,
            uniswapV3Oracle
        );
    });
});
