import { oneInchTemplates } from "@1inch/solidity-utils/docgen";
import { Networks, getNetwork } from "@1inch/solidity-utils/hardhat-setup";
import "@matterlabs/hardhat-zksync-deploy";
import "@matterlabs/hardhat-zksync-solc";
import "@nomicfoundation/hardhat-chai-matchers";
import "@nomicfoundation/hardhat-ethers";
import "hardhat-dependency-compiler";
import "hardhat-deploy";
import "hardhat-gas-reporter";
import "hardhat-tracer";
import "solidity-coverage";
import "solidity-docgen";

import { HardhatUserConfig } from "hardhat/types/config";

if (getNetwork().indexOf("zksync") !== -1) {
    require("@matterlabs/hardhat-zksync-verify");
} else {
    require("@nomicfoundation/hardhat-verify");
}

const { networks, etherscan } = new Networks(
    true,
    "mainnet",
    true
).registerAll();

type Network = "hardhat";

const config: HardhatUserConfig = {
    solidity: {
        version: "0.8.23",
        settings: {
            optimizer: {
                enabled: true,
                runs: 1000000,
            },
            evmVersion:
                networks[getNetwork() as Network]?.hardfork || "shanghai",
            viaIR: true,
        },
    },
    verify: {
        etherscan,
    },
    networks,
    namedAccounts: {
        deployer: {
            default: 0,
        },
    },
    paths: {
        deploy: "deploy/commands",
    },
    mocha: {
        timeout: 300000,
    },
    tracer: {
        enableAllOpcodes: true,
    },
    dependencyCompiler: {
        paths: [
            "@1inch/solidity-utils/contracts/interfaces/ICreate3Deployer.sol",
            "@1inch/solidity-utils/contracts/interfaces/IWETH.sol",
            "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol",
        ],
    },
    zksolc: {
        version: "1.5.1",
        compilerSource: "binary",
        settings: {},
    },
    docgen: {
        outputDir: "docs",
        templates: oneInchTemplates(),
        pages: "files",
        exclude: ["mocks"],
    },
};

export default config;
