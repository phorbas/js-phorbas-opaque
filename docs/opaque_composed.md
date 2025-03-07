# Opaque Composed

Enables dynamic composition of two Opaque implementations.

```javascript
import { opaque_compose, opaque_hmac, opaque_tahoe } from '@phorbas/opaque'

opaque_compose(opaque_tahoe, opaque_hmac.with_hmac('example namespace'))
```

## API

See:

- [`./opaque_api.md`](./opaque_api.md)
- [`kctx` API](./kctx_api.md) -- Ciphered Key Context API
- [`opaque_basic_hmac`](./opaque_basic.md) -- HMAC API
- [`opaque_tahoe`](./opaque_tahoe.md) -- AES Encrypted API


## Use

See [`examples/composed/`](../examples/composed/)

