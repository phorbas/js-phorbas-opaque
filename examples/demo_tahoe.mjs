import {cbor_encode, cbor_decode} from 'cbor-codec'
import { opaque_tahoe, init_opaque_shared_codec } from '@phorbas/opaque/esm/node/index.mjs'

// init @phorbas/opaque to use cbor-codec
init_opaque_shared_codec({ encode: cbor_encode, decode: cbor_decode })

// run demo with following function
_run_demo(demo_opaque_tahoe,
  'Hello from @phorbas/opaque demo_opaque_tahoe')

async function demo_opaque_tahoe(msg) {
  console.log('')
  console.log('msg: %o', msg)

  const okey = await opaque_tahoe.from_content(msg)
  console.log('ciphered?:', opaque_tahoe.ciphered, okey.ciphered)
  console.log('okey:', okey)

  const rec = await okey.encipher_utf8(msg)
  // or use basic api alias: await okey.encode_utf8(msg)
  console.log('encoded:', rec)

  const rt_utf8 = await okey.decipher_utf8(rec)
  // or use basic api alias: await okey.decode_utf8(msg)
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
