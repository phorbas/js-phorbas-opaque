import {builtinModules} from 'module'
import rpi_resolve from '@rollup/plugin-node-resolve'
import rpi_jsy from 'rollup-plugin-jsy'

const sourcemap = 'inline'

const cfg_nodejs = {
  external: id => id.startsWith('node:') || builtinModules.includes(id),
  plugins: [
    rpi_resolve(),
    rpi_jsy({defines: {PLAT_NODEJS: true}}),
  ]}

const cfg_web = {
  context: 'window',
  plugins: [
    rpi_resolve(),
    rpi_jsy({defines: {PLAT_WEB: true}}),
  ]}


export default [
  { input: `./unittest.jsy`, ... cfg_nodejs,
    output: { file: './__unittest.cjs.js', format: 'cjs', sourcemap } },

  { input: `./unittest.jsy`, ... cfg_web,
    output: { file: './__unittest.iife.js', format: 'iife', name: `unittest`, sourcemap } },
]
