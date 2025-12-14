#!/usr/bin/env node

import { mkdirSync, writeFileSync, existsSync, copyFileSync } from "fs";
import { resolve, dirname } from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function copyTemplate(templatePath, destinationPath) {
  copyFileSync(resolve(__dirname, "../templates", templatePath), destinationPath);
}

function createProject(projectName) {
  const projectPath = resolve(process.cwd(), projectName);

  if (existsSync(projectPath)) {
    console.error(`Folder ${projectName} already exists.`);
    process.exit(1);
  }

  mkdirSync(projectPath);
  mkdirSync(resolve(projectPath, "src"));

  // Copy templates
  copyTemplate("index.html", resolve(projectPath, "index.html"));
  copyTemplate("src/index.js", resolve(projectPath, "src/index.js"));
  copyTemplate("src/App.js", resolve(projectPath, "src/App.js"));
  copyTemplate("webpack.config.js", resolve(projectPath, "webpack.config.js"));

  // Create package.json
  const pkg = {
    name: projectName,
    version: "1.0.0",
    type: "module",
    scripts: {
      build: "webpack",
      start: "npx serve . -l 4000",
    },
    dependencies: {
      react: "^18.0.0",
      "react-dom": "^18.0.0",
      nodality: "latest",
    },
    devDependencies: {
      webpack: "^5.0.0",
      "webpack-cli": "^5.0.0",
      "babel-loader": "^9.0.0",
      "@babel/core": "^7.0.0",
      "@babel/preset-env": "^7.0.0",
      "@babel/preset-react": "^7.0.0",
    },
  };
  writeFileSync(resolve(projectPath, "package.json"), JSON.stringify(pkg, null, 2));

  // Install dependencies
  console.log("Installing dependencies...");
  execSync(`npm install`, { cwd: projectPath, stdio: "inherit" });

  // Build project
  console.log("Building with Webpack...");
  execSync(`npx webpack`, { cwd: projectPath, stdio: "inherit" });

  console.log(`\nDone! To start your app:
  cd ${projectName}
  npm run build     # to rebuild
  npm start         # serve on localhost:4000
`);
}

// Parse CLI arguments
const args = process.argv.slice(2);
if (!args[0]) {
  console.error("Usage: npm create nodality-react <project-name>");
  process.exit(1);
}

createProject(args[0]);
