const Choice = require("inquirer/lib/objects/choice");

module.exports = {
  promptList: [
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
  ],
};
