# 从 0 到 1 用 Node 创建 CLI 工具

## 准备工作

### 1. 创建工程

```shell
mkdir my-cli
cd my-cli
npm init -y
npm i commander download-git-repo ora handlebars figlet clear chalk open watch -S
```

### 2. 创建 bin 目录

- package.json 添加 bin 字段，将自定义的命令软连到全局环境，同时执行 npm link 创建链接。

```json
 "bin": {
    "wbiao": "./bin//index.js"
  }
```

- 在根目录下创建 bin 文件夹，新建 index.js 文件，行首增加一行`#!/usr/bin/env node`指定当前脚本由 node.js 进行解析。

```js
#!/usr/bin/env node

console.log("Hello World!!!");
```

- 命令行执行`npm link`,相当于把这个包连接到全局。

如果 npm link 报错，windows/mac 尝试使用管理员身份输入。

- 在命令行执行`wbiao`
  ![2020-12-11-11-02-21](http://qn.cawsct.com/2020-12-11-11-02-21.png)

## 2. 搭建命令行界面

| 插件名称    | 说明                                             |
| ----------- | ------------------------------------------------ |
| commander   | 一个解析命令行命令和参数工具                     |
| inquirer    | 常用交互式命令行用户界面的集合                   |
| fuzzy       | 字符串模糊匹配的插件，根据输入关键词进行模糊匹配 |
| json-format | json 美化/格式化工具                             |

### 识别命令行 - commander

command 后面可跟一个 name，用空格隔开。

- alias: 定义一个更短的命令行指令
- description：描述，他在 help 里展示
- action：注册一个回调函数
- parse：解析命令行

```js
const program = require("commander");
program.version(require("../package.json").version);

program
  .command("init <name>")
  .alias("i")
  .description("init project")
  .action((name) => {
    console.log(`项目名称为:${name}`);
  });

// 解析主进程的参数
program.parse(process.argv);
```

### 输出欢迎界面 - figlet/clear/chalk

输入 wbiao init 就会输出以下欢迎界面，那么需要什么工具？
![2020-12-11-14-15-08](http://qn.cawsct.com/2020-12-11-14-15-08.png)

工具：

- figlet: 创建字符图案
- clear: 清屏
- chalk: 改变 log 颜色的工具

做法：

- 新建文件夹 lib，新建 init.js

```js
const { promisify } = require("util");

const figlet = promisify(require("figlet")); // 字符画
const clear = require("clear"); // 清屏
const chalk = require("chalk"); // 改变输出log颜色的工具

const log = (content) => console.log(chalk.green(content)); // 封装console

module.exports = async (name) => {
  clear();
  // 输出欢迎界面
  const figlet_data = await figlet("WBIAO");
  log(figlet_data);
};
```

### 加载进度 - ora

```js
async function clone(repo, desc) {
  const download = promisify(require("download-git-repo")); // 从git下载仓库
  const ora = require("ora"); // 命令行显示加载效果
  const process = ora(`downing ${repo}....`);
  process.start();
  await download(repo, desc);
  process.succeed();
}
```

### 从 git 下载仓库 - download-git-repo / ora

download-git-repo 有一个 clone 方法，用法如下：

```js
clone(repository, destination, options, callback);
```

| 参数        | 说明          | 备注                                                                       |
| ----------- | ------------- | -------------------------------------------------------------------------- |
| repository  | github 库地址 | GitHub - github:owner/name 或者简写为 owner/nameGitLab - gitlab:owner/name |
| destination | 目标文件夹    | -                                                                          |

在下载仓库的过程中需要添加加载的过程，可以使用 ora 库。

```js
const ora = require("ora");
const spinner = ora("Loading unicorns").start();
setTimeout(() => {
  spinner.color = "yellow";
  spinner.text = "Loading rainbows";
}, 1000);
```

显示的效果是：
![ora显示的效果](https://upload-images.jianshu.io/upload_images/4107355-ed8b578ea2817246.gif?imageMogr2/auto-orient/strip|imageView2/2/w/960/format/webp)

此时我们封装一个 download 方法，用作下载仓库并显示进度

```js
async function clone(repo, desc) {
  const download = promisify(require("download-git-repo")); // 从git下载仓库
  const ora = require("ora"); // 命令行显示加载效果
  const process = ora(`downloading ${repo}....`);
  process.start();
  await download(repo, desc);
  process.succeed();
}
```

在 init 里引入

```js
module.exports = async (name) => {
  ...

  // 2. 下载项目
  log("😀创建项目： " + name);
  await clone("github:hopkinson/vue-mock-demo", name);
};
```

### 选取模板下载仓库 - inquirer

我们如果有多个模板的情况下需要选择一个，那就不能写固定下载地址，而是根据需要选择模板。那么可以用 inquirer 库。

基本用法：

```js
const inquirer = require("inquirer");
const promptList = [
  {
    type: "list",
    name: "type",
    message: "请选择拉取的模板类型: ",
    choices: [
      {
        name: "pc",
        value: {
          url: "hopkinson/vue-mock-demo",
          gitName: "vue-mock-demo",
          val: "PC端模版",
        },
      },
    ],
  },
];

inquirer.prompt(promptList).then((answers) => {
  console.log(answers); // 返回的结果
});
```

在脚手架里，在 init 里引入选择模板并下载：

```js
var promptList = [
  {
    type: "list",
    name: "type",
    message: "请选择拉取的模板类型: ",
    choices: [
      {
        name: "pc",
        value: {
          url: "hopkinson/vue-mock-demo",
          gitName: "vue-mock-demo",
          val: "PC端模版",
        },
      },
      {
        name: "mobile",
        value: {
          url: "littleTreeme/vue-web-template.git",
          gitName: "vue-web-template",
          val: "PC端模版",
        },
      },
    ],
  },
];

inquirer.prompt(promptList).then(async (result) => {
  const { url, gitName, val } = result.type;
  await clone(`github:${url}`, name);
  log(`已下载${gitName}（${val}）项目，正在安装依赖...`);
});
```

## 3. 安装依赖 - spawn

封装 spawn 函数，通过子线程来做我们的安装依赖；

```js
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
```

然后再引入到 init 里。

注意的是：window10 中，在 spawn 中执行 npm 报错 [Error: spawn ENOENT]” errors。
解决方法是：加入的判断`process.platform === "win32" ? "npm.cmd" : "npm"`

```js
module.exports = async (name) => {
  ...
 // 3. 自动安装依赖
  //npm：要执行的命令，可以是cnpm...
  //  * []:所有参数放数组中
  //  * cwd: 在哪个目录下执行命令
  spawn(process.platform === "win32" ? "npm.cmd" : "npm", ["install"], { cwd: `./${name}` });
   log(`
    😏安装完成：
    ==============
    cd ${name}
    npm run dev
    ==============
    `);
};

```

## 4. 自动启动界面 -open

- open: 打开浏览器

```js
module.exports = async (name) => {
    ...
  // 4.打开浏览器
  await spawn(
    process.platform === "win32" ? "npm.cmd" : "npm",
    ["run", "dev"],
    { cwd: `./${name}` }
  );
  open("http://localhost:8080");
};
```
