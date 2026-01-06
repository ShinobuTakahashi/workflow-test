import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

const BEFORE_DAYS = 7;
const packageJsonPath = path.resolve(process.cwd(), "package.json");

let isError = false;

/**
 * 日付を "yyyy-mm-dd" 形式の文字列へ変換し返す。
 */
function formatDate(date) {
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  };
  const formatted = new Intl.DateTimeFormat("ja-JP", options).format(date);
  return formatted.replace(/\//g, "-");
}


let logs = [];

/**
 * akashic-cli 以外の各 package 配下に shrinkwrap.json を生成する。
 */
async function generateShrinkwrapJson() {
  let pkgName = "";

  try {
    const pkgJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    pkgName = pkgJson.name;
    // console.log(`--------------- ${pkgName} generateShrinkwrapJson start ---`);
    logs.push(`--------------- ${pkgName} generateShrinkwrapJson start ---`);

    const dt = new Date();
    dt.setDate(dt.getDate() - BEFORE_DAYS);
    const formattedDate = formatDate(dt);

    const npmInstallCmd = `npm i --before ${formattedDate}`;
    // console.log(`- exec: "${npmInstallCmd}"`);
    logs.push(`- exec: "${npmInstallCmd}"`);
    execSync(npmInstallCmd, { stdio: "inherit" });

    // エラーテスト
    const errCmd = "npm i @akashic/akashic-engine@3.21.2 --before 2025-09-10";
    console.log(`- exec: "${errCmd}"`);
    logs.push(`- exec: "${errCmd}"`);
    execSync(errCmd, { stdio: "inherit" });

    const npmShrinkwrapCmd = "npm shrinkwrap";
    // console.log(`- exec: "${npmShrinkwrapCmd}"`);
    logs.push(`- exec: "${npmShrinkwrapCmd}"`);
    execSync(npmShrinkwrapCmd, { stdio: "inherit" });

  } catch (err) {
    // console.error("--- Error:", err);
    logs.push("============= error ================");
    logs.push(err);
    logs.push("====================================");
    
    isError = true;
  } finally {
    // console.log(`------------ ${pkgName}  end ------------`);
    logs.push(`------------ ${pkgName}  end ------------`);
    const text = logs.join("\n");
    fs.writeFileSync("./generateShrinkwrapJson.log", text, "utf-8");
  }
}

process.on("beforeExit", () => {
  if (isError) process.exit(1);
});

generateShrinkwrapJson();
