/* eslint-disable @typescript-eslint/no-var-requires */
const withLess = require('@zeit/next-less')
const path = require('path')
const { readdirSync } = require('fs')

require('dotenv').config()

const dirs = readdirSync(__dirname, { withFileTypes: true })
  .filter(
    dirent =>
      dirent.isDirectory() &&
      !dirent.name.startsWith('.') &&
      dirent.name !== 'node_modules'
  )
  .map(dirent => dirent.name)

module.exports = withLess({
  cssModules: true,
  cssLoaderOptions: {
    camelCase: true,
  },
  webpack(config) {
    dirs.forEach(dir => {
      // eslint-disable-next-line no-param-reassign
      config.resolve.alias[dir] = path.join(__dirname, dir)
    })
    return config
  },
})
