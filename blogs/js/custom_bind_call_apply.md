---
title: 实现call、apply、bind方法
date: 2022-04-18
tags:
 - js
categories:
 - js
---

```js
const name = '全局A'
const obj = {
  name: '小A'
}

function Fn() {
  console.log(this.name, arguments)
}

// call  fn.call(obj, ...args)
Function.prototype.myCall = function (context) {
  context = context || window
  context.fn = this
  const args = Array.from(arguments).slice(1)
  const res = args.length ? context.fn(...args) : context.fn()
  delete context.fn
  return res
}
Fn.myCall(obj, '小公狗', '小公猫')


// apply  fn.apply(obj, [...args])
Function.prototype.myApply = function (context) {
  context = context || window
  context.fn = this
  const res = arguments.length > 1 ? context.fn(arguments[1]) : context.fn()
  delete context.fn
  return res
}
Fn.myApply(obj, ['小母狗', '小母猫'])


// bind   fn.bind(obj, ...args)(...args)
Function.prototype.myBind = function (context) {
  context = JSON.parse(JSON.stringify(context)) || window
  context.fn = this
  const args = [...arguments].slice(1)
  return function () {
    const allArgs = args.concat(...arguments)
    return allArgs.length ? context.fn(...allArgs) : context.fn()
  }
}

Function.prototype.myBind2 = function (context) {
  const _this = this
  const args = [...arguments].slice(1)
  return function () {
    const allArgs = args.concat(...arguments)
    return allArgs.length ? _this.call(context, allArgs) : _this.call(context)
  }
}

```
