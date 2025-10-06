import { deployContract, expect } from "@1inch/solidity-utils";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";
import { ConnectorManagerAbi } from "~/artifacts/contracts/helpers/ConnectorManager.sol/ConnectorManager.js";
import { tokens } from "./helpers.js";

describe("ConnectorManager", function () {
    async function initContracts() {
        const [owner, alice] = await ethers.getSigners();
        const connectorManager = await deployContract<ConnectorManagerAbi>(
            "ConnectorManager",
            [[tokens.DAI], owner]
        );
        return { owner, alice, connectorManager };
    }

    it("should revert by non-owner", async function () {
        const { alice, connectorManager } = await loadFixture(initContracts);
        await expect(
            connectorManager.connect(alice).toggleConnectorSupport(tokens.ETH)
        ).to.be.revertedWithCustomError(
            connectorManager,
            "OwnableUnauthorizedAccount"
        );
    });

    it("should set supported in constructor", async function () {
        const { connectorManager } = await loadFixture(initContracts);
        expect(await connectorManager.connectorSupported(tokens.DAI)).to.be
            .true;
    });

    it("should toggle record state", async function () {
        const { owner, connectorManager } = await loadFixture(initContracts);
        await connectorManager
            .connect(owner)
            .toggleConnectorSupport(tokens.ETH);
        expect(await connectorManager.connectorSupported(tokens.ETH)).to.be
            .true;
        await connectorManager
            .connect(owner)
            .toggleConnectorSupport(tokens.ETH);
        expect(await connectorManager.connectorSupported(tokens.ETH)).to.be
            .false;
    });
});
