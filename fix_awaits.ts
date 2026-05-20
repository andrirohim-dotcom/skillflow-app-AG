import fs from "fs";
import path from "path";

const dirPath = path.join(__dirname, "components");

const funcsToAwait = [
  "getWsSources",
  "getWsSessions",
  "getWsInsights",
  "getWsSkillProgress",
  "getWsTasks",
  "getWsSourceById",
  "getWsSessionsBySource",
  "getWsInsightsBySource",
  "getWsSkillProgressBySource",
  "getWsTasksBySource",
  "saveWsSource",
  "updateWsSource",
  "deleteWsSource",
  "saveWsInsight",
  "deleteWsInsight",
  "saveWsSession",
  "deleteWsSession",
  "saveWsSkillProgress",
  "updateWsSkillProgress",
  "deleteWsSkillProgress",
  "saveWsTask",
  "updateWsTask",
  "deleteWsTask",
];

const regexStr = `(?<!await\\s+)(${funcsToAwait.join("|")})\\(`;
const regex = new RegExp(regexStr, "g");

function walkDir(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith(".tsx") || fullPath.endsWith(".ts")) {
      const content = fs.readFileSync(fullPath, "utf-8");
      if (regex.test(content)) {
        const newContent = content.replace(regex, "await $1(");
        fs.writeFileSync(fullPath, newContent, "utf-8");
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

walkDir(dirPath);
