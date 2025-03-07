import { opaque_ecdhe_tahoe, u8_to_utf8 } from '@phorbas/opaque'

await demo_opaque_ecdhe_tahoe(
  'Hello from @phorbas/opaque demo_opaque_ecdhe_tahoe')

async function demo_opaque_ecdhe_tahoe(msg) {
  console.log('')
  console.log('msg: %o', msg)

  const alice = opaque_ecdhe_tahoe()
  console.log('alice', alice)

  const bob = opaque_ecdhe_tahoe()
  console.log('bob', bob)

  const {alice_k21ref, enc_data} = await _as_alice(alice, bob.ecdh, msg)

  const {rt_utf8} = await _as_bob(bob, alice.ecdh, {alice_k21ref, enc_data})

  console.log('Round-trip match:', rt_utf8 === msg)
  if (rt_utf8 !== msg)
    throw new Error('Failed to round-trip')

  console.log('')
}

async function _as_alice(alice, bob_public_ecdh, msg) {
  const alice_keyed_opaque = await alice.with_ecdh(bob_public_ecdh)
  console.log('alice_keyed_opaque:', alice_keyed_opaque)

  const alice_okey = await alice_keyed_opaque.from_content(msg)
  console.log('alice ciphered?:', alice.ciphered, alice_keyed_opaque.ciphered, alice_okey.ciphered)
  console.log('alice okey:', alice_okey)

  const enc_data = await alice_okey.encipher(msg)
  console.log('alice encrypted:', enc_data)

  const alice_k21ref = alice_okey.hk21()
  console.log('alice k21ref:', alice_k21ref)

  return {alice_k21ref, enc_data}
}

async function _as_bob(bob, alice_public_ecdh, {alice_k21ref, enc_data}) {
  const bob_keyed_opaque = await bob.with_ecdh(alice_public_ecdh)
  console.log('bob_keyed_opaque:', bob_keyed_opaque)

  const bob_okey = await bob_keyed_opaque.from_hk21(alice_k21ref)
  console.log('bob ciphered?:', bob.ciphered, bob_keyed_opaque.ciphered, bob_okey.ciphered)
  console.log('bob okey:', bob_okey)

  const rt_utf8 = u8_to_utf8( await bob_okey.decipher(enc_data) )
  console.log('bob round-trip: %o', rt_utf8)

  return {rt_utf8}
}
