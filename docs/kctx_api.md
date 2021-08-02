# Opaque Key Context API

### Basic Key Context API:

- `k21pair() : [k2loc, k1ref]`
  Returns a pair of `u8` keys for idempotently reconstructing the `kctx` key context. Use

- `ciphered : boolean` indicates whether the key context is ciphered. Useful for debugging.

- `async encode_content(u8) : u8`
  Encodes content according to opaque variant; a no-op for basic variants.
  Alias for `encipher_content` on Cipher Key Contexts.

- `async decode_content(u8) : u8`
  Decodes content according to opaque variant; a no-op for basic variants.
  Alias for `decipher_content` on Cipher Key Contexts.

- `async encode_utf8(utf8) : u8`
  Alias for `encode_content( utf8_to_u8(utf8))`
  Alias for `encipher_utf8` on Cipher Key Contexts.

- `async decode_utf8(u8) : utf8`
  Alias for `u8_to_utf8( decode_content(u8))`
  Alias for `decipher_utf8` on Cipher Key Contexts.


### Cipher Key Context API:

Implements Basic Key Context API in addition to:

- `async encipher(u8) : u8`
  Given a valid `k1ref` and `k2loc`.
  Uses `k1ref` as secret to encipher `u8` content according to specific opaque variant.
  Returns a packed opaque record structure with enciphered data, parameters, and `k2loc`.

  See [`opaque_tahoe.jsy`](../code/opaque_tahoe.jsy) for details.

- `async decipher(u8_record) : u8`
  Given a valid `k1ref` and a packed opaque `u8_record` structure with enciphered data, parameters.
  Uses `k1ref` as secret to decipher data using parameters in structure.
  Returns original `u8` data or throws an error.

  See [`opaque_tahoe.jsy`](../code/opaque_tahoe.jsy) for details.

- `async encipher_utf8(utf8) : u8`
  Alias for `encipher( utf8_to_u8(utf8))`

- `async decipher_utf8(u8) : utf8`
  Alias for `u8_to_utf8( decipher(u8))`

