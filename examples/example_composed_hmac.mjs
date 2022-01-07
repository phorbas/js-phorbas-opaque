import { opaque_compose, opaque_tahoe } from '@phorbas/opaque'

const my_opaque = opaque_compose(
    opaque_tahoe.with_hmac('first hmac key'),
    opaque_tahoe.with_hmac('second hmac key'),
  )

async function example_hmac_put(msg) {
  const okey = await my_opaque.from_content(msg)
  return {
    okey,
    cas_addr: okey.k21pair(),
    rec: await okey.encipher_utf8(msg), }
}

async function example_hmac_get({cas_addr, rec}) {
  const okey = await my_opaque.from_k21pair(cas_addr)
  return await okey.decipher_utf8(rec)
}

example_hmac_put('Hello @phorbas/opaque')
  .then(info => { console.log(info); return info })
  .then(example_hmac_get)
  .then(out => { console.log('Round-trip: %s', out) })

