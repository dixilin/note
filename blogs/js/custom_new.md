---
title: 实现new方法
date: 2022-04-18
tags:
 - js
categories:
 - js
---

```js
function lNew(Fn, ...args) {
  const obj = {}
  // 新对象隐式原型__proto__链接到构造函数显式原型prototype上，以下方法两个都可
  Object.setPrototypeOf(obj, Fn.prototype)
  // obj.__proto__ = Fn.prototype

  const res = Fn.apply(obj, args)
  return res instanceof Object ? res : obj
}

function Person(name, age) {
  this.name = name
  this.age = age
}

const p1 = lNew(Person, '小A', 18)
```