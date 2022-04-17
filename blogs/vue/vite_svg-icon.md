---
title: vite2、vue3实现svgIcon组件
date: 2022-04-18
tags:
 - vue
categories:
 - vue
---

vue2.0+webpack实现svg Icon组件使用的是svg-sprite-loader。现vite无法使用，所以使用另外一个插件vite-plugin-svg-icons。

### 安装add vite-plugin-svg-icons

```shell
  yarn add vite-plugin-svg-icons -D
```

### 配置插件 vite.config.js

```js
  import viteSvgIcons from 'vite-plugin-svg-icons';
  import path from 'path'; 
  export default () => {
    return {
      plugins: [
        viteSvgIcons({
          // 配置路径在你的src里的svg存放文件
          iconDirs: [path.resolve(__dirname, 'src/assets/iconfont')],
          symbolId: 'icon-[dir]-[name]',
        }),
      ],
    };
  };
```

### SvgIcon组件实现

```vue
<template>
  <svg :class="['svg-icon',name]" aria-hidden="true">
    <use :xlink:href="symbolId" :fill="color" />
  </svg>
</template>
<script>
import { computed } from 'vue'
export default {
  name: 'SvgIcon',
  props: {
    prefix: {
      type: String,
      default: 'icon'
    },
    name: {
      type: String,
      required: true
    },
    color: {
      type: String,
      default: '#333'
    }
  },
  setup (props) {
    const symbolId = computed(() => `#${props.prefix}-${props.name}`)
    return { symbolId }
  }
}
</script>
<style scoped lang="scss">
.svg-icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style>

```

### 引入main.js

```js
  import 'vite-plugin-svg-icons/register';
  import SvgIcon from './components/SvgIcon/index.vue' 
  app.component('SvgIcon', svgIcon)
```

### 使用方法

```vue
<template>
  <SvgIcon name="search" />
</template>

<script>
  import { computed } from 'vue';
  import SvgIcon from './components/SvgIcon.vue';
  export default {
    components: { SvgIcon }
  }
</script>
```



