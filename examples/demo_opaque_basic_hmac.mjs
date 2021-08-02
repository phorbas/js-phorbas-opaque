import { opaque_basic_hmac } from '@phorbas/opaque'

// run demo with following function
_run_demo(demo_opaque_basic_hmac,
  'Hello from @phorbas/opaque demo_opaque_basic_hmac')

async function demo_opaque_basic_hmac(msg) {
  console.log('')
  console.log('msg: %o', msg)

  const keyed_opaque = opaque_basic_hmac.with_hmac('some hmac bits')
  console.log('keyed_opaque:', keyed_opaque)

  const okey = await keyed_opaque.from_content(msg)
  console.log('ciphered?:', opaque_basic_hmac.ciphered, keyed_opaque.ciphered, okey.ciphered)
  console.log('okey:', okey)

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
