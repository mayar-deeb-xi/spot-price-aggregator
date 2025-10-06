import { deployAndGetContractWithCreate3 } from "@1inch/solidity-utils";
import { ethers, getChainId } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types.js";
import { HardhatRuntimeEnvironment } from "hardhat/types/runtime";
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

    console.log("running deploy script: use-create3/redeploy-oracle");
    console.log("network id ", await getChainId());

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

    const customOracle = await deployAndGetContractWithCreate3({
        ...PARAMS,
        create3Deployer: contracts.create3Deployer,
        salt: SALT_PROD,
        deployments,
    });

    await offchainOracle.removeOracle(oldCustomOracle, customOracleType);
    await offchainOracle.addOracle(customOracle, customOracleType);
};

func.skip = async () => true;

export default func;
