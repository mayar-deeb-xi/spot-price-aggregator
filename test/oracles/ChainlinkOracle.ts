import { expect } from "@1inch/solidity-utils";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";
import { ChainlinkOracleAbi } from "~/artifacts/contracts/oracles/ChainlinkOracle.sol/ChainlinkOracle.js";
import { UniswapV3LikeOracleAbi } from "~/artifacts/contracts/oracles/UniswapV3LikeOracle.sol/UniswapV3LikeOracle.js";
import { deployParams, testRate, tokens } from "../helpers.js";
import { deployContract } from "@1inch/solidity-utils";

const { Chainlink, UniswapV3 } = deployParams;

describe("ChainlinkOracle", function () {
    async function initContracts() {
        const ContractFactory = await ethers.getContractFactory(
            "ChainlinkOracle"
        );
        const instance = await ContractFactory.deploy([
            UniswapV3.factory,
            UniswapV3.initcodeHash,
            UniswapV3.fees,
        ]);

        // [parameters ref](contracts/oracles/ChainlinkOracle.sol)
        const chainlinkOracle = await deployContract<ChainlinkOracleAbi>(
            "ChainlinkOracle",
            [Chainlink]
        );

        // [parameters ref](contracts/oracles/UniswapV3LikeOracle.sol)
        const uniswapV3Oracle = await deployContract<UniswapV3LikeOracleAbi>(
            "UniswapV3LikeOracle",
            [UniswapV3.factory, UniswapV3.initcodeHash, UniswapV3.fees]
        );

        return {
            chainlinkOracle,
            uniswapV3Oracle,
        };
    }

    it("USDT -> DAI", async function () {
        const { chainlinkOracle, uniswapV3Oracle } = await loadFixture(
            initContracts
        );

        await testRate(
            tokens.USDT,
            tokens.DAI,
            tokens.NONE,
            chainlinkOracle,
            uniswapV3Oracle
        );
    });

    it("DAI -> USDT", async function () {
        const { chainlinkOracle, uniswapV3Oracle } = await loadFixture(
            initContracts
        );
        await testRate(
            tokens.DAI,
            tokens.USDT,
            tokens.NONE,
            chainlinkOracle,
            uniswapV3Oracle
        );
    });

    it("ETH -> DAI", async function () {
        const { chainlinkOracle, uniswapV3Oracle } = await loadFixture(
            initContracts
        );
        await testRate(
            [tokens.ETH, tokens.WETH],
            tokens.DAI,
            tokens.NONE,
            chainlinkOracle,
            uniswapV3Oracle
        );
    });

    it("DAI -> ETH", async function () {
        const { chainlinkOracle, uniswapV3Oracle } = await loadFixture(
            initContracts
        );
        await testRate(
            tokens.DAI,
            [tokens.ETH, tokens.WETH],
            tokens.NONE,
            chainlinkOracle,
            uniswapV3Oracle
        );
    });

    it("Supports tokens with custom decimals", async function () {
        const { chainlinkOracle, uniswapV3Oracle } = await loadFixture(
            initContracts
        );
        await testRate(
            tokens.USDT,
            [tokens.ETH, tokens.WETH],
            tokens.NONE,
            chainlinkOracle,
            uniswapV3Oracle
        );
    });

    it("Throws if connector is specified", async function () {
        const { chainlinkOracle, uniswapV3Oracle } = await loadFixture(
            initContracts
        );
        await expect(
            testRate(
                tokens.DAI,
                tokens.DAI,
                tokens.USDT,
                chainlinkOracle,
                uniswapV3Oracle
            )
        ).to.be.revertedWithCustomError(
            chainlinkOracle,
            "ConnectorShouldBeNone"
        );
    });
});
