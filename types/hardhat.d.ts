// hardhat.d.ts

import "hardhat/types/runtime";

declare module "hardhat/types/runtime" {
    interface HardhatEthersHelpers {
        getContractAt(name: "IERC20", address: string): Promise<number>;
        // Add other overrides if needed
    }
}
