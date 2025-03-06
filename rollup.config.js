import rpi_jsy from 'rollup-plugin-jsy'
import rpi_dgnotify from 'rollup-plugin-dgnotify'
import rpi_resolve from '@rollup/plugin-node-resolve'

const external = id => /^\w+:|^#/.test(id)

const _rpis_ = (defines, ...args) => [
  rpi_jsy({defines}),
  rpi_resolve(),
  ...args,
  rpi_dgnotify()]

export const pkg_cfg = {
  plugins: _rpis_({NO_CBOR:true}),
  external,

  input: [
    './code/index.jsy',
    './code/subtle.jsy',

    './code/basic/opaque_basic.jsy',
    './code/basic/opaque_basic_hmac.jsy',

    './code/opaque_tahoe.jsy',
    './code/opaque_composite.jsy',

    './code/ecdsa/opaque_ecdsa_basic.jsy',
    /*
    './code/ecdsa/opaque_ecdsa_tahoe.jsy',
    */

    './code/ecdhe/opaque_ecdhe.jsy',
    './code/ecdhe/opaque_ecdhe_basic.jsy',
    './code/ecdhe/opaque_ecdhe_tahoe.jsy',
  ],
  output: {
    dir: 'esm',
    format: 'es',
    sourcemap: true,
    chunkFileNames: '[name].js'
  }
}

export const pkg_test_cfg = {
  plugins: _rpis_({NO_CBOR:true}),
  external,

  input: [
    './test/unittest.jsy',
  ],
  output: {
    dir: 'esm-test',
    format: 'es',
    sourcemap: true,
  }
}

export default [
  pkg_cfg,
  pkg_test_cfg,
]

