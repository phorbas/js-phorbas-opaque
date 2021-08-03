import { opaque_basic } from '@phorbas/opaque'

async function example_basic_put(msg) {
  const okey = await opaque_basic.from_content(msg)
  return {
    cas_addr: okey.k21pair(),
    rec: await okey.encode_utf8(msg), }
}

async function example_basic_get({cas_addr, rec}) {
  const okey = await opaque_basic.from_k21pair(cas_addr)
  return await okey.decode_utf8(rec)
}

example_basic_put('Hello @phorbas/opaque')
  .then(info => { console.log(info); return info })
  .then(example_basic_get)
  .then(out => { console.log('Round-trip: %s', out) })
