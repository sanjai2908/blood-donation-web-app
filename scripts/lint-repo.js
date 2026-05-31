const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const repoRoot = path.resolve(__dirname, "..");

function fail(message) {
  console.error(message);
  process.exit(1);
}

function walkForJavaScriptFiles(currentDir, results) {
  for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
    if (
      ["node_modules", ".git", "dist", "build", "coverage"].includes(entry.name)
    ) {
      continue;
    }

    const fullPath = path.join(currentDir, entry.name);
    if (entry.isDirectory()) {
      walkForJavaScriptFiles(fullPath, results);
      continue;
    }

    if (path.extname(entry.name).toLowerCase() === ".js") {
      results.push(fullPath);
    }
  }
}

const jsFiles = [];
walkForJavaScriptFiles(repoRoot, jsFiles);

const failures = [];
for (const filePath of jsFiles) {
  const result = spawnSync(process.execPath, ["--check", filePath], {
    cwd: repoRoot,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    failures.push(
      `${path.relative(repoRoot, filePath)}\n${result.stderr || result.stdout}`.trim(),
    );
  }
}

if (failures.length > 0) {
  fail(`JavaScript syntax check failed:\n- ${failures.join("\n- ")}`);
}

console.log(`JavaScript syntax check passed for ${jsFiles.length} file(s).`);
