import { opaque_ecdsa_tahoe, u8_to_utf8 } from '@phorbas/opaque'

await demo_opaque_ecdsa_tahoe(
  'Hello from @phorbas/opaque demo_opaque_ecdsa_tahoe')

async function demo_opaque_ecdsa_tahoe(msg) {
  console.log('')
  console.log('msg: %o', msg)

  const okey = await opaque_ecdsa_tahoe.from_content(msg)
  console.log('ciphered?:', opaque_ecdsa_tahoe.ciphered, okey.ciphered)
  console.log('okey:', okey)

  const enc_data = await okey.encipher(msg)
  console.log('enciphered:', enc_data)

  const rt_utf8 = u8_to_utf8( await okey.decipher(enc_data) )
  console.log('round-trip[%o]: %o', rt_utf8==msg, rt_utf8)
  console.log('')
}
