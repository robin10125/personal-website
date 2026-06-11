const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { execFileSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const projectsPath = path.join(root, "projects.js");
const outputPath = path.join(root, "project-dates.js");

const runGit = (args) => {
  try {
    return execFileSync("git", args, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }).trim();
  } catch {
    return "";
  }
};

const toDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getProjects = () => {
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(projectsPath, "utf8"), sandbox, {
    filename: "projects.js"
  });

  const content = sandbox.window.siteContent || {};
  return [
    ...(content.researchProjects || []),
    ...(content.selfStudyProjects || []),
    ...(content.techProjects || []),
    ...(content.workProjects || []),
    ...(content.otherProjects || [])
  ].filter((project) => project.url);
};

const getFileDate = (projectPath) => {
  const fullPath = path.join(root, projectPath);
  const status = runGit(["status", "--porcelain", "--", projectPath]);
  const tracked = runGit(["ls-files", "--error-unmatch", projectPath]);

  if (tracked && !status) {
    const committedDate = runGit(["log", "-1", "--format=%cs", "--", projectPath]);
    if (committedDate) {
      return committedDate;
    }
  }

  if (!fs.existsSync(fullPath)) {
    console.warn(`Warning: ${projectPath} does not exist; skipping date.`);
    return null;
  }

  if (!tracked) {
    console.warn(`Warning: ${projectPath} is untracked; using file modified time.`);
  } else if (status) {
    console.warn(`Warning: ${projectPath} has uncommitted changes; using file modified time.`);
  } else {
    console.warn(`Warning: ${projectPath} has no git date; using file modified time.`);
  }

  return toDateString(fs.statSync(fullPath).mtime);
};

const dates = {};
for (const project of getProjects()) {
  const normalizedUrl = project.url.replace(/^\.\//, "");
  const date = getFileDate(normalizedUrl);
  if (date) {
    dates[normalizedUrl] = date;
  }
}

const output = `window.projectLastUpdated = ${JSON.stringify(dates, null, 2)};\n`;
fs.writeFileSync(outputPath, output);
console.log(`Wrote ${path.relative(root, outputPath)} with ${Object.keys(dates).length} dates.`);
