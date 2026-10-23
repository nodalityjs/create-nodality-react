#!/usr/bin/env node

import { mkdirSync, writeFileSync, existsSync, copyFileSync } from "fs";
import { resolve, dirname } from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const FILES = [
  "index.html",
  "vite.config.js",
  "prerender.mjs",
  // Shipped without the dot: npm leaves every .gitignore out of a published
  // package, so "templates/.gitignore" never reached users and copying it
  // threw ENOENT. Renamed back to .gitignore when it is copied, below.
  "gitignore",
  "src/spec.js",
  "src/App.jsx",
  "src/main.jsx",
  "src/entry-server.jsx",
];

function createProject(projectName) {
  const projectPath = resolve(process.cwd(), projectName);

  if (existsSync(projectPath)) {
    console.error(`Folder ${projectName} already exists.`);
    process.exit(1);
  }

  mkdirSync(projectPath);
  mkdirSync(resolve(projectPath, "src"));

  for (const f of FILES) {
    const dest = f === "gitignore" ? ".gitignore" : f;
    copyFileSync(resolve(__dirname, "../templates", f), resolve(projectPath, dest));
  }

  const pkg = {
    name: projectName,
    private: true,
    version: "0.0.0",
    type: "module",
    scripts: {
      dev: "vite",
      // Three passes: client bundle, server bundle, then prerender — React to
      // HTML, Nodality into the hosts React leaves behind.
      build:
        "vite build && vite build --ssr src/entry-server.jsx --outDir dist-server && node prerender.mjs",
      preview: "vite preview",
    },
    dependencies: {
      react: "^18.3.1",
      "react-dom": "^18.3.1",
      // nodality/react — the <Nodality> host component — first shipped in 1.3.25.
      nodality: "^1.3.25",
    },
    devDependencies: {
      vite: "^5.4.0",
      "@vitejs/plugin-react": "^4.3.0",
      // Peer dependency of nodality/ssg — the prerender step runs the same
      // builder in a simulated DOM.
      jsdom: "^24.1.0",
    },
  };
  writeFileSync(
    resolve(projectPath, "package.json"),
    JSON.stringify(pkg, null, 2) + "\n",
  );

  console.log("Installing dependencies...");
  execSync("npm install", { cwd: projectPath, stdio: "inherit" });

  console.log(`
Done.

  cd ${projectName}
  npm run dev      # develop
  npm run build    # bundle + prerender to dist/
  npm run preview  # serve dist/

After a build, open dist/index.html in a text editor: the specification from
src/spec.js is there as real HTML, before any script runs.
`);
}

const args = process.argv.slice(2);
if (!args[0]) {
  console.error("Usage: npm create nodality-react <project-name>");
  process.exit(1);
}

createProject(args[0]);
