import { opaque_ecdhe_basic } from '@phorbas/opaque'

await demo_opaque_ecdhe_basic(
  'Hello from @phorbas/opaque demo_opaque_ecdhe_basic')

async function demo_opaque_ecdhe_basic(msg) {
  console.log('')
  console.log('msg: %o', msg)

  const alice = opaque_ecdhe_basic()
  console.log('alice', alice)

  const bob = opaque_ecdhe_basic()
  console.log('bob', bob)

  const {alice_hk21} = await _as_alice(alice, bob.ecdh, msg)

  await _as_bob(bob, alice.ecdh, {alice_hk21})

  console.log('')
}

async function _as_alice(alice, bob_public_ecdh, msg) {
  const alice_keyed_opaque = await alice.with_ecdh(bob_public_ecdh)
  console.log('alice_keyed_opaque:', alice_keyed_opaque)

  const alice_okey = await alice_keyed_opaque.from_content(msg)
  console.log('alice ciphered?:', alice.ciphered, alice_keyed_opaque.ciphered, alice_okey.ciphered)
  console.log('alice okey:', alice_okey)

  const alice_hk21 = alice_okey.hk21()
  console.log('alice hk21:', alice_hk21)
  return {alice_hk21}
}

async function _as_bob(bob, alice_public_ecdh, {alice_hk21}) {
  const bob_keyed_opaque = await bob.with_ecdh(alice_public_ecdh)
  console.log('bob_keyed_opaque:', bob_keyed_opaque)

  const bob_okey = await bob_keyed_opaque.from_hk21(alice_hk21)
  console.log('bob ciphered?:', bob.ciphered, bob_keyed_opaque.ciphered, bob_okey.ciphered)
  console.log('bob okey:', bob_okey)

  const bob_hk21 = bob_okey.hk21()
  console.log('bob hk21:', bob_hk21)
  return {bob_hk21}
}
