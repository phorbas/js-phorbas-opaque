# Opaque ECDHE: Elliptic Curve Diffie-Hellman Ephemeral

Opaque ECDHE Tahoe variant `opaque_ecdhe_tahoe`:
- Extends from [`opaque_tahoe`](./opaque_tahoe.md)
- Uses AES-256 cipher as a Tahoe variant.
- Uses ECDHE P521 derived shared secret with HMAC-SHA-256 hashing for `k1ref` derivation.

Opaque ECDHE Basic variant `opaque_ecdhe_basic`:
- Extends from [`opaque_basic_hmac`](./opaque_basic.md)
- No cipher or content transforms as a basic variant.
- Uses ECDHE P256 derived shared secret with HMAC-SHA-256 hashing for `k1ref` derivation.

  [Tahoe-LAFS]: https://tahoe-lafs.readthedocs.io/en/tahoe-lafs-1.12.1/specifications/file-encoding.html
  [CAS]: https://en.wikipedia.org/wiki/Content-addressable_storage


## API

See:

- [`./opaque_api.md`](./opaque_api.md)
- [`kctx` API](./kctx_api.md) -- Ciphered Key Context API


## Use of `opaque_ecdhe_tahoe`

Try it at [`examples/example_ecdhe.mjs`](../examples/example_ecdhe.mjs)

```javascript
import { opaque_ecdhe_tahoe } from '@phorbas/opaque'

function example_opaque_ecdhe_tahoe() {
  const alice = opaque_ecdhe_tahoe()
  const bob = opaque_ecdhe_tahoe()
  return {
    alice_send: async msg => await _as_alice(alice, bob.ecdh, msg),
    bob_recv: async info => await _as_bob(bob, alice.ecdh, info),
  }
}

async function _as_alice(alice, bob_public_ecdh, msg) {
  const alice_keyed_opaque = await alice.with_ecdh(bob_public_ecdh)

  const alice_okey = await alice_keyed_opaque.from_content(msg)

  return {
    cas_addr: alice_okey.k21pair(),
    enc_data: await alice_okey.encipher_utf8(msg), }
}

async function _as_bob(bob, alice_public_ecdh, {cas_addr, enc_data}) {
  const bob_keyed_opaque = await bob.with_ecdh(alice_public_ecdh)

  const bob_okey = await bob_keyed_opaque.from_k21pair(cas_addr)

  return await bob_okey.decipher_utf8(enc_data)
}


let {alice_send, bob_recv} = example_opaque_ecdhe_tahoe()

alice_send('Hello @phorbas/opaque')
  .then(info => { console.log(info); return info })
  .then(bob_recv)
  .then(out => { console.log('Round-trip: %s', out) })
```

