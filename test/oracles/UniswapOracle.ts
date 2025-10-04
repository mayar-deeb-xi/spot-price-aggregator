import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect, ether } from "@1inch/solidity-utils";
import {
    tokens,
    deployParams,
    defaultValues,
    deployContract,
} from "../helpers.js";
import { UniswapOracleAbi } from "~/artifacts/contracts/oracles/UniswapOracle.sol/UniswapOracle.js";

const { Uniswap } = deployParams;

const { thresholdFilter } = defaultValues;

describe("UniswapOracle", function () {
    async function initContracts() {
        const uniswapOracle = await deployContract<UniswapOracleAbi>(
            "UniswapOracle",
            [Uniswap.factory]
        );
        return { uniswapOracle };
    }

    it("WETH -> ETH -> DAI", async function () {
        const { uniswapOracle } = await loadFixture(initContracts);
        const rate = await uniswapOracle.getRate(
            tokens.WETH,
            tokens.DAI,
            tokens.ETH,
            thresholdFilter
        );
        expect(rate.rate).to.gt(ether("1000"));
    });

    it("ETH -> DAI", async function () {
        const { uniswapOracle } = await loadFixture(initContracts);
        const rate = await uniswapOracle.getRate(
            tokens.ETH,
            tokens.DAI,
            tokens.NONE,
            thresholdFilter
        );
        expect(rate.rate).to.gt(ether("1000"));
    });

    it("DAI -> ETH", async function () {
        const { uniswapOracle } = await loadFixture(initContracts);
        const rate = await uniswapOracle.getRate(
            tokens.DAI,
            tokens.ETH,
            tokens.NONE,
            thresholdFilter
        );
        expect(rate.rate).to.lt(ether("0.001"));
    });
});
