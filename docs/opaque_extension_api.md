# Extending Opaque Core API (abstract)

See [`./opaque_api.md`](./opaque_api.md) for public API.


### Composed protected methods

- `_init_key(is_new) : kctx`
  Create new instance of opaque variant.
  Used by `from_content` with `is_new=true` to denote `k0` new key use.
  Otherwise used by `from_hk21` with no arguments.
  Overridden in `opaque_ecdsa_basic.jsy` for ECDSA opaque variants.

- `_finish_key(kctx) : kctx`
  Extension point; `opaque_basic.jsy` simply returns `kctx`.

- `_from_kctx(kctx) : kctx`
  Composed method that async computes `k2loc` using `_kdf2_loc()` and then `_finish_key()`


- `_kdf1_ref(u8_k0 : Uint8Array, kctx) : Uint8Array`
  Used by `from_content()` to compute `k1ref`.
  Overridden in `opaque_ecdsa_basic.jsy` to incorporate digital signature.

- `_kdf2_loc(u8_k1ref : Uint8Array, kctx) : Uint8Array`
  Used by `_from_kctx()` to compute `k2loc` from `k1ref`.
  Overridden in `opaque_ecdsa_basic.jsy` to incorporate digital signature.

- `_kdf0_hash(buf) : Uint8Array`
  Used by `from_content()` to hash content

