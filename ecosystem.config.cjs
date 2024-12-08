module.exports = {
  name: "kami-bot",
  script: "src/index.ts",
  interpreter: "bun",
  env: {
    PATH: `${process.env.HOME}/.bun/bin:${process.env.PATH}`,
    NODE_ENV: 'production',
  },
};