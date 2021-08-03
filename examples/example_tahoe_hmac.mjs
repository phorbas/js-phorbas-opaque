import { opaque_tahoe } from '@phorbas/opaque'

const my_keyed_tahoe = opaque_tahoe
  .with_hmac('example_tahoe_hmac')

async function tahoe_put(msg) {
  const okey = await my_keyed_tahoe.from_content(msg)
  return {
    cas_addr: okey.k21pair(),
    enc_data: await okey.encipher_utf8(msg), }
}

async function tahoe_get({cas_addr, enc_data}) {
  const okey = await my_keyed_tahoe.from_k21pair(cas_addr)
  return await okey.decipher_utf8(enc_data)
}

tahoe_put('Hello @phorbas/opaque')
  .then(info => { console.log(info); return info })
  .then(tahoe_get)
  .then(out => { console.log('Round-trip: %s', out) })

