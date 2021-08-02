import {cbor_encode, cbor_decode} from 'cbor-codec'
import { opaque_ecdsa_basic, init_opaque_shared_codec } from '@phorbas/opaque/esm/node/index.mjs'

// init @phorbas/opaque to use cbor-codec
init_opaque_shared_codec({ encode: cbor_encode, decode: cbor_decode })

// run demo with following function
_run_demo(demo_opaque_ecdsa_basic,
  'Hello from @phorbas/opaque demo_opaque_ecdsa_basic')

async function demo_opaque_ecdsa_basic(msg) {
  console.log('')
  console.log('msg: %o', msg)

  const okey = await opaque_ecdsa_basic.from_content(msg)
  console.log('ciphered?:', opaque_ecdsa_basic.ciphered, okey.ciphered)
  console.log('okey:', okey, okey.ciphered)

  const rec = await okey.encode_utf8(msg)
  console.log('encoded:', rec)

  const rt_utf8 = await okey.decode_utf8(rec)
  console.log('round-trip: %o', rt_utf8)
  console.log('')
}


async function _run_demo(demo_main, ...args) {
  // use timer to keep NodeJS from exiting
  let tid = setTimeout(Boolean, 15000)
  try {
    await demo_main(...args)
  } finally {
    clearTimeout(tid)
  }
}
