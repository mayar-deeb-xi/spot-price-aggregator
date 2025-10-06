import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { deployAndGetContractWithCreate3 } from "@1inch/solidity-utils";
import { ethers, getChainId } from "hardhat";
import { contracts } from "../../../test/helpers.js";
import { getContract } from "../../utils.js";

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

    console.log("running deploy script: use-create3/redeploy-wrapper");
    console.log("network id ", await getChainId());

    const offchainOracle = await getContract(deployments, "OffchainOracle");
    const multiWrapper = await getContract(deployments, "MultiWrapper");
    if (
        ethers.getAddress(await offchainOracle.multiWrapper()) !==
        ethers.getAddress(await multiWrapper.getAddress())
    ) {
        console.warn(
            "MultiWrapper address in deployments is not equal to the address in OffchainOracle"
        );
        return;
    }

    const oldCustomWrapper = await getContract(
        deployments,
        PARAMS.contractName,
        PARAMS.deploymentName
    );
    const customWrapper = await deployAndGetContractWithCreate3({
        ...PARAMS,
        create3Deployer: contracts.create3Deployer,
        salt: SALT_PROD,
        deployments,
    });

    await multiWrapper.removeWrapper(oldCustomWrapper);
    await multiWrapper.addWrapper(customWrapper);
};

func.skip = async () => true;

export default func;
