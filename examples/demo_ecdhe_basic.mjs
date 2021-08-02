import { opaque_ecdhe_basic } from '@phorbas/opaque'

// run demo with following function
_run_demo(demo_opaque_ecdhe_basic,
  'Hello from @phorbas/opaque demo_opaque_ecdhe_basic')

async function demo_opaque_ecdhe_basic(msg) {
  console.log('')
  console.log('msg: %o', msg)

  const alice = opaque_ecdhe_basic()
  console.log('alice', alice)

  const bob = opaque_ecdhe_basic()
  console.log('bob', bob)

  const {k21ref, enc_data} = await _as_alice(alice, bob.ecdh, msg)

  const {rt_utf8} = await _as_bob(bob, alice.ecdh, {k21ref, enc_data})

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

  const enc_data = await alice_okey.encode_utf8(msg)
  console.log('alice encoded:', enc_data)

  const k21ref = alice_okey.k21pair()
  console.log('alice k21ref:', k21ref)

  return {k21ref, enc_data}
}

async function _as_bob(bob, alice_public_ecdh, {k21ref, enc_data}) {
  const bob_keyed_opaque = await bob.with_ecdh(alice_public_ecdh)
  console.log('bob_keyed_opaque:', bob_keyed_opaque)

  const bob_okey = await bob_keyed_opaque.from_k21pair(k21ref)
  console.log('bob ciphered?:', bob.ciphered, bob_keyed_opaque.ciphered, bob_okey.ciphered)
  console.log('bob okey:', bob_okey)

  const rt_utf8 = await bob_okey.decode_utf8(enc_data)
  console.log('bob round-trip: %o', rt_utf8)

  return {rt_utf8}
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
