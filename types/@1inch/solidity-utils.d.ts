import "@1inch/solidity-utils";
import { DeployContractParameters, DeployContractReturn } from "../common";

declare module "@1inch/solidity-utils" {
    function deployContract<abi extends Abi = Abi>(
        name: string,
        parameters: DeployContractParameters<abi>
    ): Promise<DeployContractReturn<abi>>;

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
