import * as fs from "fs";
import * as path from "path";

/**
 * Recursively read all files in a directory
 */
function readFilesRecursively(dir: string): string[] {
    let results: string[] = [];
    const list = fs.readdirSync(dir);

    list.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat && stat.isDirectory()) {
            results = results.concat(readFilesRecursively(filePath));
        } else {
            results.push(filePath);
        }
    });

    return results;
}

/**
 * Process JSON files and extract ABI
 */
function processJsonFiles(baseDir: string) {
    const files = readFilesRecursively(baseDir);

    files.forEach((filePath) => {
        if (filePath.endsWith(".json")) {
            try {
                const raw = fs.readFileSync(filePath, "utf-8");
                const json = JSON.parse(raw);

                const varName = filePath
                    .split("/")
                    .slice(-1)
                    .join("")
                    .replace(/\.json$/, "");

                if (json.abi) {
                    const tsContent = `// Auto-generated from ${path.basename(
                        filePath
                    )}
export const abi = ${JSON.stringify(json.abi, null, 2)} as const;
export type ${varName}Abi = typeof abi;


`;

                    const tsFilePath = filePath.replace(/\.json$/, ".ts");
                    fs.writeFileSync(tsFilePath, tsContent, "utf-8");
                    console.log(`✅ ABI extracted to: ${tsFilePath}`);
                }
            } catch (err) {
                console.error(`❌ Failed to process ${filePath}:`, err);
            }
        }
    });
}

// Run the script with a directory argument
const targetDir = process.argv[2] || ".";
processJsonFiles(path.resolve(targetDir));
