import {builtinModules} from 'module'
import rpi_jsy from 'rollup-plugin-jsy'
import rpi_dgnotify from 'rollup-plugin-dgnotify'
import rpi_resolve from '@rollup/plugin-node-resolve'

const cfg_node = {
  external: id => builtinModules.includes(id),
  plugins: [
    rpi_jsy({defines: {PLAT_NODEJS: true}}),
    rpi_resolve(),
    rpi_dgnotify(),
  ]}

const cfg_web = {
  external: [],
  plugins: [
    rpi_jsy({defines: {PLAT_WEB: true}}),
    rpi_resolve(),
    rpi_dgnotify(),
  ]}

const _out_ = { sourcemap: true }


const configs = []
export default configs

add_jsy('index')
add_jsy('subtle')


function add_jsy(src_name, opt={}) {
  const input = `code/${src_name}${opt.ext || '.jsy'}`

  configs.push({ ... cfg_node, input,
    output: { ..._out_, file: `esm/node/${src_name}.mjs`, format: 'es' }})

  configs.push({ ... cfg_web, input,
    output: { ..._out_, file: `esm/web/${src_name}.mjs`, format: 'es' }})
}
