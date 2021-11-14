---
title: vuePress Note搭建
date: 2021-11-14
tags:
 - 搭建
categories:
 - 搭建
---

**note搭建，由于本人懒，直接使用vuepress-theme-reco提供的cli；也可使用VuePress从零开始搭建，后续配置可使用其他主题。**


### 执行命令生成项目
```shell
npx @vuepress-reco/theme-cli init
```

### 本地安装依赖以及运行

```shell
yarn && yarn dev
```


### 安装插件优化页面

#### 官方功能

像评论、时间线、域名的配置、多语言、暗色适配、侧边栏、文档的摘要，根据官方文档配置。

#### 看板娘

```shell
yarn add @vuepress-reco/vuepress-plugin-kan-ban-niang
```

config.js的plugins内下增加该代码
```js
plugins: [
  [
    '@vuepress-reco/vuepress-plugin-kan-ban-niang',{
      theme: [
       'blackCat', 'miku', 'whiteCat', 'haru1', 'haru2', 'haruto', 'koharu', 'izumi', 'shizuku', 'wanko', 'z16'
      ],
      clean: true,
      messageStyle: { right: '68px', bottom: '290px' },
      width: 250,
      height: 320
    }
  ]
]
```

#### 音乐播放器

```shell
yarn add @vuepress-reco/vuepress-plugin-bgm-player
```

config.js的plugins内下增加该代码
```js
plugins: [
  [
    "@vuepress-reco/vuepress-plugin-bgm-player",{
      audios: [
        // 本地文件示例
        // {
        //   name: '장가갈 수 있을까',
        //   artist: '咖啡少年',
        //   url: '/bgm/1.mp3',
        //   cover: '/bgm/1.jpg'
        // },
        // 网络文件示例
        {
          name: '用胳膊当枕头',
          artist: '최낙타',
          url: 'https://assets.smallsunnyfox.com/music/3.mp3',
          cover: 'https://assets.smallsunnyfox.com/music/3.jpg'
        }
      ]  
    }
  ]
]
```

#### 鼠标点击特效

```shell
yarn add vuepress-plugin-cursor-effects
```

config.js的plugins内下增加该代码
```js
plugins: [
  [
    "vuepress-plugin-cursor-effects",
    {
      size: 2, // size of the particle, default: 2
      shape: 'circle',  // shape of the particle, default: 'star'
      zIndex: 999999999  // z-index property of the canvas, default: 999999999
    }
  ]
]
```

#### 首页增加向下滚动

首页README.md加入以下代码
```vue
<style>
.anchor-down {
  display: block;
  margin: 12rem auto 0;
  bottom: 45px;
  width: 20px;
  height: 20px;
  font-size: 34px;
  text-align: center;
  animation: bounce-in 5s 3s infinite;
  position: absolute;
  left: 50%;
  bottom: 30%;
  margin-left: -10px;
  cursor: pointer;
}
@-webkit-keyframes bounce-in{
  0%{transform:translateY(0)}
  20%{transform:translateY(0)}
  50%{transform:translateY(-20px)}
  80%{transform:translateY(0)}
  to{transform:translateY(0)}
}
.anchor-down::before {
  content: "";
  width: 20px;
  height: 20px;
  display: block;
  border-right: 3px solid #fff;
  border-top: 3px solid #fff;
  transform: rotate(135deg);
  position: absolute;
  bottom: 10px;
}
.anchor-down::after {
  content: "";
  width: 20px;
  height: 20px;
  display: block;
  border-right: 3px solid #fff;
  border-top: 3px solid #fff;
  transform: rotate(135deg);
}
</style>

<script>
export default {
  mounted () {
    const ifJanchor = document.getElementById("JanchorDown"); 
    ifJanchor && ifJanchor.parentNode.removeChild(ifJanchor);
    let a = document.createElement('a');
    a.id = 'JanchorDown';
    a.className = 'anchor-down';
    document.getElementsByClassName('hero')[0].append(a);
    let targetA = document.getElementById("JanchorDown");
    targetA.addEventListener('click', e => { // 添加点击事件
      this.scrollFn();
    })
  },

  methods: {
    scrollFn() {
      const windowH = document.getElementsByClassName('hero')[0].clientHeight; // 获取窗口高度
      document.documentElement.scrollTop = windowH; // 滚动条滚动到指定位置
    }
  }
}
</script>

```

#### 彩带背景
```shell
yarn add vuepress-plugin-ribbon-animation
```

config.js的plugins内下增加该代码
```js
plugins: [
  ["ribbon-animation", {
    size: 90,   // 默认数据
    opacity: 0.3,  //  透明度
    zIndex: -1,   //  层级
    opt: {
      // 色带HSL饱和度
      colorSaturation: "80%",
      // 色带HSL亮度量
      colorBrightness: "60%",
      // 带状颜色不透明度
      colorAlpha: 0.65,
      // 在HSL颜色空间中循环显示颜色的速度有多快
      colorCycleSpeed: 6,
      // 从哪一侧开始Y轴 (top|min, middle|center, bottom|max, random)
      verticalPosition: "center",
      // 到达屏幕另一侧的速度有多快
      horizontalSpeed: 200,
      // 在任何给定时间，屏幕上会保留多少条带
      ribbonCount: 2,
      // 添加笔划以及色带填充颜色
      strokeSize: 0,
      // 通过页面滚动上的因子垂直移动色带
      parallaxAmount: -0.5,
      // 随着时间的推移，为每个功能区添加动画效果
      animateSections: true
    },
    ribbonShow: false, //  点击彩带  true显示  false为不显示
    ribbonAnimationShow: true  // 滑动彩带
  }]
]
```

