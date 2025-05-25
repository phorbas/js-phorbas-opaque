import {describe, it} from 'node:test'
import {assert, expect} from 'chai'

import {opaque_tahoe} from '@phorbas/opaque'

import {kbc_api, kbc_js_map} from '@phorbas/store'
import {cbor_encode, cbor_decode} from 'cbor-codec'

import {poem_lines} from './poem.js'


describe('poem with opaque and phorbas-store', () => {
  it('with k1ref', async () => {
    const stg = await kbc_api(kbc_js_map())
    const [_, k1ref] = await store_text_lines(poem_lines, stg, opaque_tahoe)

    const rt_lines = load_text_lines(k1ref, stg, opaque_tahoe)

    let i=0
    for await (let ln of rt_lines)
      assert.equal(ln, poem_lines[i++])
  })

  it('with k21pair', async () => {
    const stg = await kbc_api(kbc_js_map())
    const hk21 = await store_text_lines(poem_lines, stg, opaque_tahoe)

    const rt_lines = await load_text_lines(hk21[1], stg, opaque_tahoe)

    let i=0
    for await (let ln of rt_lines)
      assert.equal(ln, poem_lines[i++])
  })
})



async function store_text_lines(text_lines, stg, opaque) {
  const refs = []

  for await (let _ of Array.from(text_lines, async (ln, idx) => {
    let k = await opaque.from_content(ln)
    refs[idx] = k.hk21()
    await stg.kbc_store(k.hk2loc, k.encipher(k.buf))
  })) ; // await all transactions


  {
    let json_refs = JSON.stringify(refs)
    let k_root = await opaque.from_content(json_refs)
    let enc_refs = k_root.encipher(json_refs)
    let err = await stg.kbc_store(k_root.hk2loc, enc_refs)
    return k_root.hk21()
  }
}


async function * load_text_lines(root_ref, stg, opaque) {
  {
    const k_root = await opaque.from_hk21(root_ref)

    let ab_buf = await stg.kbc_fetch(k_root.hk2loc)
    if (! ab_buf) return

    let ab_refs = k_root.decipher(ab_buf).then(ab => new Blob([ab]).text())
    var poem_refs = await ab_refs.then(JSON.parse)
  }

  let poem_lines = poem_refs.map(async hk21 => {
    let k = await opaque.from_hk21(hk21)
    let bc_enc = await stg.kbc_fetch(k.hk2loc)
    let bc = await k.decipher(bc_enc)
    let tc = await new Blob([bc]).text()
    return tc
  })

  yield * poem_lines
}

