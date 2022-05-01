#!/usr/bin/env node

const { program } = require('commander')

program.option('-p, --port <port>', 'Proxy port', 0)
program.option('-h, --host <host>', 'Proxy host', '0.0.0.0')
program.option('--path <path>', 'Base path', '/proxy')
program
  .argument('<target>', 'Target endpoint, include http:// or https://')
  .program.parse(process.argv)
const opts = program.opts()
const args = program.args

if (
  Math.trunc(opts.port) !== Number(opts.port) ||
  Math.trunc(opts.port) < 0 ||
  Math.trunc(opts.port) > 65535
) {
  console.error('Invalid port number: ' + opts.port)
  process.exit(1)
}

if (!/https?:\/\/.+?/i.test(args[0])) {
  console.error('Invalid target endpoint: ' + args[0])
  process.exit(1)
}

const app = require('express')()
app.use(require('morgan')('dev'))

const rootPath = `/${opts.path}/`.replace(/\/\//g, '/')
app.use(
  rootPath,
  require('http-proxy-middleware').createProxyMiddleware({
    target: args[0],
    changeOrigin: true,
    pathRewrite: {
      ['^' + rootPath]: ''
    }
  })
)

// Start the Proxy
app.listen(opts.port, opts.host, function (a) {
  const { address, port } = this.address()
  console.log(`Proxy listening at http://${address}:${port}${rootPath}`)
})
