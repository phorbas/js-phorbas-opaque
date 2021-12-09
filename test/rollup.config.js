import {builtinModules} from 'module'
import rpi_resolve from '@rollup/plugin-node-resolve'
import rpi_jsy from 'rollup-plugin-jsy'

const sourcemap = 'inline'

const cfg_node = {
  external: id => /^\w+:/.test(id) || builtinModules.includes(id),
  plugins: [
    rpi_resolve(),
    rpi_jsy({defines: {PLAT_NODEJS: true}}),
  ]}

const cfg_web = {
  external: id => /\w+:/.test(id),
  context: 'window',
  plugins: [
    rpi_resolve(),
    rpi_jsy({defines: {PLAT_WEB: true}}),
  ]}


export default [
  { ... cfg_node, input: {'unittest': `./unittest.jsy`},
    preserveEntrySignatures: false,
    output: { dir: './cjs/', format: 'cjs', sourcemap: true }},

  { ... cfg_web, input: {'unittest': `./unittest.jsy`},
    output: { dir: './esm/', format: 'esm', sourcemap: true }},
]
