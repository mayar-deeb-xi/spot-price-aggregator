import { deployContract, expect } from "@1inch/solidity-utils";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";
import { WstETHWrapperAbi } from "~/artifacts/contracts/wrappers/WstETHWrapper.sol/WstETHWrapper.js";
import { tokens } from "../helpers.js";

describe("WstETHWrapper", function () {
    async function initContracts() {
        const wstETHWrapper = await deployContract<WstETHWrapperAbi>(
            "WstETHWrapper",
            [tokens.stETH, tokens.wstETH]
        );
        const wstETH = await ethers.getContractAt("IWstETH", tokens.wstETH);
        return { wstETHWrapper, wstETH };
    }

    it("stETH -> wstETH", async function () {
        const { wstETHWrapper, wstETH } = await loadFixture(initContracts);
        const response = await wstETHWrapper.wrap(tokens.stETH);
        expect(response.rate).to.equal(await wstETH.tokensPerStEth());
        expect(response.wrappedToken).to.equal(tokens.wstETH);
    });

    it("wstETH -> stETH", async function () {
        const { wstETHWrapper, wstETH } = await loadFixture(initContracts);
        const response = await wstETHWrapper.wrap(tokens.wstETH);
        expect(response.rate).to.equal(await wstETH.stEthPerToken());
        expect(response.wrappedToken).to.equal(tokens.stETH);
    });
});
