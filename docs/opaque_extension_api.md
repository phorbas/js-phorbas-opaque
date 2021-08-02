# Extending Opaque Core API (abstract)

See [`./opaque_api.md`](./opaque_api.md) for public API.


### Composed protected methods

- `_init_key(is_new) : kctx`
  Create new instance of opaque variant.
  Used by `from_u8` with `is_new=true` to denote `k0` new key use.
  Otherwise used by `from_k1ref, from_k2loc, from_k21pair` with no arguments.
  Overridden in `opaque_ecdsa_basic.jsy` for ECDSA opaque variants.

- `_finish_key(kctx) : kctx`
  Extension point; `opaque_basic.jsy` simply returns `kctx`.

- `_from_kctx(kctx) : kctx`
  Composed method that async computes `k2loc` using `_kdf2_loc()` and then `_finish_key()`


- `_kdf1_ref(u8_k0 : Uint8Array, kctx) : Uint8Array`
  Used by `from_u8()` to compute `k1ref`; defined in `opaque_basic.jsy` as `kdf_sha_256`.
  Overridden in `opaque_ecdsa_basic.jsy` to incorporate digital signature.

- `_kdf2_loc(u8_k1ref : Uint8Array, kctx) : Uint8Array`
  Used by `_from_kctx()` to compute `k2loc` from `k1ref`; defined in `opaque_basic.jsy` as `kdf_sha_256`.
  Overridden in `opaque_ecdsa_basic.jsy` to incorporate digital signature.

- `_kdf0_random() : Uint8Array`
  Used by `from_random()` as `from_u8`; defined in `opaque_basic.jsy` as `kdf_random_16`

- `_kdf0_hash(u8_buf : Uint8Array) : Uint8Array`
  Used by `from_content()` as `from_u8`; defined in `opaque_basic.jsy` as `kdf_sha_256`

