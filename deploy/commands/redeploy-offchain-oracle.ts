import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { deployAndGetContract } from "@1inch/solidity-utils";
import { getChainId } from "hardhat";
import { getContract } from "../utils.js";

const func: DeployFunction = async function ({
    deployments,
    getNamedAccounts,
}: HardhatRuntimeEnvironment) {
    console.log("running deploy script: redeploy-offchain-oracle");
    console.log("network id ", await getChainId());

    const { deployer } = await getNamedAccounts();

    const oldOffchainOracle = await getContract(deployments, "OffchainOracle");

    const wBase = (await deployments.get("OffchainOracle")).args?.[4];
    const oracles = await oldOffchainOracle.oracles();

    await deployAndGetContract({
        contractName: "OffchainOracle",
        constructorArgs: [
            await oldOffchainOracle.multiWrapper(),
            oracles.allOracles,
            oracles.oracleTypes,
            await oldOffchainOracle.connectors(),
            wBase,
            deployer,
        ],
        deployments,
        deployer,
        skipIfAlreadyDeployed: false,
    });
};

func.skip = async () => true;

export default func;
