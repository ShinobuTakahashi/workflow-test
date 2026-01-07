import * as path from "path";
import * as child_process from "child_process";
import * as util from "util";
const execPromise = util.promisify(child_process.exec);

import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TARGET_SCRIPT_NAME = "prepublishOnly";
const PACKAGES_DIR = path.resolve(__dirname, "..", "packages");

async function runScriptInPackage(pkgPath) {
    const command = `npm run ${TARGET_SCRIPT_NAME}`;
    console.log(`[command: ${command}`);

    try {
        const { stdout, stderr } = await execPromise(command, { cwd: pkgPath });
        console.log("===== stdout", stdout);
        console.log("===== stderr", stderr);
        return { status: "SUCCESS", stdout: stdout, stderr: stderr };

    } catch (error) {
        const output = error.stdout || error.stderr || error.message;
        return { status: "FAILED", error: `${error}`, stdout: `${error.stdout}`, stderr: `${error.stderr}` };
    }
}

async function runAllScriptsInParallel() {
    console.log("======================= start =====================", new Date().toLocaleTimeString());
    const packageDirs = [
        "."
    ];

    const executionPromises = packageDirs.map(dir => {
        return runScriptInPackage(dir);
    });

    const results = await Promise.all(executionPromises);

    console.log("======================= results =======================");
    results.forEach(result => {
        switch (result.status) {
            case "SUCCESS":
                console.log(`✅ success`);
                console.log(`* stdout:`, result.stdout);
                break;
            case "FAILED":
                console.error(`❌ faild:`);
                // console.error("- err:", result.error);
                if (result.stdout) console.error("- stdout:", result.stdout.toString().replaceAll("\n", "\n_ "));
                if (result.stderr) console.error("- stderr:", result.stderr.toString().replaceAll("\n", "\n_ "));
                break;
        }
    });

    console.log("======================= End =======================", new Date().toLocaleTimeString());
}

runAllScriptsInParallel();
