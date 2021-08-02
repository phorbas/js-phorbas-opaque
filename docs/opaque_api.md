# Opaque Core API (abstract)

##### `k0` sources

Key zero `k0` is source material to derive `k1ref` from using a cryptographic hash.

- `async from_u8(u8_k0) : kctx`
  Use to idempotently create a new `kctx` key context given input.

- `async from_random(kctx) : kctx`
  Use as alias for `from_u8` using cryptographically random bits.

- `async from_content(u8_buf : u8 | utf8) : kctx`
  Use as alias for `from_u8` using cryptographic hash of `u8_buf`.

##### `k1ref`

Key one `k1ref` is a privileged reference key that can idempotently derive `k2loc`. For Tahoe variants, `k1ref` is required for ciphering operations.

- `async from_k1ref(k1ref) : kctx`
  Use to idempotently load a `kctx` key context given the `k1ref`. From the reference, `k2loc` will be re-computed according to the opaque variant.
  The returned `kctx` will have access ciphering operations, depending upon opaque variant.


##### `k2loc`

Key two `k2loc` is an observable location key. For Tahoe variants, `k2loc` is used for finding the enciphered content without disclosing any cleartext.

- `async from_k2loc(k2loc) : kctx`
  Use to idempotently load a `kctx` key context given the `k2loc`. From the reference, `k2loc` will be re-computed according to the opaque variant.
  The returned `kctx` will be unable to perform ciphering operations.


##### `k21pair`

Combining both, a `k21pair` is a privileged reference key with precomputed `k2loc` information. Primarily used to optimize access by saving computing cycles.

- `async from_k21pair(k21pair) : kctx`
  Use to idempotently load a `kctx` key context given the `k21pair`.
  If a `u8` is passed, this becomes an alias for `from_k1ref()`.
  Otherwise `([k2loc, k1ref] = k21pair)` is unpacked, saving re-compute of `k2loc`.
  The returned `kctx` will have access ciphering operations iff `k1ref` is provided, depending upon opaque variant.


#### Other public methods

- `as_core()`
  Returns an object closure supporting Core API, preventing introspection.

- `ciphered : Boolean`
  Denotes if the implementation ciphers content;
  `false` for `opaque_basic` variants;
  `true` for `opaque_tahoe` variants.

- `init_shared_codec({encode, decode})`
  Alias for `init_opaque_shared_codec` module shared codec settings.

- `as_session()`
  Session semantics for opaque variants.

  - See [`opaque_basic_hmac`](./opaque_basic_hmac.md) and subclasses for HMAC-based session keying.
  - See [`opaque_ecdsa_basic`](./opaque_ecdsa_basic.md) for shared ECDSA signing sessions.


### Extending Opaque APIs

See [`./opaque_extension_api.md`](./opaque_extension_api.md)

