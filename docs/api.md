### PHORBAS Opaque

Variants:
- `opaque_basic` -- plaintext
- `opaque_tahoe` -- AES encrypted

- `opaque_ecdsa_basic` -- ECDSA signed, plaintext
- `opaque_ecdsa_tahoe` -- ECDSA signed, AES encrypted

- `opaque_ecdhe_basic` -- ECDHE shared HMAC secret for k1, plaintext
- `opaque_ecdhe_tahoe` -- ECDHE shared HMAC secret for k1, AES encrypted


#### Opaque Core API (abstract)

- `async from_k0(u8_k0)`
- `async from_k1ref(k1ref)`
- `async from_k2loc(k2loc)`
- `async from_k21pair(k21pair)`
- `async from_content(u8_buf)`
- `async from_random(kctx)`
- `async from_u8(u8_k0)`
- `as_session()`
- `init_shared_codec()`
- `as_core()`
- `ciphered : Boolean`


Abstract virtual overrides:

- `_init_key(is_new) : kctx`
- `_finish_key(kctx) : kctx`

- `_kdf0_random() : Uint8Array`
- `_kdf0_hash(u8_buf : Uint8Array) : Uint8Array`
- `_kdf1_ref(u8_k0 : Uint8Array, kctx) : Uint8Array`
- `_kdf2_loc(u8_k1ref : Uint8Array, kctx) : Uint8Array`


#### Opaque Key Context API

Basic Key Context API:

- `k21pair()`
- `async encode_content(u8)`
- `async decode_content(u8)`
- `async encode_utf8(utf8)`
- `async decode_utf8(u8)`


Cipher Key Context API:
- `k21pair()`
- `async encipher(u8)`
- `async decipher(u8)`
- `async encipher_utf8(utf8)`
- `async decipher_utf8(utf8)`
- `async encode_content(u8)` alias for `encipher(u8)`
- `async decode_content(u8)` alias for `decipher(u8)`
- `async encode_utf8(utf8)` alias for `encipher_utf8(u8)`
- `async decode_utf8(u8)` alias for `decipher_utf8(u8)`

