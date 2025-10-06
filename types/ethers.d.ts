import { Address } from "abitype";
import "ethers";

import { ethers } from "ethers";
import { BaseContract as OriginalBaseContract } from "ethers/contract";
import { StrictBaseContract } from "./common";

declare module "ethers" {
    class BaseContract extends Omit<OriginalBaseContract, "connect"> {
        getAddress: () => Promise<Address>;
        interface: any;
    }
}

// import "hardhat/types/runtime";

declare module "hardhat/types/runtime" {
    interface HardhatEthersHelpers {
        provider: HardhatEthersProvider;
        getContractFactory: typeof getContractFactory;
        getContractFactoryFromArtifact: typeof getContractFactoryFromArtifact;
        getContractAt: <abi extends Abi = Abi>(
            nameOrAbi: string | any[],
            address: string | ethers.Addressable,
            signer?: ethers.Signer
        ) => Promise<ethers.Contract & StrictBaseContract<abi>>;
        getContractAtFromArtifact: (
            artifact: Artifact,
            address: string,
            signer?: ethers.Signer
        ) => Promise<ethers.Contract>;
        getSigner: (address: string) => Promise<HardhatEthersSigner>;
        getSigners: () => Promise<HardhatEthersSigner[]>;
        getImpersonatedSigner: (
            address: string
        ) => Promise<HardhatEthersSigner>;
        deployContract: typeof deployContract;
    }
}
