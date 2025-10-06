import { deployContract } from "@1inch/solidity-utils";
import { resetHardhatNetworkFork } from "@1inch/solidity-utils/hardhat-setup";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { network } from "hardhat";
import { SolidlyOracleAbi } from "~/artifacts/contracts/oracles/SolidlyOracle.sol/SolidlyOracle.js";
import { UniswapV3LikeOracleAbi } from "~/artifacts/contracts/oracles/UniswapV3LikeOracle.sol/UniswapV3LikeOracle.js";
import { deployParams, testRate, tokens } from "../helpers.js";

const { Aerodrome, VelocimeterV2, UniswapV3Base } = deployParams;

describe("SolidlyOracle", function () {
    describe("BASE network", function () {
        before(async function () {
            await resetHardhatNetworkFork(network, "base");
        });

        after(async function () {
            await resetHardhatNetworkFork(network, "mainnet");
        });

        async function initContracts() {
            const uniswapV3Oracle =
                await deployContract<UniswapV3LikeOracleAbi>(
                    "UniswapV3LikeOracle",
                    [
                        UniswapV3Base.factory,
                        UniswapV3Base.initcodeHash,
                        UniswapV3Base.fees,
                    ]
                );
            return { uniswapV3Oracle };
        }

        async function deployVelocimeterV2() {
            const { uniswapV3Oracle } = await initContracts();
            const oracle = await deployContract<SolidlyOracleAbi>(
                "SolidlyOracle",
                [VelocimeterV2.factory, VelocimeterV2.initcodeHash]
            );
            return { oracle, uniswapV3Oracle };
        }

        async function deployAerodrome() {
            const { uniswapV3Oracle } = await initContracts();
            const oracle = await deployContract<SolidlyOracleAbi>(
                "SolidlyOracle",
                [Aerodrome.factory, Aerodrome.initcodeHash]
            );
            return { oracle, uniswapV3Oracle };
        }

        type DeployVelocimeterV2Fun = Awaited<
            ReturnType<typeof deployVelocimeterV2>
        >;
        type DeployAerodromeFun = Awaited<ReturnType<typeof deployAerodrome>>;

        function shouldWorkForOracle<
            F extends DeployVelocimeterV2Fun | DeployAerodromeFun
        >(fixture: () => Promise<F>, relativeDiff = 0.05) {
            it("WETH -> axlUSDC", async function () {
                const { oracle, uniswapV3Oracle } = await loadFixture(fixture);
                await testRate(
                    tokens.base.WETH,
                    tokens.base.axlUSDC,
                    tokens.NONE,
                    oracle,
                    uniswapV3Oracle,
                    relativeDiff
                );
            });

            it("axlUSDC -> WETH", async function () {
                const { oracle, uniswapV3Oracle } = await loadFixture(fixture);
                await testRate(
                    tokens.base.axlUSDC,
                    tokens.base.WETH,
                    tokens.NONE,
                    oracle,
                    uniswapV3Oracle,
                    relativeDiff
                );
            });

            it("WETH -> DAI", async function () {
                const { oracle, uniswapV3Oracle } = await loadFixture(fixture);
                await testRate(
                    tokens.base.WETH,
                    tokens.base.DAI,
                    tokens.NONE,
                    oracle,
                    uniswapV3Oracle,
                    relativeDiff
                );
            });

            it("DAI -> WETH", async function () {
                const { oracle, uniswapV3Oracle } = await loadFixture(fixture);
                await testRate(
                    tokens.base.DAI,
                    tokens.base.WETH,
                    tokens.NONE,
                    oracle,
                    uniswapV3Oracle,
                    relativeDiff
                );
            });

            it("rETH -> WETH", async function () {
                const { oracle, uniswapV3Oracle } = await loadFixture(fixture);
                // Test only for Aerodrome

                if ((await oracle.FACTORY()) !== Aerodrome.factory) {
                    this.skip();
                }
                await testRate(
                    tokens.base.rETH,
                    tokens.base.WETH,
                    tokens.NONE,
                    oracle,
                    uniswapV3Oracle,
                    relativeDiff
                );
            });

            it("WETH -> rETH", async function () {
                const { oracle, uniswapV3Oracle } = await loadFixture(fixture);
                // Test only for Aerodrome
                if ((await oracle.FACTORY()) !== Aerodrome.factory) {
                    this.skip();
                }
                await testRate(
                    tokens.base.WETH,
                    tokens.base.rETH,
                    tokens.NONE,
                    oracle,
                    uniswapV3Oracle,
                    relativeDiff
                );
            });
        }

        describe("VelocimeterV2", function () {
            shouldWorkForOracle(deployVelocimeterV2, 0.1);
        });

        describe("Aerodrome", function () {
            shouldWorkForOracle(deployAerodrome, 0.3);
        });
    });
});
