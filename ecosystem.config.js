// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "moongate",
      script: ".output/server/index.mjs",
      env: {
        NUXT_PUBLIC_SITE_URL: "https://www.moongate.top", // 必须在这里设置
        NODE_ENV: "production",
      },
    },
  ],
};
