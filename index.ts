import * as web3 from "@solana/web3.js";
import { SolendProtocol } from "./solend";
import { ReserveLayout } from "./models";

const ACCOUNT_DISCRIMINATOR_SIZE = 8;
const CLUSTER_URL = web3.clusterApiUrl("mainnet-beta");

const connection = new web3.Connection(CLUSTER_URL);

const runAction = async (address: string) => {
    const pubKey = new web3.PublicKey(address);
    const value = await connection.getAccountInfo(pubKey);

    if(!value) {
        throw new Error(`account ${address} does not exist`)
    }

    // decode account
    const data = value.data.slice(ACCOUNT_DISCRIMINATOR_SIZE);
    const decodedValue = ReserveLayout.decode(data);

    // calculate utilization + apy from the account
    const utilizationRatio = SolendProtocol.calculateUtilizationRatio(decodedValue);
    const apy = SolendProtocol.calculateAPY(utilizationRatio.toNumber(), decodedValue);

    console.log("==== ACCOUNT DATA ====");

    console.log("Config: ", decodedValue.config);
    console.log("Liquidity: ", decodedValue.liquidity);
    console.log("Utilization Ratio: ", utilizationRatio.toString());
    console.log("APY: ", apy.toString());
};

runAction("BgxfHJDzm44T7XG68MYKx7YisTjZu73tVovyZSjJMpmw");