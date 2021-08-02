# Opaque Tahoe

Prototype-style implementation of Opaque Core APIs.
- Extends from [`opaque_basic_hmac`](./opaque_basic.md)
- Uses AES-256 cipher for Tahoe variants.
- Uses SHA-256 hashing for `k1ref` derivation.
- Uses HMAC hashing for `k2loc` derivation.

Roughly, `k0` and `k2loc` corresponds to the content-addressable aspects of a [CAS][].
The `k1ref` corresponds to [Tahoe-LAFS][] ciphering secret, as well as the multiple hash steps from `k0` to `k1ref` to `k2loc`.

  [Tahoe-LAFS]: https://tahoe-lafs.readthedocs.io/en/tahoe-lafs-1.12.1/specifications/file-encoding.html
  [CAS]: https://en.wikipedia.org/wiki/Content-addressable_storage

## Variants

- [`opaque_ecdsa_tahoe`](./opaque_ecdsa.md) -- ECDSA signed, AES encrypted
- [`opaque_ecdhe_tahoe`](./opaque_ecdhe.md) -- ECDHE shared HMAC secret for `k2loc`, AES encrypted



