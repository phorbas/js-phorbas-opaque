# PHORBAS Opaque

PHORBAS Opaque is inspired by [Content Addressable Stores][CAS] and [Tahoe-LAFS][].
The techniques of Tahoe-LAFS are generalized to work with abstract `k0`, `k1ref`, `k2loc` concepts,
expanding to additional cyrptographic hashing, HMAC, ciphering, digital signatures, public key/private key schemes.

Roughly, `k0` and `k2loc` corresponds to the content-addressable aspects of a [CAS][].
The `k1ref` corresponds to [Tahoe-LAFS][] ciphering secret, as well as the multiple hash steps from `k0` to `k1ref` to `k2loc`.

  [Tahoe-LAFS]: https://tahoe-lafs.readthedocs.io/en/tahoe-lafs-1.12.1/specifications/file-encoding.html
  [CAS]: https://en.wikipedia.org/wiki/Content-addressable_storage


## Use

```javascript
import { opaque_tahoe } from '@phorbas/opaque'

async function tahoe_put(msg) {
  const okey = await opaque_tahoe.from_content(msg)
  return {
    cas_addr: okey.k21pair(),
    enc_data: await okey.encipher_utf8(msg), }
}

async function tahoe_get({cas_addr, enc_data}) {
  const okey = await opaque_tahoe.from_k21pair(cas_addr)
  return await okey.decipher_utf8(enc_data)
}

tahoe_put('Hello @phorbas/opaque')
  .then(tahoe_get)
  .then(out => { console.log('Got: %s', out) })
```


## Core API

Key zero source material

  - `async from_u8(u8_k0) : kctx`
  - `async from_random(kctx) : kctx`
  - `async from_content(u8_buf) : kctx`

Key one privlaged reference key

  - `async from_k1ref(k1ref) : kctx`
  - `async from_k21pair(k21pair) : kctx`

Key two observable location key

  - `async from_k2loc(k2loc) : kctx`

Other public methods

  - `as_core() : kctx`
  - `ciphered : Boolean`
  - `init_shared_codec()`
  - `as_session()`

See [`./opaque_api.md`](./opaque_api.md) for more docs on the core api.


### Opaque implementation variants

Tahoe (ciphered) Opaque Variants:

- `opaque_tahoe` -- AES encrypted
- `opaque_ecdsa_tahoe` -- ECDSA signed, AES encrypted
- `opaque_ecdhe_tahoe` -- ECDHE shared HMAC secret for k1, AES encrypted


Basic (cleartext) Opaque Variants:

- `opaque_basic` -- plaintext
- `opaque_basic_hmac` -- plaintext with HMAC for `k1ref` and `k2loc`
- `opaque_ecdsa_basic` -- ECDSA signed, plaintext
- `opaque_ecdhe_basic` -- ECDHE shared HMAC secret for k1, plaintext


### Key Context APIs:

See [`./kctx_api.md`](./kctx_api.md) for docs.

Tahoe (ciphered) Opaque Variants:

- `async encipher(u8) : u8`
- `async decipher(u8_record) : u8`
- `async encipher_utf8(utf8) : u8`
- `async decipher_utf8(u8) : utf8`
- ... and basic api

Basic (cleartext) Opaque Variants:

- `async encode_content(u8) : u8`
- `async decode_content(u8) : u8`
- `async encode_utf8(utf8) : u8`
- `async decode_utf8(u8) : utf8`

- `k21pair() : [k2loc, k1ref]`
  Returns a pair of `u8` keys for idempotently reconstructing the `kctx` key context. Use

- `ciphered : boolean`
  Indicates whether the key context is ciphered. Useful for debugging.

