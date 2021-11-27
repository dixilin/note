---
title: create-react-app eslint、prettier配置
date: 2021-11-27
tags:
 - 配置
categories:
 - 配置
---

### cra创建项目
```shell
yarn create-react app <project-name>
```

若要使用typescript，则执行以下代码
```shell
yarn create-react app <project-name> --template typescript
```

### 启动项目
```shell
cd <project-name> 
yarn start
```

**cra4默认集成eslint，可直接新建.eslintrc文件覆盖**

### eslint配置

删除package.json内的eslintConfig里的extends:["react-app"]；
根目录新建.eslintrc.json（或者.js都行），我使用的是json后缀

由于react-app也是一种规则，直接可使用以下配置进行拓展
```json
{
  "extends": [
    "react-app", "prettier"
  ],
  "rules": {
    "semi": ["error", "never"], // 末尾不添加分号
    "quotes": ["error", "single"], // js中 强制使用单引号 
    "jsx-quotes": ["error", "prefer-single"], // JSX 属性中使用一致的单引号或双引号 
    "indent": ["error", "tab"], // 强制使用tab缩进
    "eqeqeq": "error", // 必须使用 === 和 !==
    "no-empty-function": "error", // 禁止空函数
    "no-multi-spaces": "error", // 禁止使用多个空格
    "no-trailing-spaces": "error", // 禁止禁用行尾空格
    "space-infix-ops": "error", // 要求操作符周围有空格
    "space-in-parens": "error", // 强制在圆括号内使用一致的空格
    "no-var": "error", // 要求使用 let 或 const 而不是 var,
    "no-unused-vars": "error", // 禁止出现未使用过的变量
    "react/prop-types": 0, // 防止在react组件定义中缺少props验证
    "no-multiple-empty-lines": ["error", { "max": 1 }], // 禁止出现多行空行
  },
  // ts额外eslint配置可写在这里
  "overrides": [
    {
      "files": ["**/*.ts?(x)"],
      "rules": {
      }
    }
  ]
}
```

html方面可使用prettier
```shell
yarn add eslint-config-prettier eslint-plugin-prettier prettier -D
```

根目录创建.prettierrc.json文件,可直接使用以下配置
```json
{
  "semi": false,
  "singleQuete": true,
  "tabWidth": 2,
  "prindWidth": 100,
  "trailingComma": "none",
  "bracketSpacing": true,
  "jsxBracketSameLine": false,
  "endOfLine": "lf",
  "htmlWhiteSpaceSensitivity": "strict"
}
```

vscode settings增加以下配置保存可自动校验规范代码以及jsx内html标签提示
```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll": true
  },
  "emmet.includeLanguages": {
    "javascript": "javascriptreact",
    "typescript": "typescriptreact"
  }
}
```



