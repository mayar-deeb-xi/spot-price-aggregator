import { deployContract, ether, expect } from "@1inch/solidity-utils";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { YVaultWrapperAbi } from "~/artifacts/contracts/wrappers/YVaultWrapper.sol/YVaultWrapper.js";
import { tokens } from "../helpers.js";

describe("YVaultWrapper", function () {
    async function initContracts() {
        const yvaultWrapper = await deployContract<YVaultWrapperAbi>(
            "YVaultWrapper",
            []
        );
        return { yvaultWrapper };
    }

    it("yLINK -> aLINK", async function () {
        const { yvaultWrapper } = await loadFixture(initContracts);
        const response = await yvaultWrapper.wrap(tokens.yaLINK);
        expect(response.rate).to.gt(ether("1"));
        expect(response.wrappedToken).to.equal(tokens.aLINK);
    });

    it("yWETH -> WETH", async function () {
        const { yvaultWrapper } = await loadFixture(initContracts);
        const response = await yvaultWrapper.wrap(tokens.yvWETH);
        expect(response.rate).to.gt(ether("1"));
        expect(response.wrappedToken).to.equal(tokens.WETH);
    });

    it("yWBTC -> WBTC", async function () {
        const { yvaultWrapper } = await loadFixture(initContracts);
        const response = await yvaultWrapper.wrap(tokens.yvWBTC);
        expect(response.rate).to.gt(ether("1"));
        expect(response.wrappedToken).to.equal(tokens.WBTC);
    });
});
