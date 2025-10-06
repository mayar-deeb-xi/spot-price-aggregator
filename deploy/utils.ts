import { constants, deployAndGetContract } from "@1inch/solidity-utils";
import { Abi, Address } from "abitype";
import { Addressable } from "ethers";
import { ethers } from "hardhat";
import { IComptrollerAbi } from "~/artifacts/contracts/interfaces/IComptroller.sol/IComptroller";
import { ILendingPoolV3Abi } from "~/artifacts/contracts/interfaces/ILendingPoolV3.sol/ILendingPoolV3";
import { IStaticATokenFactoryAbi } from "~/artifacts/contracts/interfaces/IStaticATokenLM.sol/IStaticATokenFactory";
import { AaveWrapperV2Abi } from "~/artifacts/contracts/wrappers/AaveWrapperV2.sol/AaveWrapperV2";
import { CompoundLikeWrapperAbi } from "~/artifacts/contracts/wrappers/CompoundLikeWrapper.sol/CompoundLikeWrapper";
import { StrictBaseContract } from "~/types/common";

// not idemponent. Needs to be rewritten a bit if another run is required
const _addCompoundTokens = async (
    compoundLikeWrapper: StrictBaseContract,
    cTokens: Array<Address>
) => {
    const tx = await compoundLikeWrapper.addMarkets(cTokens);
    await tx.wait();
};

const _zip = (a: Array<Address>, b: Array<Address>) =>
    a.map((k, i) => [k, b[i]]);

async function addAaveTokens(
    aaveWrapperV2: StrictBaseContract<AaveWrapperV2Abi>,
    AAWE_WRAPPER_TOKENS: Array<Address>
) {
    const aTokens = await Promise.all(
        AAWE_WRAPPER_TOKENS.map((x) => aaveWrapperV2.tokenToaToken(x))
    );
    const tokensToDeploy = _zip(AAWE_WRAPPER_TOKENS, aTokens)
        .filter(([, aToken]) => aToken === constants.ZERO_ADDRESS)
        .map(([token]) => token);
    if (tokensToDeploy.length > 0) {
        console.log("AaveWrapperV2 tokens to deploy: ", tokensToDeploy);

        const tx = await aaveWrapperV2.addMarkets(tokensToDeploy);

        await tx.wait();
    } else {
        console.log("All tokens are already deployed");
    }
}

async function getAllAave3ReservesTokens(
    lendingPoolV3Address: Address
): Promise<Array<Address>> {
    const lendingPoolV3 = await ethers.getContractAt<ILendingPoolV3Abi>(
        "ILendingPoolV3",
        lendingPoolV3Address
    );
    const tokens = await lendingPoolV3.getAllReservesTokens();
    return tokens.map((token) => token.tokenAddress);
}

async function getAllAaveV3UnderlyingTokensForStataTokens(
    staticATokenFactoryAddress: string | Addressable
) {
    const aTokenABI = [
        {
            name: "UNDERLYING_ASSET_ADDRESS",
            type: "function",
            inputs: [],
            outputs: [{ type: "address", name: "value" }],
            stateMutability: "view",
        },
    ];
    const staticATokenFactory =
        await ethers.getContractAt<IStaticATokenFactoryAbi>(
            "IStaticATokenFactory",
            staticATokenFactoryAddress
        );
    const allStataTokens = await staticATokenFactory.getStaticATokens();
    const tokens = [];
    for (const token of allStataTokens) {
        const stataToken = await ethers.getContractAt("IStaticATokenLM", token);
        const aToken = await ethers.getContractAt(
            aTokenABI,
            await stataToken.aToken()
        );
        tokens.push(await aToken.UNDERLYING_ASSET_ADDRESS());
    }
    return tokens;
}

const deployCompoundTokenWrapper = async (
    contractInfo: { name: string; address: Address },
    tokenName: Address,
    deployments: any,
    deployer: Address,
    deploymentName = `CompoundLikeWrapper_${contractInfo.name}`
) => {
    const comptroller = await ethers.getContractAt<IComptrollerAbi>(
        "IComptroller",
        contractInfo.address
    );
    const cToken = (await comptroller.getAllMarkets()).filter(
        (token) => token !== tokenName
    );
    console.log(`Found ${contractInfo.name} cTokens: ${cToken}`);
    const wrapper = await deployAndGetContract<CompoundLikeWrapperAbi>({
        contractName: "CompoundLikeWrapper",
        constructorArgs: [contractInfo.address, tokenName],
        deployments,
        deployer,
        deploymentName,
    });
    await _addCompoundTokens(wrapper, cToken);
    return wrapper;
};

const _getContract = async (contractName: string, contractAddress: Address) => {
    const contractFactory = await ethers.getContractFactory(contractName);
    return contractFactory.attach(contractAddress);
};

const getContract = async <abi extends Abi | readonly unknown[] = Abi>(
    deployments: any,
    contractName: string,
    deploymentName = contractName
): Promise<StrictBaseContract<abi>> => {
    return _getContract(
        contractName,
        (await deployments.get(deploymentName)).address
    );
};

export {
    addAaveTokens,
    deployCompoundTokenWrapper,
    getAllAave3ReservesTokens,
    getAllAaveV3UnderlyingTokensForStataTokens,
    getContract,
};
