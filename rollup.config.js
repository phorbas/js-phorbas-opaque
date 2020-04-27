import rpi_jsy from 'rollup-plugin-jsy'
import rpi_dgnotify from 'rollup-plugin-dgnotify'
import rpi_resolve from '@rollup/plugin-node-resolve'

const sourcemap = true

const cfg_node = {
  external: ['crypto', 'util'],
  plugins: [
    rpi_jsy({defines: {PLAT_NODEJS: true}}),
    rpi_resolve({preferBuiltins: true}),
    rpi_dgnotify(),
  ]}

const cfg_web = {
  external: [],
  plugins: [
    rpi_jsy({defines: {PLAT_WEB: true}}),
    rpi_resolve({preferBuiltins: true}),
    rpi_dgnotify(),
  ]}


const configs = []
export default configs

add_jsy('index')
add_jsy('subtle')


function add_jsy(src_name) {
  configs.push({ ... cfg_node,
    input: `code/${src_name}.jsy`,
    output: { file: `esm/node/${src_name}.mjs`, format: 'es', sourcemap }})

  configs.push({ ... cfg_web,
    input: `code/${src_name}.jsy`,
    output: { file: `esm/web/${src_name}.mjs`, format: 'es', sourcemap }})
}
