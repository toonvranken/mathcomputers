/** PM2 process file — op de server: pm2 start ecosystem.config.cjs */
module.exports = {
  apps: [
    {
      name: "mathcomputers",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      cwd: __dirname,
      instances: 1, // 1 instance i.v.m. in-memory rate limit + SQLite
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      max_memory_restart: "512M",
      time: true,
    },
  ],
};
