import "@1inch/solidity-utils";
import {
    DeployContractOptions,
    DeployContractOptionsWithCreate3,
} from "@1inch/solidity-utils";
import { Contract } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
    DeployContractParameters,
    DeployContractReturn,
    StrictBaseContract,
} from "../common";

declare module "@1inch/solidity-utils" {
    function deployContract<abi extends Abi = Abi>(
        name: string,
        parameters: DeployContractParameters<abi>
    ): Promise<DeployContractReturn<abi>>;

    function deployAndGetContract<abi extends Abi = Abi>(
        options: {
            constructorArgs: DeployContractParameters<abi>;
        } & Omit<DeployContractOptions, "constructorArgs">
    ): Promise<StrictBaseContract<abi>>;

    function deployAndGetContractWithCreate3(
        options: Omit<DeployContractOptionsWithCreate3, "deployments"> & {
            deployments: HardhatRuntimeEnvironment["deployments"];
        }
    ): Promise<Contract>;
    // declare function trackReceivedTokenAndTx<T extends unknown[]>(
    //     provider:
    //         | JsonRpcProvider
    //         | {
    //               getBalance: (address: string) => Promise<bigint>;
    //           },
    //     token:
    //         | Token
    //         | {
    //               address: typeof constants.ZERO_ADDRESS;
    //           }
    //         | {
    //               address: typeof constants.EEE_ADDRESS;
    //           },
    //     wallet: string,
    //     txPromise: (
    //         ...args: T
    //     ) => Promise<
    //         ContractTransactionResponse | TrackReceivedTokenAndTxResult | any
    //     >,
    //     ...args: T
    // ): Promise<TrackReceivedTokenAndTxResult>;
}

declare module "@1inch/solidity-utils" {
    interface Token {
        balanceOf: (address: Address) => Promise<bigint>;
        getAddress: () => Promise<Address>;
    }
}
