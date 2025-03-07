import { opaque_tahoe, u8_to_utf8 } from '@phorbas/opaque'

// run demo with following function
await demo_opaque_tahoe(
  'Hello from @phorbas/opaque demo_opaque_tahoe')

async function demo_opaque_tahoe(msg) {
  console.log('msg: %o', msg)

  const keyed_opaque = opaque_tahoe.with_hmac('some hmac bits')
  console.log('keyed_opaque:', keyed_opaque)

  const okey = await keyed_opaque.from_content(msg)
  console.log('ciphered?:', opaque_tahoe.ciphered, keyed_opaque.ciphered, okey.ciphered)
  console.log('okey:', okey)

  const enc_data = await okey.encipher(msg)
  console.log('enciphered:', enc_data)

  const rt_utf8 = u8_to_utf8( await okey.decipher(enc_data) )
  console.log('round-trip[%o]: %o', rt_utf8==msg, rt_utf8)
  console.log('')
}
