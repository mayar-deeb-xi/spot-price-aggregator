import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { deployAndGetContract } from "@1inch/solidity-utils";
import { getChainId } from "hardhat";
import { getContract } from "../utils.js";

const func: DeployFunction = async function ({
    deployments,
    getNamedAccounts,
}: HardhatRuntimeEnvironment) {
    const PARAMS = {
        contractName: "YOUR_CONTRACT_NAME",
        constructorArgs: [],
        deploymentName: "YOUR_DEPLOYMENT_NAME",
    };

    console.log("running deploy script: redeploy-oracle");
    console.log("network id ", await getChainId());

    const { deployer } = await getNamedAccounts();

    const offchainOracle = await getContract(deployments, "OffchainOracle");
    const oldCustomOracle = await getContract(
        deployments,
        PARAMS.contractName,
        PARAMS.deploymentName
    );

    const oracles = await offchainOracle.oracles();
    const customOracleType =
        oracles.oracleTypes[
            oracles.allOracles.indexOf(await oldCustomOracle.getAddress())
        ];

    const customOracle = await deployAndGetContract({
        ...PARAMS,
        deployments,
        deployer,
        skipIfAlreadyDeployed: false,
    });
    await offchainOracle.removeOracle(oldCustomOracle, customOracleType);
    await offchainOracle.addOracle(customOracle, customOracleType);
};

func.skip = async () => true;

export default func;
