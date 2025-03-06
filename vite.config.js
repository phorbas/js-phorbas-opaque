import path from 'node:path'

export default ({
  appType: 'mpa',
  resolve: {
    alias: {
      "node:test": path.resolve("./test/web_bdd_mocha.js"),
    },
  },
})

