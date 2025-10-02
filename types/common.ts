import type { Abi, AbiStateMutability, Address } from "abitype";
import { BaseContract } from "ethers";
import {
    ContractFunctionArgs,
    ContractFunctionName,
    ContractFunctionReturnType,
} from "./utils";

export type Hash = `0x${string}`;
export { Address };

export type StrictBaseContract<
    abi extends Abi | readonly unknown[] = Abi,
    mutability extends AbiStateMutability = AbiStateMutability
> = BaseContract & {
    [k in ContractFunctionName<abi>]: (
        ...[]: ContractFunctionArgs<abi, mutability, k>
    ) => ContractFunctionReturnType<abi, mutability, k>;
};

export type Token = Address;

// type DeployReturn = (...args: ContractMethodArgs<A>)=> Promise<BaseContract & { deploymentTransaction(): ContractTransactionResponse } & Omit<I, keyof BaseContract>>
