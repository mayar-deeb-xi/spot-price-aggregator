import { expect } from "@1inch/solidity-utils";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { BaseContract } from "ethers";
import { ethers } from "hardhat";
import {
    defaultValues,
    deployContract,
    deployParams,
    measureGas,
    testRate,
    testRateOffchainOracle,
    tokens,
} from "../helpers.js";

import { MultiWrapperAbi } from "../../artifacts/contracts/MultiWrapper.sol/MultiWrapper.js";
import { OffchainOracleAbi } from "../../artifacts/contracts/OffchainOracle.sol/OffchainOracle.js";
import { CurveOracleAbi } from "../../artifacts/contracts/oracles/CurveOracle.sol/CurveOracle.js";
import { CurveOracleCRPAbi } from "../../artifacts/contracts/oracles/CurveOracleCRP.sol/CurveOracleCRP.js";
import { MooniswapOracleAbi } from "../../artifacts/contracts/oracles/MooniswapOracle.sol/MooniswapOracle.js";
import { UniswapOracleAbi } from "../../artifacts/contracts/oracles/UniswapOracle.sol/UniswapOracle.js";
import { UniswapV3LikeOracleAbi } from "../../artifacts/contracts/oracles/UniswapV3LikeOracle.sol/UniswapV3LikeOracle.js";
import { AaveWrapperV1Abi } from "../../artifacts/contracts/wrappers/AaveWrapperV1.sol/AaveWrapperV1.js";
import { AaveWrapperV2Abi } from "../../artifacts/contracts/wrappers/AaveWrapperV2.sol/AaveWrapperV2.js";
import { BaseCoinWrapperAbi } from "../../artifacts/contracts/wrappers/BaseCoinWrapper.sol/BaseCoinWrapper.js";
import { Address, StrictBaseContract } from "../../types/common.js";

const { AaveWrapperV2, Curve, Uniswap, UniswapV2, UniswapV3 } = deployParams;
const { thresholdFilter } = defaultValues;

