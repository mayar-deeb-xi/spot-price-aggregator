import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { deployAndGetContract } from "@1inch/solidity-utils";
import { getChainId } from "hardhat";

const func: DeployFunction = async function ({
    deployments,
    getNamedAccounts,
}: HardhatRuntimeEnvironment) {
    const PARAMS = {
        contractName: "YOUR_CONTRACT_NAME",
        constructorArgs: [],
        deploymentName: "YOUR_DEPLOYMENT_NAME",
    };

    console.log("running deploy script: simple-deploy");
    console.log("network id ", await getChainId());

    const { deployer } = await getNamedAccounts();

    await deployAndGetContract({
        ...PARAMS,
        deployments,
        deployer,
    });
};

func.skip = async () => true;

export default func;
