// useLocalStorage：自定义 Hook，把 useState 和 localStorage 结合
// 作用：数据存在「状态」里（界面自动更新），同时自动同步到 localStorage（刷新/关页面不丢）

import { useState, useEffect } from 'react';

export function useLocalStorage(key, initialValue) {
  // 1. 初始化状态：优先从 localStorage 读取旧数据
  //    useState(() => {...}) 这种「传函数」的写法叫「惰性初始化」，
  //    函数只在组件第一次渲染时执行一次，之后不再跑（避免每次都读 localStorage）
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      // 读到数据就 JSON.parse 转回 JS 对象；读不到就用 initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`读取 localStorage 中的 key "${key}" 失败:`, error);
      return initialValue;   // 解析失败也退回默认值
    }
  });

  // 2. 监听 storedValue 变化，自动写回 localStorage
  //    依赖数组 [key, storedValue]：这两个值一变，就重新执行一次
  useEffect(() => {
    try {
      // localStorage 只能存字符串，所以要用 JSON.stringify 转一下再存
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`保存到 localStorage 中的 key "${key}" 失败:`, error);
    }
  }, [key, storedValue]);

  // 返回和 useState 一样的 [值, 改值函数]，所以用起来和 useState 一模一样
  return [storedValue, setStoredValue];
}
