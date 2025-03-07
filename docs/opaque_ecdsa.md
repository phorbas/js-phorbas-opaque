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
- `with_hmac(hmac_key)`
  Returns a cloned ECDSA opaque object with `k1ref` derivation bound to HMAC-SHA-256 hashing.


Attached Key Contexts APIs:
- `async validate(u8_record) : boolean`
  Returns true if `u8_record` is properly signed and decoded;
  `false` for decoding errors; `undefined` if `u8_record` is falsey.
- `as_session()`
  Re-uses a single ECDSA keypair between operations of this key context instance.
  


## Use

See [`examples/ecdsa/`](../examples/ecdsa/)

