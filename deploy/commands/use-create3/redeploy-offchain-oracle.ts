import { deployAndGetContractWithCreate3 } from "@1inch/solidity-utils";
import hre from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { contracts } from "../../../test/helpers.js";
import { getContract } from "../../utils.js";

const { getChainId, ethers } = hre;
const SALT_INDEX = "";

const func: DeployFunction = async function ({
    deployments,
    getNamedAccounts,
}: HardhatRuntimeEnvironment) {
    const SALT_PROD = ethers.keccak256(
        ethers.toUtf8Bytes("OffchainOracle" + SALT_INDEX)
    );

    console.log("running deploy script: use-create3/redeploy-offchain-oracle");
    console.log("network id ", await getChainId());

    const { deployer } = await getNamedAccounts();
    const OffchainOracleDeploymentData = await deployments.get(
        "OffchainOracle"
    );
    const oldOffchainOracle = await getContract(deployments, "OffchainOracle");
    const wBase = OffchainOracleDeploymentData?.args?.[4];
    const oracles = await oldOffchainOracle.oracles();

    const PARAMS = {
        contractName: "OffchainOracle",
        constructorArgs: [
            await oldOffchainOracle.multiWrapper(),
            [...oracles.allOracles],
            [...oracles.oracleTypes],
            [...(await oldOffchainOracle.connectors())[0]],
            wBase,
            deployer,
        ],
        deploymentName: "OffchainOracle",
    };

    await deployAndGetContractWithCreate3({
        ...PARAMS,
        create3Deployer: contracts.create3Deployer,
        salt: SALT_PROD,
        deployments,
    });
};

func.skip = async () => true;

export default func;
