#!/usr/bin/env node
/**
 * Post-build script for Vercel deployment.
 *
 * Nitro's `vercel` preset outputs to `dist/` in a prebuilt format.
 * Vercel's Git integration expects the final output in `.vercel/output/`.
 * This script restructures the `dist/` output into the `.vercel/output/`
 * format that Vercel expects for v3 config deployments.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const outputDir = path.join(rootDir, ".vercel", "output");
const staticDir = path.join(outputDir, "static");
const funcDir = path.join(outputDir, "functions", "__server.func");

function rmDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function cpDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      cpDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Ensure dist/ exists
if (!fs.existsSync(distDir)) {
  console.error("❌ dist/ directory not found. Run `bun run build:vercel` first.");
  process.exit(1);
}

// Clean old output
rmDir(outputDir);
fs.mkdirSync(outputDir, { recursive: true });

// Generate Vercel config
const vercelConfig = {
  version: 3,
  routes: [
    { handle: "filesystem" },
    { src: "/(.*)", dest: "/__server" }
  ]
};
fs.writeFileSync(path.join(outputDir, "config.json"), JSON.stringify(vercelConfig, null, 2));

// Copy static assets (client/) into static/
if (fs.existsSync(path.join(distDir, "client"))) {
  cpDir(path.join(distDir, "client"), staticDir);
  console.log("✅ Static assets copied to .vercel/output/static/");
}

// Copy server function (server/) into functions/__server.func/
if (fs.existsSync(path.join(distDir, "server"))) {
  cpDir(path.join(distDir, "server"), funcDir);
  const vcConfig = {
    runtime: "nodejs20.x",
    handler: "server.js",
    launcherType: "Nodejs"
  };
  fs.writeFileSync(path.join(funcDir, ".vc-config.json"), JSON.stringify(vcConfig, null, 2));
  console.log("✅ Server function copied to .vercel/output/functions/__server.func/");
}

console.log("🚀 Vercel output ready at .vercel/output/");
