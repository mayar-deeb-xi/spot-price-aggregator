import type {
    Abi,
    AbiParameter,
    AbiParameterKind,
    AbiParameterToPrimitiveType,
    AbiStateMutability,
    Address,
} from "abitype";
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
    Pretty,
} from "./utils";

export { Address };
export type Hash = `0x${string}`;
export type Token = Address;

export type StrictBaseContract<
    abi extends Abi | readonly unknown[] = Abi,
    mutability extends AbiStateMutability = AbiStateMutability
> = BaseContract & {
    [k in ContractFunctionName<abi, mutability>]: (
        ...[]: ContractFunctionArgs<abi, mutability, k>
    ) => Promise<
        ContractFunctionReturnType<abi, mutability, k> &
            ContractTransactionResponse &
            Record<string, any>
    >;
};

export type AbiParametersToPrimitiveTypes<
    abiParameters extends readonly AbiParameter[],
    abiParameterKind extends AbiParameterKind = AbiParameterKind
> = Pretty<{
    [key in keyof abiParameters]: AbiParameterToPrimitiveType<
        abiParameters[key],
        abiParameterKind
    >;
}>;

export type DeployContractParameters<abi extends Abi = Abi> =
    AbiParametersToPrimitiveTypes<
        FallbackToUndefined<
            Extract<abi[number], { type: "constructor" }>["inputs"]
        >
    >;

export type DeployContractReturn<abi extends Abi = Abi> = Address &
    BaseContract &
    Omit<StrictBaseContract<abi>, keyof BaseContract> & {
        deploymentTransaction(): ContractTransactionResponse;
        connect: (runner: null | ContractRunner) => DeployContractReturn<abi>;
    };
