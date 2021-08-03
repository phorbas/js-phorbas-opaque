# Opaque ECDSA: Elliptic Curve Digital Signature Algorithm

Opaque ECDSA Tahoe variant `opaque_ecdsa_tahoe`:
- Extends from [`opaque_tahoe`](./opaque_tahoe.md)
- Uses AES-256 cipher as a Tahoe variant.

Opaque ECDSA Basic variant `opaque_ecdsa_tahoe`:
- Extends from [`opaque_basic_hmac`](./opaque_basic.md)
- No cipher or content transforms as a basic variant.

  [Tahoe-LAFS]: https://tahoe-lafs.readthedocs.io/en/tahoe-lafs-1.12.1/specifications/file-encoding.html
  [CAS]: https://en.wikipedia.org/wiki/Content-addressable_storage


## API

See:

- [`./opaque_api.md`](./opaque_api.md)
- [`kctx` API](./kctx_api.md) -- Ciphered Key Context API
- `as_session(u8_key?) : opaque_api`
  Highly suggested for speed optimization.
  Re-uses a single ECDSA keypair between operations of this opaque instance.
- `with_hmac(u8_key)`
  Returns a cloned ECDSA opaque object with `k1ref` derivation bound to HMAC-SHA-256 hashing.


Attached Key Contexts APIs:
- `async validate(u8_record) : boolean`
  Returns true if `u8_record` is properly signed and decoded;
  `false` for decoding errors; `undefined` if `u8_record` is falsey.
- `as_session()`
  Re-uses a single ECDSA keypair between operations of this key context instance.
  


## Use of `opaque_ecdsa_tahoe`

Try it at [`examples/example_ecdsa.mjs`](../examples/example_ecdsa.mjs)

```javascript
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
```

