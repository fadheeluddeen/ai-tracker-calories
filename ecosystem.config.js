module.exports = {
  apps: [
    {
      name: 'plate-log',
      script: './server/index.js',
      cwd: __dirname,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
