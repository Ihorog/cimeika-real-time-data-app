#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const forbiddenExtensions = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".webp",
  ".ico",
  ".bmp",
  ".tiff",
  ".psd",
  ".ai",
  ".mp3",
  ".wav",
  ".mp4",
  ".mov",
  ".pdf",
  ".zip",
  ".tar",
  ".gz",
  ".7z",
]);

const ignoredDirectories = new Set([
  ".git",
  "node_modules",
  ".next",
  "dist",
  "coverage",
]);

const flaggedPaths = [];

function walk(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (ignoredDirectories.has(entry.name)) continue;
      walk(path.join(directory, entry.name));
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (forbiddenExtensions.has(ext)) {
      flaggedPaths.push(path.relative(process.cwd(), path.join(directory, entry.name)));
    }
  }
}

function main() {
  const projectRoot = path.resolve(__dirname, "..");
  process.chdir(projectRoot);

  walk(projectRoot);

  if (flaggedPaths.length === 0) {
    console.log("✅ No forbidden binary assets detected.");
    return;
  }

  console.error("❌ Forbidden binary assets found:");
  for (const filePath of flaggedPaths) {
    console.error(` - ${filePath}`);
  }
  console.error("Remove these files or replace them with text-based alternatives before committing.");
  process.exit(1);
}

main();
