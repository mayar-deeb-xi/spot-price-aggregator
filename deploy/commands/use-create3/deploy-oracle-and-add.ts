import { deployAndGetContractWithCreate3 } from "@1inch/solidity-utils";
import { ethers, getChainId } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
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
        oracleType: "0",
    };
    const SALT_PROD = ethers.keccak256(
        ethers.toUtf8Bytes(PARAMS.contractName + SALT_INDEX)
    );

    console.log("running deploy script: use-create3/deploy-oracle-and-add");
    console.log("network id ", await getChainId());

    const customOracle = await deployAndGetContractWithCreate3({
        ...PARAMS,
        create3Deployer: contracts.create3Deployer,
        salt: SALT_PROD,
        deployments,
    });

    const offchainOracle = await getContract(deployments, "OffchainOracle");
    await offchainOracle.addOracle(customOracle, PARAMS.oracleType);
};

func.skip = async () => true;

export default func;
