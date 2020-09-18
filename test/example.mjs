import {
  opaque_basic,
  opaque_tahoe,
  opaque_ecdsa_basic,
  opaque_ecdsa_tahoe,
  opaque_ecdhe_basic,
  opaque_ecdhe_tahoe,
  init_opaque_shared_codec,
} from '@phorbas/opaque/esm/node/index.mjs'

import {cbor_encode, cbor_decode} from 'cbor-codec'
init_opaque_shared_codec({ encode: cbor_encode, decode: cbor_decode })


async function demo(msg, opaque_name, opaque) {
  console.log('')
  console.log('Demo for %o', opaque_name)
  console.log('msg: %o', msg)

  const okey = await opaque.from_content(msg)
  console.log('okey:', okey)

  const rec = await okey.encode_utf8(msg)
  console.log('encoded:', rec)

  const rt_utf8 = await okey.decode_utf8(rec)
  console.log('round-trip: %o', rt_utf8)
  console.log('')
}


async function main_plaintext(msg) {
  await demo(msg, 'opaque_basic', opaque_basic)

  await demo(msg, 'opaque_ecdsa_basic', opaque_ecdsa_basic)

  {
    let alice = opaque_ecdhe_basic()
    let bob = opaque_ecdhe_basic()

    let opaque = await bob.with_ecdh(alice.ecdh)
    await demo(msg, 'opaque_ecdhe_basic', opaque)
  }
}


async function main_tahoe(msg) {
  await demo(msg, 'opaque_tahoe', opaque_tahoe)

  await demo(msg, 'opaque_ecdsa_tahoe', opaque_ecdsa_tahoe)

  {
    let alice = opaque_ecdhe_tahoe()
    let bob = opaque_ecdhe_tahoe()

    let opaque = await bob.with_ecdh(alice.ecdh)
    await demo(msg, 'opaque_ecdhe_tahoe', opaque)
  }
}


async function main(msg) {
  let tid = setTimeout(() => console.log('timeout!'), 15000)

  await main_tahoe(msg)
  await main_plaintext(msg)

  clearTimeout(tid)
}

main('Hello PHORBAS Opaque!')


