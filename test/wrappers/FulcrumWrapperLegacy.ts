import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect, ether } from "@1inch/solidity-utils";
import { deployContract, tokens } from "../helpers.js";
import { ethers } from "hardhat";
import { FulcrumWrapperLegacyAbi } from "~/artifacts/contracts/wrappers/FulcrumWrapperLegacy.sol/FulcrumWrapperLegacy.js";
import { Address } from "abitype";

const tests = [
    {
        token: tokens.USDC,
        itoken: tokens.iUSDC,
    },
];

describe("FulcrumWrapperLegacy", function () {
    async function initContracts() {
        const [owner] = await ethers.getSigners();
        const fulcrumWrapperLegacy =
            await deployContract<FulcrumWrapperLegacyAbi>(
                "FulcrumWrapperLegacy",
                [owner.address as Address]
            );
        await fulcrumWrapperLegacy.addMarkets([tokens.iUSDC]);
        return { fulcrumWrapperLegacy };
    }

    it("wrap", async function () {
        const { fulcrumWrapperLegacy } = await loadFixture(initContracts);
        for (const test of tests) {
            const response = await fulcrumWrapperLegacy.wrap(test.token);
            expect(response.rate).to.gt(ether("1"));
            expect(response.wrappedToken).to.equal(test.itoken);
        }
    });

    it("unwrap", async function () {
        const { fulcrumWrapperLegacy } = await loadFixture(initContracts);
        for (const test of tests) {
            const response = await fulcrumWrapperLegacy.wrap(test.itoken);
            expect(response.rate).to.lt(ether("1"));
            expect(response.wrappedToken).to.equal(test.token);
        }
    });
});
