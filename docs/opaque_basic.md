# Opaque Basic and HMAC

Prototype-style implementation of Opaque Core APIs.

Opaque Basic variant `opaque_basic`:
- No cipher or content transforms for basic variants.
- Uses SHA-256 hashing for `k1ref` derivation.
- Uses SHA-256 hashing for `k2loc` derivation.
- Base for `opaque_basic_hmac`
- Useful for troubleshooting use without content encryption.

Opaque Basic HMAC variant `opaque_basic_hmac`:
- Can use SHA-256 or HMAC-SHA-256 hashing for `k1ref` derivation.
- Uses SHA-256 hashing for `k2loc` derivation.
- Base for [`opaque_tahoe`](./opaque_tahoe.md)
- Advanced use in [`opaque_ecdsa`](./opaque_ecdsa.md) and [`opaque_ecdhe`](./opaque_ecdhe.md)

Roughly, `k0` and `k2loc` corresponds to the content-addressable aspects of a [CAS][].
[Tahoe-LAFS][] inspires the multiple hash steps from `k0` to `k1ref` to `k2loc`.

  [Tahoe-LAFS]: https://tahoe-lafs.readthedocs.io/en/tahoe-lafs-1.12.1/specifications/file-encoding.html
  [CAS]: https://en.wikipedia.org/wiki/Content-addressable_storage


## API

See:

- [`./opaque_api.md`](./opaque_api.md)
- [`kctx` API](./kctx_api) -- Basic Key Context API


For `opaque_basic_hmac` derivatives, include `opaque_tahoe`:
- `as_session(hmac_key?) : opaque_api`
  If `hmac_key` provided, alias for `with_hmac(hmac_key)`; otherwise returns cloned opaque object.
- `with_hmac(hmac_key)`
  Returns a cloned opaque object with `k1ref` derivation bound to HMAC-SHA-256 hashing.


## Variants

- `opaque_basic_hmac` -- plaintext with HMAC secret for `k2loc`
- [`opaque_ecdsa_basic`](./opaque_ecdsa.md) -- ECDSA signed, plaintext
- [`opaque_ecdhe_basic`](./opaque_ecdhe.md) -- ECDHE shared HMAC secret for `k1ref`, plaintext


## Use

See [`examples/basic/`](../examples/basic/)

