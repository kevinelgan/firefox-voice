const ejs = require("ejs");
const path = require("path");
const fs = require("fs");
const package_json = require("../package.json");
const child_process = require("child_process");

const OUTPUT = path.normalize(
  path.join(__dirname, "../extension/manifest.json")
);
const TEMPLATE = OUTPUT + ".ejs";
const BUILD_OUTPUT = path.normalize(
  path.join(__dirname, "../extension/buildSettings.js")
);
const BUILD_TEMPLATE = BUILD_OUTPUT + ".ejs";
const INTENT_DIR = path.normalize(path.join(__dirname, "../extension/intents"));

const filenames = fs.readdirSync(INTENT_DIR, { encoding: "UTF-8" });
const intentNames = [];
for (const filename of filenames) {
  if (!filename.startsWith(".") && !filename.endsWith(".txt")) {
    intentNames.push(filename);
  }
}
const gitCommit = child_process
  .execSync("git describe --always --dirty", {
    encoding: "UTF-8",
  })
  .trim();

const context = {
  env: process.env,
  package_json,
  intentNames,
  gitCommit,
  buildTime: new Date().toISOString(),
};

// ejs options:
const options = {
  escape: JSON.stringify,
};

ejs.renderFile(TEMPLATE, context, options, function(err, str) {
  if (err) {
    console.error("Error rendering", TEMPLATE, "template:", err);
    process.exit(1);
    return;
  }
  fs.writeFileSync(OUTPUT, str, { encoding: "UTF-8" });
  console.log(`${OUTPUT} written`);
});

ejs.renderFile(BUILD_TEMPLATE, context, options, function(err, str) {
  if (err) {
    console.error("Error rendering", BUILD_TEMPLATE, "template:", err);
    process.exit(1);
    return;
  }
  fs.writeFileSync(BUILD_OUTPUT, str, { encoding: "UTF-8" });
  console.log(`${BUILD_OUTPUT} written`);
});
