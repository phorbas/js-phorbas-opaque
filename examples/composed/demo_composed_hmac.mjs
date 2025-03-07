import { opaque_compose, opaque_tahoe, u8_to_utf8 } from '@phorbas/opaque'

await demo_opaque_compose_hmac(
  'Hello from @phorbas/opaque demo_opaque_compose')

async function demo_opaque_compose_hmac(msg) {
  console.log('msg: %o', msg)

  const my_opaque = opaque_compose( opaque_tahoe,
    opaque_tahoe.with_hmac('other hmac bits'),)

  const okey = await my_opaque.from_content(msg)
  console.log('ciphered?:', my_opaque.ciphered, okey.ciphered)
  console.log('okey:', okey)

  const enc_data = await okey.encipher(msg)
  console.log('enciphered:', enc_data)

  const rt_utf8 = u8_to_utf8( await okey.decipher(enc_data) )
  console.log('round-trip[%o]: %o', rt_utf8==msg, rt_utf8)
  console.log('')
}
