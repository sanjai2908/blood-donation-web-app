const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const repoRoot = path.resolve(__dirname, "..");

function fail(message) {
  console.error(message);
  process.exit(1);
}

function fileExists(relativePath) {
  return fs.existsSync(path.join(repoRoot, relativePath));
}

function ensureEnvExamplesExist() {
  const envExamples = [".env.example", path.join("backend", ".env.example")];
  const missing = envExamples.filter((item) => !fileExists(item));

  if (missing.length > 0) {
    fail(`Missing environment example file(s): ${missing.join(", ")}`);
  }
}

function ensureNoCommittedEnvFiles() {
  let trackedFiles = [];

  try {
    const output = execFileSync("git", ["ls-files", "-z"], {
      cwd: repoRoot,
      encoding: "utf8",
      maxBuffer: 10 * 1024 * 1024,
    });
    trackedFiles = output.split("\0").filter(Boolean);
  } catch (error) {
    fail(`Unable to inspect tracked files with git: ${error.message}`);
  }

  const committedEnvFiles = trackedFiles.filter((item) =>
    /(^|[\\/])\.env$/.test(item),
  );
  if (committedEnvFiles.length > 0) {
    fail(
      `Build blocked: committed .env file(s) found: ${committedEnvFiles.join(", ")}`,
    );
  }
}

function scanForHardcodedSecrets() {
  const blockedPatterns = [
    { label: "admin email", regex: /admin@gmail\.com/i },
    { label: "admin password", regex: /admin@123/i },
    { label: "sample donor email", regex: /john@example\.com/i },
    { label: "sample receiver email", regex: /hospital@example\.com/i },
    { label: "sample password", regex: /test123/i },
    { label: "sample 2FA password", regex: /TwoFa123!/i },
    {
      label: "development JWT secret",
      regex: /dev-blood-donation-secret-change-in-production/i,
    },
    {
      label: "hardcoded API key",
      regex: /(?:api[_-]?key|apikey)\s*[:=]\s*['\"][^'\"]{8,}['\"]/i,
    },
    {
      label: "hardcoded JWT secret",
      regex:
        /JWT_SECRET\s*=\s*(?!<|replace-with-|your-|change-me|placeholder)[^\s#]+/i,
    },
    { label: "credentialed mongodb uri", regex: /mongodb:\/\/[^\s]*:[^\s]*@/i },
  ];

  const scanExtensions = new Set([
    ".js",
    ".html",
    ".md",
    ".json",
    ".env",
    ".yml",
    ".yaml",
    ".txt",
  ]);
  const ignoreSegments = new Set([
    "node_modules",
    ".git",
    "dist",
    "build",
    "coverage",
    "scripts",
  ]);
  const findings = [];

  function walk(currentDir) {
    const relativeDir = path.relative(repoRoot, currentDir);
    if (
      relativeDir === "scripts" ||
      relativeDir.startsWith(`scripts${path.sep}`)
    ) {
      return;
    }

    for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
      if (ignoreSegments.has(entry.name)) {
        continue;
      }

      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }

      const extension = path.extname(entry.name).toLowerCase();
      if (!scanExtensions.has(extension) && entry.name !== "package.json") {
        continue;
      }

      const content = fs.readFileSync(fullPath, "utf8");
      for (const pattern of blockedPatterns) {
        if (pattern.regex.test(content)) {
          findings.push(
            `${path.relative(repoRoot, fullPath)} matched ${pattern.label}`,
          );
        }
      }
    }
  }

  walk(repoRoot);

  if (findings.length > 0) {
    fail(`Hardcoded secret scan failed:\n- ${findings.join("\n- ")}`);
  }
}

ensureEnvExamplesExist();
ensureNoCommittedEnvFiles();
scanForHardcodedSecrets();

console.log("Repository validation passed.");
