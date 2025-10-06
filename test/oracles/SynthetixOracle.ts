import { deployContract, expect } from "@1inch/solidity-utils";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SynthetixOracleAbi } from "~/artifacts/contracts/oracles/SynthetixOracle.sol/SynthetixOracle";
import { UniswapV3LikeOracleAbi } from "~/artifacts/contracts/oracles/UniswapV3LikeOracle.sol/UniswapV3LikeOracle";
import { Address } from "../../types/common.js";
import { deployParams, testRate, tokens } from "../helpers.js";
const { Synthetix, UniswapV3 } = deployParams;

describe("SynthetixOracle", function () {
    function symbolToBytes(symbol: string) {
        let result: Address = "0x";

        for (let i = 0; i < symbol.length; i++) {
            result += symbol.charCodeAt(i).toString(16);
        }

        return result;
    }

    it("should correctly convert bytes to symbol on JS side", async function () {
        expect(symbolToBytes("sLINK")).equal("0x734c494e4b");
        expect(symbolToBytes("sKRW")).equal("0x734b5257");
    });

    async function initContracts() {
        const synthetixOracle = await deployContract<SynthetixOracleAbi>(
            "SynthetixOracle",
            [Synthetix.proxy]
        );
        const uniswapV3Oracle = await deployContract<UniswapV3LikeOracleAbi>(
            "UniswapV3LikeOracle",
            [UniswapV3.factory, UniswapV3.initcodeHash, UniswapV3.fees]
        );
        return { synthetixOracle, uniswapV3Oracle };
    }

    it("should revert for unregistered token", async function () {
        const { synthetixOracle } = await loadFixture(initContracts);
        const incorrectSREN = "0x4287dac1cC7434991119Eba7413189A66fFE65cF";
        await expect(
            testRate(incorrectSREN, tokens.sKRW, tokens.NONE, synthetixOracle)
        ).to.be.revertedWithCustomError(synthetixOracle, "UnregisteredToken");
    });

    it("should revert on connector usage", async function () {
        const { synthetixOracle } = await loadFixture(initContracts);
        await expect(
            testRate(
                [tokens.sBTC, tokens.WBTC],
                [tokens.ETH, tokens.WETH],
                tokens.USDC,
                synthetixOracle
            )
        ).to.be.revertedWithCustomError(
            synthetixOracle,
            "ConnectorShouldBeNone"
        );
    });

    it("BTC -> ETH", async function () {
        const { synthetixOracle, uniswapV3Oracle } = await loadFixture(
            initContracts
        );
        await testRate(
            [tokens.sBTC, tokens.WBTC],
            [tokens.ETH, tokens.WETH],
            tokens.NONE,
            synthetixOracle,
            uniswapV3Oracle
        );
    });

    it("ETH -> BTC", async function () {
        const { synthetixOracle, uniswapV3Oracle } = await loadFixture(
            initContracts
        );
        await testRate(
            [tokens.ETH, tokens.WETH],
            [tokens.sBTC, tokens.WBTC],
            tokens.NONE,
            synthetixOracle,
            uniswapV3Oracle
        );
    });

    it("USDC -> ETH", async function () {
        const { synthetixOracle, uniswapV3Oracle } = await loadFixture(
            initContracts
        );
        await testRate(
            [tokens.sUSD, tokens.USDC],
            [tokens.ETH, tokens.WETH],
            tokens.NONE,
            synthetixOracle,
            uniswapV3Oracle
        );
    });

    it("ETH -> USDC", async function () {
        const { synthetixOracle, uniswapV3Oracle } = await loadFixture(
            initContracts
        );
        await testRate(
            [tokens.ETH, tokens.WETH],
            [tokens.sUSD, tokens.USDC],
            tokens.NONE,
            synthetixOracle,
            uniswapV3Oracle
        );
    });

    it("SNX -> ETH", async function () {
        const { synthetixOracle, uniswapV3Oracle } = await loadFixture(
            initContracts
        );
        await testRate(
            [tokens.SNX, tokens.SNX],
            [tokens.ETH, tokens.WETH],
            tokens.NONE,
            synthetixOracle,
            uniswapV3Oracle
        );
    });

    it("ETH -> SNX", async function () {
        const { synthetixOracle, uniswapV3Oracle } = await loadFixture(
            initContracts
        );
        await testRate(
            [tokens.ETH, tokens.WETH],
            [tokens.SNX, tokens.SNX],
            tokens.NONE,
            synthetixOracle,
            uniswapV3Oracle
        );
    });
});
