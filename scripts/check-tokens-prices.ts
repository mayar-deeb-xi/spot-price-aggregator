import { ethers } from "hardhat";
import { validationSchema } from "../env/validation-schema.js";

const env = validationSchema.parse(process.env);

const usdPrice = (ethPrice: string, srcTokenDecimals: number) => {
    const _ethPrice = parseFloat(ethPrice);
    const _scriptEthPrice = parseFloat(env.SCRIPT_ETH_PRICE);
    const res =
        ((_ethPrice * 10 ** srcTokenDecimals) / 1e18 / 1e18) * _scriptEthPrice;
    return res.toFixed(2);
};

async function main() {
    let tokenList: any = env.SCRIPT_TOKENLIST;

    const networkName = env.SCRIPT_NETWORK_NAME || "mainnet";
    const skipOracles = (env.SCRIPT_SKIP_ORACLES || "").split(",");
    const addOracles = (env.SCRIPT_ADD_ORACLES || "").split("|");
    const thresholdFilter = 10;

    try {
        tokenList = JSON.parse(tokenList);
    } catch {
        tokenList = require(tokenList);
    }
    if (!Array.isArray(tokenList)) {
        tokenList = Object.keys(tokenList);
    }

    const [deployer] = await ethers.getSigners();
    const OffchainOracle = await ethers.getContractFactory("OffchainOracle");
    const offchainOracleInDeployments = require(`../deployments/${networkName}/OffchainOracle.json`);
    const deployedOffchainOracle = OffchainOracle.attach(
        offchainOracleInDeployments.address
    );

    const weth = offchainOracleInDeployments.args[4];
    const connectors = await deployedOffchainOracle.connectors();

    const offchainOracle = await OffchainOracle.deploy(
        await deployedOffchainOracle.multiWrapper(),
        [],
        [],
        [...connectors],
        weth,
        deployer.address
    );
    await offchainOracle.waitForDeployment();

    console.log("======================");

    const oracles = await deployedOffchainOracle.oracles();
    for (let i = 0; i < oracles.allOracles.length; i++) {
        if (skipOracles.indexOf(oracles.allOracles[i]) !== -1) {
            continue;
        }
        await offchainOracle.addOracle(
            oracles.allOracles[i],
            oracles.oracleTypes[i]
        );
    }

    for (let i = 0; i < addOracles.length; i++) {
        if (addOracles[i] === "") continue;

        const config = addOracles[i].split(":");
        const Oracle = await ethers.getContractFactory(config[0]);
        const oracleConstructorParams = config[2] ? JSON.parse(config[2]) : [];
        const oracle = await Oracle.deploy(...oracleConstructorParams);
        await oracle.waitForDeployment();

        await offchainOracle.addOracle(oracle, config[1]);
    }

    const tokenPrices = [];
    for (let i = 0; i < tokenList.length; i++) {
        const token = await ethers.getContractAt(
            "IERC20Metadata",
            tokenList[i]
        );

        let tokenDecimals = 18;
        try {
            tokenDecimals = parseFloat(await token.decimals());
        } catch {}

        clearAndPrint(`Progress: ${i} / ${tokenList.length}`);

        const deployedOraclePrice =
            await deployedOffchainOracle.getRateToEthWithThreshold(
                token,
                true,
                thresholdFilter
            );

        const currentImplPrice = await offchainOracle.getRateToEthWithThreshold(
            token,
            true,
            thresholdFilter
        );

        const currentImplPriceUsd = usdPrice(currentImplPrice, tokenDecimals);
        const deployedOraclePriceUsd = usdPrice(
            deployedOraclePrice,
            tokenDecimals
        );
        const diff = (
            parseFloat(currentImplPriceUsd) - parseFloat(deployedOraclePriceUsd)
        ).toFixed(2);

        tokenPrices.push([
            await token.getAddress(),
            deployedOraclePriceUsd, // price in deployed oracle
            currentImplPriceUsd, // price in oracle with current implementation
            diff, // diff
        ]);
    }
    clearAndPrint("");
    console.table(tokenPrices);
    console.log("Finished");
}

function clearAndPrint(message: string) {
    if (typeof process.stdout.clearLine !== "function") {
        console.log(message);
    } else {
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        process.stdout.write(message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
