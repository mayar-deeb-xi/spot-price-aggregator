import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { ethers, getChainId } from "hardhat";

import { deployAndGetContractWithCreate3 } from "@1inch/solidity-utils";
import { contracts } from "../../../test/helpers.js";

const SALT_INDEX = "";

const func: DeployFunction = async function ({
    deployments,
}: HardhatRuntimeEnvironment) {
    const PARAMS = {
        contractName: "YOUR_CONTRACT_NAME",
        constructorArgs: [],
        deploymentName: "YOUR_DEPLOYMENT_NAME",
    };
    const SALT_PROD = ethers.keccak256(
        ethers.toUtf8Bytes(PARAMS.contractName + SALT_INDEX)
    );

    console.log("running deploy script: use-create3/simple-deploy");
    console.log("network id ", await getChainId());

    await deployAndGetContractWithCreate3({
        ...PARAMS,
        create3Deployer: contracts.create3Deployer,
        salt: SALT_PROD,
        deployments,
    });
};

func.skip = async () => true;

export default func;
