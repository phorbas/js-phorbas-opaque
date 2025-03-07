import { opaque_basic } from '@phorbas/opaque'

await demo_opaque_basic(
  'Hello from @phorbas/opaque demo_opaque_basic')

async function demo_opaque_basic(msg) {
  console.log('msg: %o', msg)

  const okey = await opaque_basic.from_content(msg)
  console.log('ciphered?:', opaque_basic.ciphered, okey.ciphered)
  console.log('okey:', okey)
}
