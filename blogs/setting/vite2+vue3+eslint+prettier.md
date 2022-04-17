---
title: vite2+vue3+eslint+prettier配置
date: 2022-03-10
tags:
 - 配置
categories:
 - 配置
---

### 创建vite2+vue3项目
```shell
yarn create vite my-vue-app --template vue
```

### 安装eslint、prettier及相关依赖
```shell
yarn add eslint eslint-plugin-vue prettier eslint-plugin-prettier @vue/eslint-config-prettier -D
```

### 根目录创建.eslintrc.js文件
```js
// .eslintrc.js
module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true
  },
  extends: ['plugin:vue/vue3-essential', 'eslint:recommended', 'prettier', '@vue/prettier'],
  plugins: ['prettier'],
  parserOptions: {
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  rules: {
    'prettier/prettier': 'error',
    'vue/multi-word-component-names': 'off'
  },
  globals: {
    defineProps: 'readonly'
  }
}
```

### 根目录创建.prettierrc.js
```js
// .prettierrc.js
module.exports = {
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: false,
  singleQuote: true,
  jsxSingleQuote: true,
  trailingComma: 'none',
  bracketSpacing: true,
  jsxBracketSameLine: false,
  arrowParens: 'avoid',
  htmlWhitespaceSensitivity: 'strict',
  endOfLine: 'lf'
}
```

### vite配置

#### 安装vite-plugin-eslint
```shell
yarn add vite-plugin-eslint -D
```

#### vite.config.js配置plugins
```js
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import eslintPlugin from 'vite-plugin-eslint' // 引入vite-plugin-vue
import path from 'path'

export default defineConfig({
  plugins: [
    vue(),
    eslintPlugin({
      include: ['src/**/*.js', 'src/**/*.vue', 'src/*.js', 'src/*.vue']
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    }
  }
})
```

