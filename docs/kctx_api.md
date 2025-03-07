# Opaque Key Context API

### Basic Key Context API:

- `hk21() : [hk2loc, hk1ref]`
  Returns a pair of `u8` keys for idempotently reconstructing the `kctx` key context. Use

- `ciphered : boolean` indicates whether the key context is ciphered. Useful for debugging.


### Cipher Key Context API:

Implements Basic Key Context API in addition to:

- `async encipher(u8) : u8`
  Given a valid `hk1ref` and `hk2loc`.
  Uses `hk1ref` as secret to encipher `u8` content according to specific opaque variant.
  Returns a packed opaque record structure with enciphered data, parameters, and `hk2loc`.

  See [`opaque_tahoe.jsy`](../code/opaque_tahoe.jsy) for details.

- `async decipher(u8_record) : u8`
  Given a valid `hk1ref` and a packed opaque `u8_record` structure with enciphered data, parameters.
  Uses `hk1ref` as secret to decipher data using parameters in structure.
  Returns original `u8` data or throws an error.

  See [`opaque_tahoe.jsy`](../code/opaque_tahoe.jsy) for details.

