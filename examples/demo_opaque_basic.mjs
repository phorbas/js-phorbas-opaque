import {cbor_encode, cbor_decode} from 'cbor-codec'
import { opaque_basic, init_opaque_shared_codec } from '@phorbas/opaque/esm/node/index.mjs'

// init @phorbas/opaque to use cbor-codec
init_opaque_shared_codec({ encode: cbor_encode, decode: cbor_decode })

// run demo with following function
_run_demo(demo_opaque_basic)

async function demo_opaque_basic() {
  const msg = 'Hello from @phorbas/opaque demo_opaque_basic'

  console.log('')
  console.log('msg: %o', msg)

  const okey = await opaque_basic.from_content(msg)
  console.log('okey:', okey)

  const rec = await okey.encode_utf8(msg)
  console.log('encoded:', rec)

  const rt_utf8 = await okey.decode_utf8(rec)
  console.log('round-trip: %o', rt_utf8)
  console.log('')
}


async function _run_demo(demo_main) {
  // use timer to keep NodeJS from exiting
  let tid = setTimeout(Boolean, 15000)
  try {
    await demo_main()
  } finally {
    clearTimeout(tid)
  }
}
