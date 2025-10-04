import { ether, expect } from "@1inch/solidity-utils";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { DodoV2OracleAbi } from "~/artifacts/contracts/oracles/DodoV2Oracle.sol/DodoV2Oracle.js";
import { UniswapV3LikeOracleAbi } from "~/artifacts/contracts/oracles/UniswapV3LikeOracle.sol/UniswapV3LikeOracle.js";
import { Address, StrictBaseContract } from "../../types/common.js";
import {
    defaultValues,
    deployContract,
    deployParams,
    tokens,
} from "../helpers.js";

const { DodoV2, UniswapV3 } = deployParams;

const { thresholdFilter } = defaultValues;

describe("DodoV2Oracle", function () {
    async function initContracts() {
        const dodoV2Oracle = await deployContract<DodoV2OracleAbi>(
            "DodoV2Oracle",
            [DodoV2.factory]
        );

        const uniswapV3Oracle = await deployContract<UniswapV3LikeOracleAbi>(
            "UniswapV3LikeOracle",
            [UniswapV3.factory, UniswapV3.initcodeHash, UniswapV3.fees]
        );
        return {
            dodoV2Oracle,
            uniswapV3Oracle,
        };
    }

    it("should revert with amount of pools error", async function () {
        const { dodoV2Oracle } = await loadFixture(initContracts);
        await expect(
            testRate(tokens.USDT, tokens["1INCH"], tokens.NONE, dodoV2Oracle)
        ).to.be.revertedWithCustomError(dodoV2Oracle, "PoolNotFound");
    });

    it("WETH -> USDC", async function () {
        const { dodoV2Oracle } = await loadFixture(initContracts);
        await testRate(tokens.WETH, tokens.USDC, tokens.NONE, dodoV2Oracle);
    });

    it("USDC -> WETH", async function () {
        const { dodoV2Oracle } = await loadFixture(initContracts);
        await testRate(tokens.USDC, tokens.WETH, tokens.NONE, dodoV2Oracle);
    });

    it("XRA -> WETH -> USDC", async function () {
        const { dodoV2Oracle } = await loadFixture(initContracts);
        await testRate(tokens.XRA, tokens.USDC, tokens.WETH, dodoV2Oracle);
    });

    it("USDC -> WETH -> XRA", async function () {
        const { dodoV2Oracle } = await loadFixture(initContracts);
        await testRate(tokens.USDC, tokens.XRA, tokens.WETH, dodoV2Oracle);
    });

    const testRate = async (
        srcToken: Address,
        dstToken: Address,
        connector: Address,
        dodoV2Oracle: StrictBaseContract<DodoV2OracleAbi>
    ) => {
        const dodoResult = await dodoV2Oracle.getRate(
            srcToken,
            dstToken,
            connector,
            thresholdFilter
        );
        expect(dodoResult.rate).to.gt(ether("0"));
        expect(dodoResult.weight).to.gt(ether("0"));
    };
});
