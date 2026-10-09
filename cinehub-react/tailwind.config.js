/** @type {import('tailwindcss').Config} */
export default {
  // content: 告诉 Tailwind 去「哪些文件」里扫描 class 名
  // 只有这里列出的文件里用到的 class，Tailwind 才会生成对应的 CSS
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",   // src 目录下所有 js/ts/jsx/tsx 文件
  ],
  theme: {
    extend: {
      // 自定义颜色：之后在 JSX 里可以直接写 bg-darkBg、bg-cardBg、text-primaryRed
      colors: {
        darkBg: '#141414',      // 页面深色背景（Netflix 暗黑风）
        cardBg: '#1f1f1f',      // 卡片背景色
        primaryRed: '#e50914',  // 主强调色（Netflix 红）
      },
    },
  },
  plugins: [],
}
