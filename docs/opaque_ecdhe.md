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


## Use

See [`examples/ecdhe/`](../examples/ecdhe/)

