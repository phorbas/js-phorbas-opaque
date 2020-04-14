import rpi_jsy from 'rollup-plugin-jsy'
import rpi_resolve from '@rollup/plugin-node-resolve'

const sourcemap = true

const cfg_node = {
  external: ['crypto', 'util'],
  plugins: [
    rpi_jsy({defines: {PLAT_NODEJS: true}}),
    rpi_resolve({preferBuiltins: true}),
  ]}

const cfg_web = {
  external: [],
  plugins: [
    rpi_jsy({defines: {PLAT_WEB: true}}),
    rpi_resolve({preferBuiltins: true}),
  ]}


const configs = []
export default configs

add_jsy('index')
add_jsy('subtle')
add_jsy('opaque_tahoe')
add_jsy('opaque_phorbas')
add_jsy('tahoe_core')
add_jsy('tahoe_hmac')
add_jsy('phorbas_core')


function add_jsy(src_name) {
  configs.push({ ... cfg_node,
    input: `code/${src_name}.jsy`,
    output: { file: `esm/node/${src_name}.mjs`, format: 'es', sourcemap }})

  configs.push({ ... cfg_web,
    input: `code/${src_name}.jsy`,
    output: { file: `esm/web/${src_name}.mjs`, format: 'es', sourcemap }})
}
