import { deployContract, ether, expect } from "@1inch/solidity-utils";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { BaseCoinWrapperAbi } from "~/artifacts/contracts/wrappers/BaseCoinWrapper.sol/BaseCoinWrapper.js";
import { tokens } from "../helpers.js";

describe("BaseCoinWrapper", function () {
    async function initContracts() {
        const baseCoinWrapper = await deployContract<BaseCoinWrapperAbi>(
            "BaseCoinWrapper",
            [tokens.ETH, tokens.WETH]
        );
        return { baseCoinWrapper };
    }

    it("ETH -> WETH", async function () {
        const { baseCoinWrapper } = await loadFixture(initContracts);
        const response = await baseCoinWrapper.wrap(tokens.ETH);
        expect(response.rate).to.equal(ether("1"));
        expect(response.wrappedToken).to.equal(tokens.WETH);
    });

    it("WETH -> ETH", async function () {
        const { baseCoinWrapper } = await loadFixture(initContracts);
        const response = await baseCoinWrapper.wrap(tokens.WETH);
        expect(response.rate).to.equal(ether("1"));
        expect(response.wrappedToken).to.equal(tokens.ETH);
    });
});