describe("CurveOracle", function () {
    async function deployUniswapV3() {
        const uniswapV3Oracle = await deployContract<UniswapV3LikeOracleAbi>(
            "UniswapV3LikeOracle",
            [UniswapV3.factory, UniswapV3.initcodeHash, UniswapV3.fees]
        );

        return {
            uniswapV3Oracle,
        };
    }

    async function deployCurveOracle() {
        const { uniswapV3Oracle } = await deployUniswapV3();
        const curveOracle = await deployContract<CurveOracleAbi>(
            "CurveOracle",
            [Curve.provider, BigInt(Curve.maxPools)]
        );
        return {
            curveOracle,
            uniswapV3Oracle,
        };
    }

    async function deployCurveOracleCRP() {
        const { uniswapV3Oracle } = await deployUniswapV3();
        const curveOracleCRP = await deployContract<CurveOracleCRPAbi>(
            "CurveOracleCRP",
            [Curve.provider, BigInt(Curve.maxPools)]
        );
        return {
            curveOracleCRP,
            uniswapV3Oracle,
        };
    }

    async function initContractsForCurveOracle() {
        const { uniswapV3Oracle } = await deployUniswapV3();
        const { curveOracle } = await deployCurveOracle();
        return { curveOracle, uniswapV3Oracle };
    }

    async function initContractsForCurveOracleCRP() {
        const { uniswapV3Oracle } = await deployUniswapV3();
        const { curveOracleCRP: curveOracle } = await deployCurveOracleCRP();
        return { curveOracle, uniswapV3Oracle };
    }

    async function deployOffchainOraclesToCheckRuins<
        T extends CurveOracleAbi | CurveOracleCRPAbi
    >(curveOracle: StrictBaseContract<T>) {
        const [deployer] = await ethers.getSigners();
        const deployerAddress = (await deployer.getAddress()) as Address;

        const uniswapV2LikeOracle = await deployContract(
            "UniswapV2LikeOracle",
            [UniswapV2.factory, UniswapV2.initcodeHash]
        );
        const uniswapOracle = await deployContract<UniswapOracleAbi>(
            "UniswapOracle",
            [Uniswap.factory]
        );

        const mooniswapOracle = await deployContract<MooniswapOracleAbi>(
            "MooniswapOracle",
            [tokens.oneInchLP1]
        );

        const wethWrapper = await deployContract<BaseCoinWrapperAbi>(
            "BaseCoinWrapper",
            [tokens.ETH, tokens.WETH]
        );

        const aaveWrapperV1 = await deployContract<AaveWrapperV1Abi>(
            "AaveWrapperV1",
            []
        );

        const aaveWrapperV2 = await deployContract<AaveWrapperV2Abi>(
            "AaveWrapperV2",
            [AaveWrapperV2.lendingPool]
        );

        await aaveWrapperV1.addMarkets([tokens.DAI]);
        await aaveWrapperV2.addMarkets([tokens.DAI]);

        const wethWrapperAddress = await wethWrapper.getAddress();
        const aaveWrapperV1Address = await aaveWrapperV1.getAddress();
        const aaveWrapperV2Address = await aaveWrapperV2.getAddress();

        const multiWrapper = await deployContract<MultiWrapperAbi>(
            "MultiWrapper",
            [
                [
                    wethWrapperAddress,
                    aaveWrapperV1Address,
                    aaveWrapperV2Address,
                ],
                deployerAddress,
            ]
        );

        const multiWrapperAddress = await multiWrapper.getAddress();
        const uniswapOracleAddress = await uniswapOracle.getAddress();
        const mooniswapOracleAddress = await mooniswapOracle.getAddress();
        const uniswapV2LikeOracleAddress =
            await uniswapV2LikeOracle.getAddress();

        const oldOffchainOracle = await deployContract<OffchainOracleAbi>(
            "OffchainOracle",
            [
                multiWrapperAddress as Address,
                [
                    uniswapV2LikeOracleAddress,
                    uniswapOracleAddress,
                    mooniswapOracleAddress,
                ],
                [0, 1, 2],
                [tokens.NONE, tokens.ETH, tokens.WETH, tokens.USDC, tokens.DAI],
                tokens.WETH,
                deployerAddress,
            ]
        );

        const curveOracleAddress = await curveOracle.getAddress();

        const newOffchainOracle = await deployContract<OffchainOracleAbi>(
            "OffchainOracle",
            [
                multiWrapperAddress,
                [
                    uniswapV2LikeOracleAddress,
                    uniswapOracleAddress,
                    mooniswapOracleAddress,
                    curveOracleAddress,
                ],
                [0, 1, 2, 2],
                [tokens.NONE, tokens.ETH, tokens.USDC, tokens.DAI],
                tokens.WETH,
                deployerAddress,
            ]
        );

        return { oldOffchainOracle, newOffchainOracle };
    }

    async function initContractsToCheckRuinsForCurveOracle() {
        const { curveOracle } = await deployCurveOracle();
        return await deployOffchainOraclesToCheckRuins<CurveOracleAbi>(
            curveOracle
        );
    }

    async function initContractsToCheckRuinsForCurveOracleCRP() {
        const { curveOracleCRP } = await deployCurveOracleCRP();
        return await deployOffchainOraclesToCheckRuins<CurveOracleCRPAbi>(
            curveOracleCRP
        );
    }

    type InitContractsForCurveOracleCRPFun = Awaited<
        ReturnType<typeof initContractsForCurveOracleCRP>
    >;
    type InitContractsForCurveOracleFun = Awaited<
        ReturnType<typeof initContractsForCurveOracle>
    >;

    function shouldReturnCorrectPrices<
        F extends
            | InitContractsForCurveOracleCRPFun
            | InitContractsForCurveOracleFun
    >(fixture: () => Promise<F>) {
        it("USDT -> WBTC", async function () {
            const { curveOracle, uniswapV3Oracle } = await loadFixture(fixture);
            await testRate(
                tokens.USDT,
                tokens.WBTC,
                tokens.NONE,
                curveOracle,
                uniswapV3Oracle
            );
        });

        it("WBTC -> USDT", async function () {
            const { curveOracle, uniswapV3Oracle } = await loadFixture(fixture);
            await testRate(
                tokens.WBTC,
                tokens.USDT,
                tokens.NONE,
                curveOracle,
                uniswapV3Oracle
            );
        });

        it("WBTC -> WETH", async function () {
            const { curveOracle, uniswapV3Oracle } = await loadFixture(fixture);
            await testRate(
                tokens.WBTC,
                tokens.WETH,
                tokens.NONE,
                curveOracle,
                uniswapV3Oracle
            );
        });

        it("USDT -> USDC", async function () {
            const { curveOracle, uniswapV3Oracle } = await loadFixture(fixture);
            await testRate(
                tokens.USDT,
                tokens.USDC,
                tokens.NONE,
                curveOracle,
                uniswapV3Oracle
            );
        });

        it("should use correct `get_dy` selector when vyper return redundant bytes", async function () {
            const { curveOracle } = await loadFixture(fixture);
            const rate = await curveOracle.getRate(
                tokens.BEAN,
                tokens["3CRV"],
                tokens.NONE,
                thresholdFilter
            );
            expect(rate.rate).to.gt("0");
        });
    }

    function shouldShowMeasureGas<
        F extends
            | InitContractsForCurveOracleCRPFun
            | InitContractsForCurveOracleFun
    >(fixture: () => Promise<F>) {
        it("USDT -> WBTC", async function () {
            const { curveOracle, uniswapV3Oracle } = await loadFixture(fixture);
            await measureGas(
                await curveOracle
                    .getFunction("getRate")
                    .send(
                        tokens.USDT,
                        tokens.WBTC,
                        tokens.NONE,
                        thresholdFilter
                    ),
                "CurveOracle usdt -> wbtc"
            );
            await measureGas(
                await uniswapV3Oracle
                    .getFunction("getRate")
                    .send(
                        tokens.USDT,
                        tokens.WBTC,
                        tokens.NONE,
                        thresholdFilter
                    ),
                "UniswapV3Oracle usdt -> wbtc"
            );
        });

        it("WBTC -> USDT", async function () {
            const { curveOracle, uniswapV3Oracle } = await loadFixture(fixture);
            await measureGas(
                await curveOracle
                    .getFunction("getRate")
                    .send(
                        tokens.WBTC,
                        tokens.USDT,
                        tokens.NONE,
                        thresholdFilter
                    ),
                "CurveOracle wbtc -> usdt"
            );
            await measureGas(
                await uniswapV3Oracle
                    .getFunction("getRate")
                    .send(
                        tokens.WBTC,
                        tokens.USDT,
                        tokens.NONE,
                        thresholdFilter
                    ),
                "UniswapV3Oracle wbtc -> usdt"
            );
        });

        it("WBTC -> WETH", async function () {
            const { curveOracle, uniswapV3Oracle } = await loadFixture(fixture);
            await measureGas(
                await curveOracle
                    .getFunction("getRate")
                    .send(
                        tokens.WBTC,
                        tokens.WETH,
                        tokens.NONE,
                        thresholdFilter
                    ),
                "CurveOracle wbtc -> weth"
            );
            await measureGas(
                await uniswapV3Oracle
                    .getFunction("getRate")
                    .send(
                        tokens.WBTC,
                        tokens.WETH,
                        tokens.NONE,
                        thresholdFilter
                    ),
                "UniswapV3Oracle wbtc -> weth"
            );
        });
    }

    type InitContractsToCheckRuinsForCurveOracleFun = Awaited<
        ReturnType<typeof initContractsToCheckRuinsForCurveOracle>
    >;
    type InitContractsToCheckRuinsForCurveOracleCRPFun = Awaited<
        ReturnType<typeof initContractsToCheckRuinsForCurveOracleCRP>
    >;

    function shouldNotRuinRate<
        F extends
            | InitContractsToCheckRuinsForCurveOracleFun
            | InitContractsToCheckRuinsForCurveOracleCRPFun
    >(fixture: () => Promise<F>) {
        it("WBTC -> WETH", async function () {
            const { oldOffchainOracle, newOffchainOracle } = await loadFixture(
                fixture
            );
            await testRateOffchainOracle(
                tokens.WBTC,
                tokens.WETH,
                oldOffchainOracle,
                newOffchainOracle
            );
        });

        it("WETH -> WBTC", async function () {
            const { oldOffchainOracle, newOffchainOracle } = await loadFixture(
                fixture
            );
            await testRateOffchainOracle(
                tokens.WETH,
                tokens.WBTC,
                oldOffchainOracle,
                newOffchainOracle
            );
        });

        it("WBTC -> USDT", async function () {
            const { oldOffchainOracle, newOffchainOracle } = await loadFixture(
                fixture
            );
            await testRateOffchainOracle(
                tokens.WBTC,
                tokens.USDT,
                oldOffchainOracle,
                newOffchainOracle
            );
        });

        it("USDT -> WBTC", async function () {
            const { oldOffchainOracle, newOffchainOracle } = await loadFixture(
                fixture
            );
            await testRateOffchainOracle(
                tokens.USDT,
                tokens.WBTC,
                oldOffchainOracle,
                newOffchainOracle
            );
        });
    }

    describe("CurveRateProvider logic implementation", function () {
        shouldReturnCorrectPrices(initContractsForCurveOracle);

        describe("Measure gas", function () {
            shouldShowMeasureGas(initContractsForCurveOracle);
        });

        describe("CurveOracle doesn't ruin rates", function () {
            shouldNotRuinRate(initContractsToCheckRuinsForCurveOracle);
        });
    });

    describe("CurveRateProvider", function () {
        shouldReturnCorrectPrices(initContractsForCurveOracleCRP);

        describe("Measure gas", function () {
            shouldShowMeasureGas(initContractsForCurveOracleCRP);
        });

        describe("CurveOracle doesn't ruin rates", function () {
            shouldNotRuinRate(initContractsToCheckRuinsForCurveOracleCRP);
        });
    });
});
