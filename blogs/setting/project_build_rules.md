---
title: 前端项目搭建规范（vue3+eslint+prettier+husky+lint-staged+commitlint+changelog）
date: 2022-04-25
tags:
 - 配置
categories:
 - 配置
---

## 项目初始化

### 使用vue-cli
```shell
yarn global add @vue/cli
vue create <project-name>
```
命令行内可选配置，使用默认配置eslint+prettier即可

### 使用vite

创建项目
```shell
yarn create vite
```
默认并未集成eslint以及prettier，需自行引入

```shell
yarn add eslint -D
```

安装eslint后执行，命令行交互即可选择eslint初始化,我选择的是ts+eslint+standard（js生成.eslintrc.json文件略有偏差）
```shell
eslint --init
```

之后再安装prettier相关依赖
```shell
yarn add @vue/eslint-config-prettier prettier -D
```

.eslintrc.json使用如下配置
```json
{
	"env": {
		"browser": true,
		"es2021": true,
		"node": true
	},
	"extends": [
		"plugin:vue/essential",
		"standard",
		"@vue/prettier"
	],
	"parserOptions": {
		"ecmaVersion": "latest",
		"parser": "@typescript-eslint/parser",
		"sourceType": "module"
	},
	"plugins": [
		"vue",
		"@typescript-eslint"
	],
	"rules": {
		"vue/no-multiple-template-root": "off"
	}
}
```

### prettier配置
根目录新建.prettierrc.js以及.prettierignore文件
```js
// .prettierrc.js
module.exports = {
  printWidth: 100,
  tabWidth: 2,
  useTabs: true,
  semi: false,
  singleQuote: true,
  jsxSingleQuote: true,
  trailingComma: 'none',
  bracketSpacing: true,
  arrowParens: 'avoid',
  htmlWhitespaceSensitivity: 'strict',
  endOfLine: 'lf'
}
```

.prettierignore
```yaml
/dist/*
.local
.output.js
/node_modules/**

**/*.svg
**/*.sh

/public/*
```

## 集成editorconfig配置
vscode需安装扩展EditorConfig（若组内开发者统一使用同款IDE，则无需配置）。
```yaml
# http://editorconfig.org
root = true

[*] # 表示所有文件适用
charset = utf-8 # 设置文件字符集为 utf-8
indent_style = space # 缩进风格（tab | space）
indent_size = 2 # 缩进大小
end_of_line = lf # 控制换行类型(lf | cr | crlf)
trim_trailing_whitespace = true # 去除行首的任意空白字符

[*.md] # 表示仅 md 文件适用以下规则
max_line_length = off
trim_trailing_whitespace = false
```

## husky+lint-staged配置
husky是git的hook工具，可以帮助我们触发git提交的各个阶段：pre-commit、commit-msg、pre-push。
lint-staged能只对git暂存库内文件进行读取，并运行配置好的脚本。提高检测效率，若无影响可不使用。

husky自动配置命令
```shell
npx husky-init && yarn
```

lint-staged安装
```
yarn add lint-staged -D
```

package.json文件配置如下内容
```json
{
	"scripts": {
		// vite自行添加，若cli则默认有"lint": "vue-cli-service lint"
		"lint": "eslint --fix --ext .ts --ext .js --ext .vue src/" 
	}, 
	"lint-staged": {
		"src/**/*.{js,ts,jsx,tsx,vue}": [
			"yarn lint",
			"git add"
		]
	}
}
```

修改根目录.husky文件夹下的pre-commit文件内容
```shell
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

这时再执行git commit，预提交时则会先执行lint-staged，则会对文件进行lint校验。


## commit规范

### 安装Commitizen 
Commitizen 是一个帮助我们编写规范 commit message 的工具；cz-conventional-changelog是Commitizen的适配器,只有添加了约定格式的适配器才能按照固定格式进行交互式提交。

安装
```shell
yarn add commitizen cz-conventional-changelog -D
```

package.json添加以下配置
```json
// package.json配置
{
	"scripts": {
    "commit": "git-cz"
  },
  "config": {
    "commitizen": {
      "path": "./node_modules/cz-conventional-changelog"
    }
  }
}
```

这时我们提交代码使用yarn commit命令，会展示一个交互式命令行。
* 第一步是选择type，本次更新的类型

| Type     | 作用                                                         |
| -------- | ------------------------------------------------------------ |
| feat     | 新增特性 (feature)                                           |
| fix      | 修复 Bug(bug fix)                                            |
| docs     | 修改文档 (documentation)                                     |
| style    | 代码格式修改(white-space, formatting, missing semi colons, etc) |
| refactor | 代码重构(refactor)                                           |
| perf     | 改善性能(A code change that improves performance)            |
| test     | 测试(when adding missing tests)                              |
| build    | 变更项目构建或外部依赖（例如 scopes: webpack、gulp、npm 等） |
| ci       | 更改持续集成软件的配置文件和 package 中的 scripts 命令，例如 scopes: Travis, Circle 等 |
| chore    | 变更构建流程或辅助工具(比如更改测试环境)                     |
| revert   | 代码回退                                                     |

* 第二步选择本次修改的范围（作用域）
* 第三步选择提交的信息
* 第四步提交详细的描述信息
* 第五步是否是一次重大的更改（默认No）
* 第六步是否影响某个open issue（默认No）


### commitlint限制提交
我们按照cz来规范了提交风格，但是依然有同事通过 `git commit` 按照不规范的格式提交。所以要通过commitlint来限制提交。

安装 @commitlint/config-conventional 和 @commitlint/cli
```shell
yarn add @commitlint/config-conventional @commitlint/cli -D
```

根目录创建commitlint.config.js文件，配置commitlint
```js
//commitlint.config.js 
module.exports = {
  extends: ['@commitlint/config-conventional']
}
```

使用husky生成commit-msg文件，验证提交信息
```shell
npx husky add .husky/commit-msg "npx --no-install commitlint --edit $1"
```

这样commit提交信息填写不规范时则会阻止提交。


## 生成CHANGE_LOG
根据我们的commit提交记录可自动生成changelog。每次发版前可生成改changelog。最好在stage环境中使用（pre、预发布）

安装conventional-changelog-cli
```shell
yarn add conventional-changelog-cli -D
```

package.json文件中增加以下脚本，最好在预发布环境中使用以下脚本
```json
{
  "scripts": {
	  // 首次，第一次生成使用
	  "genlog:first": "conventional-changelog -p angular -i CHANGELOG.md -s -r 0 && git add CHANGELOG.md && git push", 
	  // 后续，追加内容，命令行会有版本tag交互
	  "genlog": "conventional-changelog -p angular -i CHANGELOG.md -s && git add CHANGELOG.md && git push"
  }
}
```

执行命令后在根目录生成CHANGELOG.md文件。但是生成的md文件中仅含有fix，perf，feat内容。其余类型的提交内容不展示。
无需展示的话使用截止到上述即可，若需要展示全部提交类型的内容需安装conventional-changelog-custom-config
```shell
yarn add conventional-changelog-custom-config -D
```

package.json脚本内容修改为
```json
{
	"scripts": {
	  // 首次，第一次生成使用
	  "genlog:first": "conventional-changelog -p custom-config -i CHANGELOG.md -s -r 0 && git add CHANGELOG.md && git push", 
	  // 后续，追加内容，命令行会有版本tag交互
	  "genlog": "conventional-changelog -p custom-config -i CHANGELOG.md -s && git add CHANGELOG.md && git push"
	}
}
```





