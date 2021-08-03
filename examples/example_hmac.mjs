import { opaque_basic_hmac } from '@phorbas/opaque'

const my_keyed_opaque = opaque_basic_hmac
  .with_hmac('example_basic_hmac')

async function example_hmac_put(msg) {
  const okey = await my_keyed_opaque.from_content(msg)
  return {
    cas_addr: okey.k21pair(),
    rec: await okey.encode_utf8(msg), }
}

async function example_hmac_get({cas_addr, rec}) {
  const okey = await my_keyed_opaque.from_k21pair(cas_addr)
  return await okey.decode_utf8(rec)
}

example_hmac_put('Hello @phorbas/opaque')
  .then(info => { console.log(info); return info })
  .then(example_hmac_get)
  .then(out => { console.log('Round-trip: %s', out) })

