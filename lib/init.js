const { promisify } = require("util");

const figlet = promisify(require("figlet")); // 字符画
const clear = require("clear"); // 清屏
const chalk = require("chalk"); // 改变输出log颜色的工具
const open = require("open"); // 打开浏览器
const inquirer = require("inquirer");
const log = (content) => console.log(chalk.green(content)); // 封装console
const { promptList } = require("../config/index");
// 克隆仓库
const clone = async (repo, desc) => {
  const download = promisify(require("download-git-repo")); // 从git下载仓库
  const ora = require("ora"); // 命令行显示加载效果
  const process = ora(`downloading ${repo}....`);
  process.start();
  await download(repo, desc);
  process.succeed();
};

// 自动安装依赖
const spawn = async (...args) => {
  const { spawn } = require("child_process"); //原生包的子进程
  return new Promise((resolve) => {
    const proc = spawn(...args);
    proc.stdout.pipe(process.stdout); //子进程的输出流与主进程相对接  为了打印子进程的日志
    proc.stderr.pipe(process.stderr); //错误流
    proc.on("close", () => {
      resolve();
    });
  });
};

module.exports = async (name) => {
  clear();
  // 1. 输出欢迎界面
  const figlet_data = await figlet("WBIAO");
  log(figlet_data);

  // 2. 下载项目
  log("😀创建项目： " + name);

  inquirer.prompt(promptList).then(async (result) => {
    const { url, gitName, val } = result.type;
    await clone(`github:${url}`, name);
    log(`已下载${gitName}（${val}）项目，正在安装依赖...`);

    // 3. 自动安装依赖
    //npm：要执行的命令，可以是cnpm...
    //  * []:所有参数放数组中
    //  * cwd: 在哪个目录下执行命令
    await spawn(process.platform === "win32" ? "npm.cmd" : "npm", ["install"], {
      cwd: `./${name}`,
    });
    log(`
      😏安装完成：
        ==============
        cd ${name}
        npm run dev
        ==============
        `);

    // 4. 自动启动界面
    await spawn(
      process.platform === "win32" ? "npm.cmd" : "npm",
      ["run", "dev"],
      { cwd: `./${name}` }
    );
    open("http://localhost:8080");
  });
};

