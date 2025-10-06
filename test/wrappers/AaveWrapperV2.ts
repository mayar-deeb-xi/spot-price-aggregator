import { deployContract, ether, expect } from "@1inch/solidity-utils";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { AaveWrapperV2Abi } from "~/artifacts/contracts/wrappers/AaveWrapperV2.sol/AaveWrapperV2";
import { deployParams, tokens } from "../helpers.js";

const { AaveWrapperV2 } = deployParams;

describe("AaveWrapperV2", function () {
    async function initContracts() {
        const aaveWrapper = await deployContract<AaveWrapperV2Abi>(
            "AaveWrapperV2",
            [AaveWrapperV2.lendingPool]
        );
        await aaveWrapper.addMarkets([tokens.DAI, tokens.WETH]);
        return { aaveWrapper };
    }

    it("DAI -> aDAI", async function () {
        const { aaveWrapper } = await loadFixture(initContracts);
        const response = await aaveWrapper.wrap(tokens.DAI);
        expect(response.rate).to.equal(ether("1"));
        expect(response.wrappedToken).to.equal(tokens.aDAIV2);
    });

    it("aDAI -> DAI", async function () {
        const { aaveWrapper } = await loadFixture(initContracts);
        const response = await aaveWrapper.wrap(tokens.aDAIV2);
        expect(response.rate).to.equal(ether("1"));
        expect(response.wrappedToken).to.equal(tokens.DAI);
    });

    it("WETH -> aWETH", async function () {
        const { aaveWrapper } = await loadFixture(initContracts);
        const response = await aaveWrapper.wrap(tokens.WETH);
        expect(response.rate).to.equal(ether("1"));
        expect(response.wrappedToken).to.equal(tokens.aWETHV2);
    });

    it("aWETH -> WETH", async function () {
        const { aaveWrapper } = await loadFixture(initContracts);
        const response = await aaveWrapper.wrap(tokens.aWETHV2);
        expect(response.rate).to.equal(ether("1"));
        expect(response.wrappedToken).to.equal(tokens.WETH);
    });
});
