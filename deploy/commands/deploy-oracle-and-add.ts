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
        oracleType: "0",
    };

    console.log("running deploy script: deploy-oracle-and-add");
    console.log("network id ", await getChainId());

    const { deployer } = await getNamedAccounts();

    const offchainOracle = await getContract(deployments, "OffchainOracle");
    const customOracle = await deployAndGetContract({
        ...PARAMS,
        deployments,
        deployer,
    });
    await offchainOracle.addOracle(customOracle, PARAMS.oracleType);
};

func.skip = async () => true;

export default func;
