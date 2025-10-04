import type { Abi, AbiStateMutability, Address } from "abitype";
import { BaseContract } from "ethers";
import {
    ContractFunctionArgs,
    ContractFunctionName,
    ContractFunctionReturnType,
} from "./utils";
import { AbiParametersToPrimitiveTypes } from "abitype";
import { ContractTransactionResponse } from "ethers";
import { ethers } from "hardhat";

export type Hash = `0x${string}`;
export { Address };

type BaseContract2 = Omit<BaseContract, "getAddress"> & {
    getAddress: () => Promise<Hash>;
};

export type StrictBaseContract<
    abi extends Abi | readonly unknown[] = Abi,
    mutability extends AbiStateMutability = AbiStateMutability
> = Omit<BaseContract2, "getAddress"> & { getAddress: () => Promise<Hash> } & {
    [k in ContractFunctionName<abi>]: (
        ...[]: ContractFunctionArgs<abi, mutability, k>
    ) => Promise<ContractFunctionReturnType<abi, mutability, k>>;
};

export type Token = Address;

type FallbackToUndefined<T> = [T] extends [never] ? [] : T;

export type DeployContractParameters<abi extends Abi = Abi> =
    AbiParametersToPrimitiveTypes<
        FallbackToUndefined<
            Extract<abi[number], { type: "constructor" }>["inputs"]
        >
    >;

export type DeployContractReturn<abi extends Abi = Abi> = Promise<
    BaseContract2 & {
        deploymentTransaction(): ContractTransactionResponse;
    } & Omit<StrictBaseContract<abi>, keyof BaseContract2>
>;
