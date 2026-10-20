// useLocalStorage：自定义 Hook，把 useState 和 localStorage 结合
import { useState, useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';

// <T> 是「泛型」：这个 Hook 可以存任何类型的数据（Movie[]、string、boolean...）
// 调用方决定 T 是什么，比如 useLocalStorage<Movie[]>('key', [])
export function useLocalStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  // 1. 初始化状态：优先从 localStorage 读取旧数据
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.error(`读取 localStorage 中的 key "${key}" 失败:`, error);
      return initialValue;
    }
  });

  // 2. 监听 storedValue 变化，自动写回 localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`保存到 localStorage 中的 key "${key}" 失败:`, error);
    }
  }, [key, storedValue]);

  // 返回和 useState 一样的 [值, 改值函数]
  return [storedValue, setStoredValue];
}
