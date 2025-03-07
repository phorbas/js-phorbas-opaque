import { opaque_ecdsa_basic } from '@phorbas/opaque'

await demo_opaque_ecdsa_basic(
  'Hello from @phorbas/opaque demo_opaque_ecdsa_basic')

async function demo_opaque_ecdsa_basic(msg) {
  console.log('')
  console.log('msg: %o', msg)

  const okey = await opaque_ecdsa_basic.from_content(msg)
  console.log('ciphered?:', opaque_ecdsa_basic.ciphered, okey.ciphered)
  console.log('okey:', okey)
}
