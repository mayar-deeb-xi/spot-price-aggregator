import { deployContract, ether, expect } from "@1inch/solidity-utils";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { CompoundLikeWrapperAbi } from "~/artifacts/contracts/wrappers/CompoundLikeWrapper.sol/CompoundLikeWrapper.js";
import { deployParams, tokens } from "../helpers.js";
const { CompoundWrapper } = deployParams;

describe("CompoundWrapper", function () {
    async function initContracts() {
        const compoundWrapper = await deployContract<CompoundLikeWrapperAbi>(
            "CompoundLikeWrapper",
            [CompoundWrapper.comptroller, tokens.cETH]
        );
        await compoundWrapper.addMarkets([tokens.cDAI]);
        return { compoundWrapper };
    }

    it("DAI -> cDAI", async function () {
        const { compoundWrapper } = await loadFixture(initContracts);
        const response = await compoundWrapper.wrap(tokens.DAI);
        expect(response.rate).to.lt("5000000000");
        expect(response.wrappedToken).to.equal(tokens.cDAI);
    });

    it("cDAI -> DAI", async function () {
        const { compoundWrapper } = await loadFixture(initContracts);
        const response = await compoundWrapper.wrap(tokens.cDAI);
        expect(response.rate).to.gt(ether("200000000"));
        expect(response.wrappedToken).to.equal(tokens.DAI);
    });

    it("ETH -> cETH", async function () {
        const { compoundWrapper } = await loadFixture(initContracts);
        const response = await compoundWrapper.wrap(tokens.ETH);
        expect(response.rate).to.lt("5000000000");
        expect(response.wrappedToken).to.equal(tokens.cETH);
    });

    it("cETH -> ETH", async function () {
        const { compoundWrapper } = await loadFixture(initContracts);
        const response = await compoundWrapper.wrap(tokens.cETH);
        expect(response.rate).to.gt(ether("200000000"));
        expect(response.wrappedToken).to.equal(tokens.ETH);
    });
});
