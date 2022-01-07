import { opaque_compose, opaque_tahoe } from '@phorbas/opaque'

// run demo with following function
_run_demo(demo_opaque_compose_hmac,
  'Hello from @phorbas/opaque demo_opaque_compose')

async function demo_opaque_compose_hmac(msg) {
  console.log('')
  console.log('msg: %o', msg)
  const my_opaque = opaque_compose(
    opaque_tahoe,
    opaque_tahoe.with_hmac('other hmac bits'),)

  const okey = await my_opaque.from_content(msg)
  console.log('ciphered?:', my_opaque.ciphered, okey.ciphered)
  console.log('okey:', okey)

  const enc_data = await okey.encipher_utf8(msg)
  // or use basic api alias: await okey.encode_utf8(msg)
  console.log('encoded:', enc_data)

  const rt_utf8 = await okey.decipher_utf8(enc_data)
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
