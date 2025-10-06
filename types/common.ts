import type { Abi, AbiStateMutability, Address } from "abitype";
import { AbiParametersToPrimitiveTypes } from "abitype";
import {
    BaseContract,
    ContractRunner,
    ContractTransactionResponse,
} from "ethers";
import {
    ContractFunctionArgs,
    ContractFunctionName,
    ContractFunctionReturnType,
    FallbackToUndefined,
} from "./utils";

export { Address };
export type Hash = `0x${string}`;
export type Token = Address;

export type StrictBaseContract<
    abi extends Abi | readonly unknown[] = Abi,
    mutability extends AbiStateMutability = AbiStateMutability
> = BaseContract & {
    [k in ContractFunctionName<abi>]: (
        ...[]: ContractFunctionArgs<abi, mutability, k>
    ) => Promise<ContractFunctionReturnType<abi, mutability, k>>;
};

export type DeployContractParameters<abi extends Abi = Abi> =
    AbiParametersToPrimitiveTypes<
        FallbackToUndefined<
            Extract<abi[number], { type: "constructor" }>["inputs"]
        >
    >;

export type DeployContractReturn<abi extends Abi = Abi> = BaseContract &
    Omit<StrictBaseContract<abi>, keyof BaseContract> & {
        deploymentTransaction(): ContractTransactionResponse;
        connect: (runner: null | ContractRunner) => DeployContractReturn<abi>;
    };
