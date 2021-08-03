import { opaque_ecdhe_tahoe } from '@phorbas/opaque'

function example_opaque_ecdhe_tahoe() {
  const alice = opaque_ecdhe_tahoe()
  const bob = opaque_ecdhe_tahoe()
  return {
    alice_send: async msg => await _as_alice(alice, bob.ecdh, msg),
    bob_recv: async info => await _as_bob(bob, alice.ecdh, info),
  }
}

async function _as_alice(alice, bob_public_ecdh, msg) {
  const alice_keyed_opaque = await alice.with_ecdh(bob_public_ecdh)

  const alice_okey = await alice_keyed_opaque.from_content(msg)

  return {
    cas_addr: alice_okey.k21pair(),
    enc_data: await alice_okey.encipher_utf8(msg), }
}

async function _as_bob(bob, alice_public_ecdh, {cas_addr, enc_data}) {
  const bob_keyed_opaque = await bob.with_ecdh(alice_public_ecdh)

  const bob_okey = await bob_keyed_opaque.from_k21pair(cas_addr)

  return await bob_okey.decipher_utf8(enc_data)
}


let {alice_send, bob_recv} = example_opaque_ecdhe_tahoe()

alice_send('Hello @phorbas/opaque')
  .then(info => { console.log(info); return info })
  .then(bob_recv)
  .then(out => { console.log('Round-trip: %s', out) })

