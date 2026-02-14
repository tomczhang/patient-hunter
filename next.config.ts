import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** 让 LangChain 相关包走 Node.js 原生 require，不经过 Turbopack 打包
   *  解决 initChatModel 内部动态 import(`@langchain/${provider}`) 报错 */
  serverExternalPackages: [
    "langchain",
    "@langchain/core",
    "@langchain/openai",
  ],
};

export default nextConfig;
