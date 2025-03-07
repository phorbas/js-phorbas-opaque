import rpi_jsy from 'rollup-plugin-jsy'
import rpi_resolve from '@rollup/plugin-node-resolve'

const external = id => /^\w+:|^#/.test(id)

export const pkg_cfg = {
  plugins: [ rpi_jsy(), rpi_resolve() ],
  external,

  output: {
    dir: 'esm',
    format: 'es',
    sourcemap: true,
  },

  input: {
    'index': './code/index.jsy',
    'subtle': './code/subtle.jsy',
    'subtle/iso_aes_256_gcm': './code/subtle/iso_aes_256_gcm.jsy',
    'subtle/iso_ecdh': './code/subtle/iso_ecdh.jsy',
    'subtle/iso_ecdhe': './code/subtle/iso_ecdhe.jsy',
    'subtle/iso_ecdsa': './code/subtle/iso_ecdsa.jsy',
    'subtle/iso_hmac_sha2': './code/subtle/iso_hmac_sha2.jsy',
    'subtle/iso_random': './code/subtle/iso_random.jsy',
    'subtle/iso_sha2_hashes': './code/subtle/iso_sha2_hashes.jsy',
    'subtle/utils': './code/subtle/utils.jsy',

    'opaque_basic': './code/basic/opaque_basic.jsy',
    'opaque_basic_hmac': './code/basic/opaque_basic_hmac.jsy',

    'opaque_tahoe': './code/opaque_tahoe.jsy',
    'opaque_composite': './code/opaque_composite.jsy',

    'opaque_ecdsa_basic': './code/ecdsa/opaque_ecdsa_basic.jsy',
    'opaque_ecdsa_tahoe': './code/ecdsa/opaque_ecdsa_tahoe.jsy',

    'opaque_ecdhe': './code/ecdhe/opaque_ecdhe.jsy',
    'opaque_ecdhe_basic': './code/ecdhe/opaque_ecdhe_basic.jsy',
    'opaque_ecdhe_tahoe': './code/ecdhe/opaque_ecdhe_tahoe.jsy',
  },
}

export const pkg_test_cfg = {
  plugins: [ rpi_jsy(), rpi_resolve() ],
  external,

  output: {
    dir: 'esm-test',
    format: 'es',
    sourcemap: true,
  },

  input: {
    'test-subtle': './test/subtle/unittest.jsy',
    'test-core': './test/core/unittest.jsy',
    'test-ecdhe': './test/ecdhe/unittest.jsy',
    'test-ecdsa': './test/ecdsa/unittest.jsy',
  },
}

export default [
  pkg_cfg,
  pkg_test_cfg,
]

