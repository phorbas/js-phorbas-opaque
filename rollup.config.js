import {builtinModules} from 'module'
import rpi_jsy from 'rollup-plugin-jsy'
import rpi_dgnotify from 'rollup-plugin-dgnotify'
import rpi_resolve from '@rollup/plugin-node-resolve'

const _rpis_ = defines => [
  rpi_jsy({defines}),
  rpi_resolve(),
  rpi_dgnotify()]

const cfg_node = {
  external: id => id.startsWith('node:') || builtinModules.includes(id),
  plugins: _rpis_({PLAT_NODEJS: true}) }

const cfg_web = {
  external: [],
  plugins: _rpis_({PLAT_WEB: true}) }

const cfg_node_codec = { ... cfg_node,
  plugins: _rpis_({PLAT_NODEJS: true, NO_CBOR: true}) }

const cfg_web_codec = { ... cfg_web,
  plugins: _rpis_({PLAT_WEB: true, NO_CBOR: true}) }

const _out_ = { sourcemap: true }


const configs = []
export default configs

add_jsy('index')
add_jsy('subtle')

if (1) {
  add_jsy('opaque_basic')
  add_jsy('opaque_basic_hmac')
  add_jsy('opaque_tahoe')
  add_jsy('opaque_ecdsa_basic')
  add_jsy('opaque_ecdsa_tahoe')
  add_jsy('opaque_ecdhe')
  add_jsy('opaque_ecdhe_basic')
  add_jsy('opaque_ecdhe_tahoe')
}


function add_jsy(src_name, opt={}) {
  const input = `code/${src_name}${opt.ext || '.jsy'}`

  configs.push({ ... cfg_node, input,
    output: { ..._out_, file: `esm/node/${src_name}.mjs`, format: 'es' }})

  configs.push({ ... cfg_web, input,
    output: { ..._out_, file: `esm/web/${src_name}.mjs`, format: 'es' }})

  configs.push({ ... cfg_node_codec, input,
    output: { ..._out_, file: `esm/node-codec/${src_name}.mjs`, format: 'es' }})

  configs.push({ ... cfg_web_codec, input,
    output: { ..._out_, file: `esm/web-codec/${src_name}.mjs`, format: 'es' }})
}
