# PHORBAS Opaque

PHORBAS Opaque is inspired by [Content Addressable Stores][CAS] and [Tahoe-LAFS][].
The techniques of Tahoe-LAFS are generalized to work with abstract `hk1ref`, `hk2loc` concepts,
expanding to additional cyrptographic hashing, HMAC, ciphering, digital signatures, public key/private key schemes.

Roughly, `hk2loc` corresponds to the content-addressable aspects of a [CAS][].
The `hk1ref` corresponds to [Tahoe-LAFS][] ciphering secret, as well as the multiple hash steps from `hk1ref` to `hk2loc`.

  [Tahoe-LAFS]: https://tahoe-lafs.readthedocs.io/en/tahoe-lafs-1.12.1/specifications/file-encoding.html
  [CAS]: https://en.wikipedia.org/wiki/Content-addressable_storage


## Use

Start with [`examples/tahoe/demo_tahoe.mjs`](../examples/tahoe/demo_tahoe.mjs)


## Core API

Key zero source material

  - `async from_random() : kctx`
  - `async from_content(u8_buf) : kctx`

Key privlaged reference key

  - `async from_hk21(hk1ref) : kctx`
  - `async from_hk21([hk2loc, hk1ref]) : kctx`
  - `async from_hk21([null, hk1ref]) : kctx`

Key observable location key

  - `async from_hk21([hk2loc, hk1ref]) : kctx`

Other public methods

  - `as_core() : kctx`
  - `ciphered : Boolean`
  - `as_session()`

See [`./opaque_api.md`](./opaque_api.md) for more docs on the core api.


### Opaque implementation variants

Tahoe (ciphered) Opaque Variants:

- [`opaque_tahoe`](./opaque_tahoe.md) -- AES encrypted
- [`opaque_ecdsa_tahoe`](./opaque_ecdsa.md) -- ECDSA signed, AES encrypted
- [`opaque_ecdhe_tahoe`](./opaque_ecdhe.md) -- ECDHE shared HMAC secret for `hk2loc`, AES encrypted


Basic (cleartext) Opaque Variants:

- [`opaque_basic`](./opaque_basic.md) -- plaintext
- [`opaque_basic_hmac`](./opaque_basic.md) -- plaintext with HMAC for `hk1ref` and `hk2loc`
- [`opaque_ecdsa_basic`](./opaque_ecdsa.md) -- ECDSA signed, plaintext
- [`opaque_ecdhe_basic`](./opaque_ecdhe.md) -- ECDHE shared HMAC secret for `hk1ref`, plaintext


### Key Context APIs:

See [`./kctx_api.md`](./kctx_api.md) for docs.

Tahoe (ciphered) Opaque Variants:

- `async encipher(u8) : u8`
- `async decipher(u8_record) : u8`
- ... and basic api

Basic (cleartext) Opaque Variants:

- `hk21() : [hk2loc, hk1ref]`
  Returns a pair of hex-encoded keys for idempotently reconstructing the `kctx` key context.

- `ciphered : boolean`
  Indicates whether the key context is ciphered. Useful for debugging.

