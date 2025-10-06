import { deployContract, ether, expect } from "@1inch/solidity-utils";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";
import { MultiWrapperAbi } from "~/artifacts/contracts/MultiWrapper.sol/MultiWrapper.js";
import { AaveWrapperV1Abi } from "~/artifacts/contracts/wrappers/AaveWrapperV1.sol/AaveWrapperV1.js";
import { AaveWrapperV2Abi } from "~/artifacts/contracts/wrappers/AaveWrapperV2.sol/AaveWrapperV2.js";
import { BaseCoinWrapperAbi } from "~/artifacts/contracts/wrappers/BaseCoinWrapper.sol/BaseCoinWrapper.js";
import { CompoundLikeWrapperAbi } from "~/artifacts/contracts/wrappers/CompoundLikeWrapper.sol/CompoundLikeWrapper.js";
import { FulcrumWrapperAbi } from "~/artifacts/contracts/wrappers/FulcrumWrapper.sol/FulcrumWrapper.js";
import { deployParams, tokens } from "./helpers.js";

const { AaveWrapperV2, CompoundWrapper } = deployParams;

describe("MultiWrapper", function () {
    async function initContracts() {
        const [owner] = await ethers.getSigners();
        const wethWrapper = await deployContract<BaseCoinWrapperAbi>(
            "BaseCoinWrapper",
            [tokens.ETH, tokens.WETH]
        );
        const aaveWrapperV1 = await deployContract<AaveWrapperV1Abi>(
            "AaveWrapperV1",
            []
        );

        await aaveWrapperV1.addMarkets([tokens.DAI, tokens.EEE]);
        const aaveWrapperV2 = await deployContract<AaveWrapperV2Abi>(
            "AaveWrapperV2",
            [AaveWrapperV2.lendingPool]
        );
        await aaveWrapperV2.addMarkets([tokens.DAI, tokens.WETH]);
        const compoundWrapper = await deployContract<CompoundLikeWrapperAbi>(
            "CompoundLikeWrapper",
            [CompoundWrapper.comptroller, tokens.cETH]
        );
        await compoundWrapper.addMarkets([tokens.cDAI]);
        const fulcrumWrapper = await deployContract<FulcrumWrapperAbi>(
            "FulcrumWrapper",
            []
        );
        await fulcrumWrapper.addMarkets([tokens.DAI, tokens.WETH]);

        const multiWrapper = await deployContract<MultiWrapperAbi>(
            "MultiWrapper",
            [
                [
                    wethWrapper,
                    aaveWrapperV1,
                    aaveWrapperV2,
                    compoundWrapper,
                    fulcrumWrapper,
                ],
                owner,
            ]
        );

        return { multiWrapper };
    }

    it("ETH", async function () {
        const { multiWrapper } = await loadFixture(initContracts);
        const response = await multiWrapper.getWrappedTokens(tokens.ETH);
        expect(response.wrappedTokens).to.deep.equal([
            tokens.WETH,
            tokens.aWETHV2,
            tokens.iETH,
            tokens.aETHV1,
            tokens.cETH,
            tokens.ETH,
        ]);

        for (const i of [0, 1, 3, 5]) {
            expect(response.rates[i]).to.eq(ether("1"));
        }
        expect(response.rates[2]).to.gt(ether("1"));
        expect(response.rates[4]).to.lt("5000000000");
    });

    it("DAI", async function () {
        const { multiWrapper } = await loadFixture(initContracts);
        const response = await multiWrapper.getWrappedTokens(tokens.DAI);
        expect(response.wrappedTokens).to.deep.equal([
            tokens.aDAIV1,
            tokens.aDAIV2,
            tokens.cDAI,
            tokens.iDAI,
            tokens.DAI,
        ]);

        for (const i of [0, 1, 4]) {
            expect(response.rates[i]).to.eq(ether("1"));
        }
        expect(response.rates[2]).to.lt("5000000000");
        expect(response.rates[3]).to.gt(ether("1"));
    });

    it("aETHv1", async function () {
        const { multiWrapper } = await loadFixture(initContracts);
        const response = await multiWrapper.getWrappedTokens(tokens.aETHV1);
        expect(response.wrappedTokens).to.deep.equal([
            tokens.ETH,
            tokens.WETH,
            tokens.cETH,
            tokens.aETHV1,
        ]);

        for (const i of [0, 1, 3]) {
            expect(response.rates[i]).to.eq(ether("1"));
        }
        expect(response.rates[2]).to.lt("5000000000");
    });
});
