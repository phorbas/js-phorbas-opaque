# Opaque Core API (abstract)

See [`kctx` API](./kctx_api.md) for Key Context API returned from most methods.

##### `k0` sources

Key zero `k0` is source material to derive `k1ref` from using a cryptographic hash.

- `async from_content(u8_buf, false?) : kctx`
  Use to idempotently create a new `kctx` key context given input.

- `async from_content(u8_buf, true) : kctx`
  Use to idempotently create a new `kctx` using cryptographic hash of `u8_buf`.

- `async from_random(kctx) : kctx`
  Use to idempotently create a new `kctx` using cryptographically random bits.

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


##### `from_hk21`

An `hk21` pair is a privileged reference key with precomputed `k2loc` information. Primarily used to optimize access by saving computing cycles.

- `async from_hk21(hk21) : kctx`
  Use to idempotently load a `kctx` key context given the `hk21`.

If two item array is passed
  If a `u8` is passed, this becomes an alias for `from_k1ref()`.
  Otherwise `([k2loc, k1ref] = k21pair)` is unpacked, saving re-compute of `k2loc`.
  The returned `kctx` will have access ciphering operations iff `k1ref` is provided, depending upon opaque variant.


#### Other public methods

- `with_hmac(u8_key) : opaque_api`
  Returns a cloned opaque object with `k1ref` derivation bound to HMAC-SHA-256 hashing.

- `as_core()`
  Returns an object closure supporting Core API, preventing introspection.

- `ciphered : Boolean`
  Denotes if the implementation ciphers content;
  `false` for `opaque_basic` variants;
  `true` for `opaque_tahoe` variants.

- `as_session()`
  Session semantics for opaque variants.

  - See [`opaque_basic_hmac`](./opaque_basic_hmac.md) and subclasses for HMAC-based session keying.
  - See [`opaque_ecdsa_basic`](./opaque_ecdsa_basic.md) for shared ECDSA signing sessions.


### Extending Opaque APIs

See [`./opaque_extension_api.md`](./opaque_extension_api.md)

