import { opaque_basic_hmac } from '@phorbas/opaque'

await demo_opaque_basic_hmac(
  'Hello from @phorbas/opaque demo_opaque_basic_hmac')

async function demo_opaque_basic_hmac(msg) {
  console.log('msg: %o', msg)

  const keyed_opaque = opaque_basic_hmac.with_hmac('some hmac bits')
  console.log('keyed_opaque:', keyed_opaque)

  const okey = await keyed_opaque.from_content(msg)
  console.log('ciphered?:', opaque_basic_hmac.ciphered, keyed_opaque.ciphered, okey.ciphered)
  console.log('okey:', okey)
}
