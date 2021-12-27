---
title: git约定式提交及生成修改日志等等配置
date: 2021-12-27
tags:
 - 配置
categories:
 - 配置
---

### git约定式提交

约定式提交：每次使用git commit 的时候都需要写commit message,如果message style是按照固定的模版格式书写，对于后期的维护和编写changelog都有巨大的好处。
而且现在的很多自动生成changelog的工具，都是建立在约定式提交的基础之上。

### 约定式提交校验配置

约定式提交不需要任何的配置，只需要严格遵守其规范就可以了。
为了保证每次提交的commit message都是遵守conventional commit spec所以添加了校验配置.

### 约定式提交工具
约定式提交使用交互式提交工具（例如： commitizen），使用工具能够保证约定式提交个格式是满足规范的。

```shell
yarn add commitizen -D
```


#### commitizen的适配器cz-conventional-changelog
commitizen只是一个提交的工具，只有添加了约定格式的适配器才能按照固定格式进行交互式提交，否则就和普通的git commit一样了。（还有其他适配器可选，请参考官方文档）不同的适配器，提供的约定标准有差异。cz-conventional-changelog用来规范提交信息。

```shell
yarn add cz-conventional-changelog -D
```

```json
// package.json配置
{
  "config": {
    "commitizen": {
      "path": "./node_modules/cz-conventional-changelog"
    }
  },
  "scripts": {
    "commit": "git-cz"
  }
}
```
 
#### 说明

"build", // 主要目的是修改项目构建系统(例如 gulp，webpack，rollup 的配置等)的提交
"chore", // 其他修改, 比如构建流程, 依赖管理
"ci", // 主要目的是修改项目继续集成流程(如Travis，Jenkins，GitLab CI，Circle等)
"docs", // 文档更新
"feat", // 新功能
"fix", // 修复 bug
"perf", // 性能优化
"refactor", // 重构代码(既没有新增功能，也没有修复bug)
"revert", // 回滚某个更早之前的提交
"style", // 不影响程序逻辑的代码修改(修改空白字符，格式缩进，补全缺失的分号等，没有改变代码逻辑)
"test" // 测试


### 约定式提交格式校验

#### commitlint校验约定式提交格式
为了防止出现不满足格式要求的commit message出现，还是需要添加上必要的格式校验.使用commitlint

安装
```shell
yarn add @commitlint/config-conventional@11.0.0 @commitlint/cli@11.0.0 -D

```

根添加配置文件commitlint.config.js
```js
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional']
}
```

#### husky配置git hooks

有了git hooks我们可以做很多提交之前的验证。

安装
```shell
yarn add husky@4.3.0 -D
```

package.json 配置
```json
{
  "husky": {
    "hooks": {
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS", // 配合commitlint使用
      // "pre-commit": "lint-staged" // 配置lint-staged
    }
  }
}
```


#### lint-staged配置

list-staged主要配合linter用来格式化代码（统一的代码风格），这部是可选的。是用来让格式化工具只lint需要提交的文件，其它文件忽略，这样能够提高效率。

安装
```shell
yarn add lint-staged -D
```

package.json 配置
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged" 
    }
  },
  "lint-staged": {
    "src/**/*.{js,ts,css,vue,tsx,jsx}": [
        //"vue-cli-service lint", 配合vue使用
        "eslint",
        "git add"
    ]
  }
}
```

### 自动生成changelog
自动生成changelog是建立在约定式提交的基础上。standard-version做了自动打tag，自动生成changelog等过程.


standard-version配置
```shell
yarn add standard-version -D
```

package.json配置
```json
{
  "scripts": {
    "release": "standard-version",
    "release:first": "standard-version -r 1.0.0"
  },
  // standard-version 好多配置看官方文档（可选）
  "standard-version": {}
}
```

