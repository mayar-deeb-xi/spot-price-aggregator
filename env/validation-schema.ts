import { ZeroAddress } from "ethers";
import { z } from "zod";

const ethAddress = z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid address")
    .refine((addr) => addr !== ZeroAddress, {
        message: "Address cannot be the zero address",
    });

const apiKey = z.string().min(9, "API key too short");

export const validationSchema = z.object({
    SCRIPT_TOKEN: ethAddress,

    SCRIPT_THRESHOLD_FILTER: z.coerce.number().int().min(0).optional(),

    SCRIPT_CONNECTORS_ZERO_PRICE: z.coerce.boolean().optional(),

    INFURA_API_KEY: apiKey,

    SCRIPT_ETH_PRICE: z.string().refine(
        (val) => {
            const parsed = parseFloat(val);
            return !isNaN(parsed);
        },
        {
            message: "must be a valid number",
        }
    ),

    SCRIPT_NETWORK_NAME: z.string().optional(),

    SCRIPT_ADD_ORACLES: z.string().optional(),
    SCRIPT_SKIP_ORACLES: z.string().optional(),

    SCRIPT_TOKENLIST: z.string().refine(
        (val) => {
            try {
                JSON.parse(val);
                return true;
            } catch {
                return false;
            }
        },
        {
            message: "must be a valid JSON string",
        }
    ),
});
