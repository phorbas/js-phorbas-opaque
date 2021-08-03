import { opaque_ecdsa_tahoe } from '@phorbas/opaque'

async function ecdsa_put(msg) {
  const my_ecdsa_session = opaque_ecdsa_tahoe.as_session()

  const okey = await my_ecdsa_session.from_content(msg)

  return {
    cas_addr: okey.k21pair(),
    enc_data: await okey.encipher_utf8(msg), }
}

async function ecdsa_get({cas_addr, enc_data}) {
  const okey = await opaque_ecdsa_tahoe.from_k21pair(cas_addr)
  return await okey.decipher_utf8(enc_data)
}

ecdsa_put('Hello @phorbas/opaque')
  .then(info => { console.log(info); return info })
  .then(ecdsa_get)
  .then(out => { console.log('Round-trip: %s', out) })
