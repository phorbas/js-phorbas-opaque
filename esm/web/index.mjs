Array.from(Array(256),
  (_, v) => v.toString(2).padStart(8, '0'));

const _lut_u8hex = Array.from(Array(256),
  (_, v) => v.toString(16).padStart(2, '0'));

function u8_to_hex(u8, sep) {
  if (undefined === u8.buffer) {
    u8 = new Uint8Array(u8);}

  let s = '';
  sep = null==sep ? '' : ''+sep;

  // 20x faster than Array.from/.map impl
  for (const v of u8) {
    s += _lut_u8hex[v & 0xff];
    s += sep;}

  return sep.length ? s.slice(0, -sep.length) : s}


const _lut_hexu8 ={
  0: 0x0, 1: 0x1, 2: 0x2, 3: 0x3, 4: 0x4, 5: 0x5, 6: 0x6, 7: 0x7, 8: 0x8, 9: 0x9,
  a: 0xa, b: 0xb, c: 0xc, d: 0xd, e: 0xe, f: 0xf,
  A: 0xa, B: 0xb, C: 0xc, D: 0xd, E: 0xe, F: 0xf,};

function hex_to_u8(hex) {
  hex = hex.replace(/\W|_/g, '');
  if (1 & hex.length) {
    hex = '0'+hex; }// pad odd-length

  const len = hex.length >> 1, u8 = new Uint8Array(len);
  // ~55% faster than parseInt
  for (let i=0,j=0; i<len; j+=2) {
    u8[i++] = (_lut_hexu8[hex[j]] << 4) | _lut_hexu8[hex[j+1]];}
  return u8}

function u8_to_utf8(u8) {
  return new TextDecoder('utf-8').decode(u8) }

function utf8_to_u8(utf8) {
  return new TextEncoder('utf-8').encode(utf8) }

const u8_maybe_utf8 = u8 =>
  'string' === typeof u8 ? utf8_to_u8(u8) : u8;


function u8_timing_equal(a, b) {
  const alen = a.length;
  let r = alen ^ b.length;
  // don't allow short-circut early return
  for (let i=0;i<alen;i++) {
    r |= a[i] ^ b[i];}
  return 0 === r}


function u8_fast_equal(a, b) {
  const alen = a.length;
  if (b.length !== alen) {
    return false}

  for (let i=0;i<alen;i++) {
    if (a[i] !== b[i]) {
      return false} }

  return true}


function ecc_by_len(ec_len, p521='P-521', p384='P-384', p256='P-256', absent) {
  switch (ec_len) {
    case 158: case 133: return p521
    case 120: case 97: return p384
    case 91: case 65: return p256
    default: return absent} }

function _codec_uninit() {
  throw new Error('Uninitialized @phorbas/opaque codec')}

const opaque_shared_codec ={
  encode: _codec_uninit,
  decode: _codec_uninit,};

function init_opaque_shared_codec({encode, decode}, on_absent) {
  let o = opaque_shared_codec;

  if (encode === o.encode && decode === o.decode) {
    return 2}

  if (_codec_uninit === o.encode || true === on_absent) {
    o.encode = encode;
    o.decode = decode;
    return 1}

  let msg = 'Re-initialized @phorbas/opaque codec';
  if (on_absent) {
    return on_absent(msg, o)}
  else throw new Error(msg)}

function u8_crypto_random(n) {
  return crypto.getRandomValues(
    new Uint8Array(n)) }

const _import_aes_gcm_raw = aeskey =>
  crypto.subtle.importKey('raw', aeskey.subarray(-32),
    {name: 'AES-GCM', length: 256}, false, ['encrypt', 'decrypt']);

const u8_aes_256_gcm ={
  async encrypt(raw_content, key_cipher, key_iv) {
    return new Uint8Array(await crypto.subtle.encrypt(
      {name: 'AES-GCM', tagLength: 128,
          iv: key_iv.subarray(-12) }// IV of 96 bits (12 bytes) 
      , await _import_aes_gcm_raw(key_cipher)
      , raw_content) ) }

  , async decrypt(enc_content, key_cipher, key_iv) {
    return new Uint8Array(await crypto.subtle.decrypt(
      {name: 'AES-GCM', tagLength: 128,
          iv: key_iv.subarray(-12) }// IV of 96 bits (12 bytes) 
      , await _import_aes_gcm_raw(key_cipher)
      , enc_content) ) } };

function _bind_sha_digest(hash) {
  const _digest_ = crypto.subtle
    .digest.bind(crypto.subtle, { name: hash });

  return (async ( data, n ) => {
    const u8 = new Uint8Array(
      await _digest_(
        u8_maybe_utf8(await data) ) );

    return undefined === n ? u8
      : u8.subarray(n)}) }















const u8_sha_256 = _bind_sha_digest('SHA-256');
const u8_sha_384 = _bind_sha_digest('SHA-384');
const u8_sha_512 = _bind_sha_digest('SHA-512');

function _bind_hmac_sha(hash) {
  const {subtle} = crypto;
  return (( u8_key, u8 ) => {
    u8_key = u8_maybe_utf8(u8_key);

    const _hkey = subtle.importKey(
      'raw', u8_key, {name: 'HMAC', hash},
      false, ['sign', 'verify']);

    const hmac_sign = async u8 =>
      new Uint8Array(await subtle.sign(
        {name: 'HMAC'}, await _hkey
        , u8_maybe_utf8(u8)) );

    if (u8) {
      return hmac_sign(u8)}

    return {hash, hmac_sign,
      async hmac_verify(u8_sig, u8) {
        return subtle.verify(
          {name: 'HMAC'}, await _hkey,
          u8_sig, u8) } } }) }
























const u8_hmac_sha_256 = _bind_hmac_sha('SHA-256');
const u8_hmac_sha_384 = _bind_hmac_sha('SHA-384');
const u8_hmac_sha_512 = _bind_hmac_sha('SHA-512');

function _bind_ecdsa(hash) {
  const {subtle} = crypto;
  return {
    p521: () => _ecdsa_signer('P-521')
    , p384: () => _ecdsa_signer('P-384')
    , p256: () => _ecdsa_signer('P-256')
    , verify: ecdsa_verify
    , hash}


  async function ecdsa_verify(ec_sig_obj, u8) {
    const {ec, sig} = ec_sig_obj;
    const namedCurve = ecc_by_len(ec.length);
    if (! namedCurve) {return}

    const _kind ={name: 'ECDSA', hash, namedCurve};
    const ec_pub = subtle.importKey(
      'spki', ec, _kind, false, ['verify']);

    return subtle.verify(
      _kind, await ec_pub, sig, u8) }


  function _ecdsa_signer(namedCurve) {
    const _kind = {name: 'ECDSA', namedCurve, hash};
    const _ec_ = subtle.generateKey(
      _kind, false, ['sign']);

    const ec = _ec_.then(async _ec_ => new Uint8Array(
      await subtle.exportKey('spki', _ec_.publicKey)) );
    return Object.assign(ecdsa_sign,{
      ec, ecdsa_sign, ecdsa_verify
      , hash, namedCurve} )


    async function ecdsa_sign(u8) {
      const {privateKey} = await _ec_;
      const u8_sig = new Uint8Array(
        await subtle.sign(
          _kind, privateKey, u8) );

      return {ec: await ec, sig: u8_sig} } } }


























































const u8_ecdsa_sha_256 = _bind_ecdsa('SHA-256');
const u8_ecdsa_sha_384 = _bind_ecdsa('SHA-384');
const u8_ecdsa_sha_512 = _bind_ecdsa('SHA-512');

function _bind_ecdhe() {
  const n_bits ={'P-521': 528, 'P-384': 384, 'P-256': 256,};
  const {subtle} = crypto;

  return {
    p521: () => _gen_ecdhe('P-521')
    , p384: () => _gen_ecdhe('P-384')
    , p256: () => _gen_ecdhe('P-256')
    , mirror: other => _ecdhe_mirror(other, _gen_ecdhe)
    , _with_ecdh}

  function _gen_ecdhe(namedCurve) {
    const _ec_ = subtle.generateKey(
      {name: 'ECDH', namedCurve}, false, ['deriveBits']);
    return _with_ecdh(namedCurve, _ec_)}


  function _with_ecdh(namedCurve, _ec_) {
    const _kind ={name: 'ECDH', namedCurve};
    return Object.assign(ecdh_derive,{
      ecdh: _ec_.then (async ( _ec_ ) => new Uint8Array(
        await subtle.exportKey('raw', _ec_.publicKey)) )

      , ecdh_derive
      , namedCurve} )

    async function ecdh_derive(ecdh) {
      const ec_pub = await subtle.importKey(
        'raw', await ecdh, _kind, false, []);

      return new Uint8Array(
        await subtle.deriveBits(
          {... _kind, public: ec_pub}
          , (await _ec_).privateKey
          , n_bits[namedCurve]) ) } } }



































const u8_ecdhe = _bind_ecdhe();

function _ecdhe_mirror(ecdh_other, _gen_ecdhe) {
  const ec_len = (0 | ecdh_other) === ecdh_other
    ? 0 | ecdh_other
    : ecdh_other.byteLength || ecdh_other.length;

  const namedCurve = ecc_by_len(ec_len);
  return _gen_ecdhe(namedCurve)}

const opaque_core_api ={
  // k0 is source material for k1ref derivation

  from_random() {// k0
    return this.from_u8(this._kdf0_random())}

, async from_content(u8_buf) {// k0
    u8_buf = await this._kdf0_hash(
      u8_maybe_utf8(u8_buf));
    return this.from_u8(u8_buf)}

, async from_u8(u8_k0) {// k0
    const kctx = await this._init_key(true);
    kctx.k1ref = await this._kdf1_ref(u8_k0, kctx);
    return this._from_kctx(kctx)}


, // k1ref is privlaged reference

  async from_k1ref(k1ref) {
    const kctx = await this._init_key();
    kctx.k1ref = k1ref;
    return this._from_kctx(kctx)}

, // k2loc is observable location

  async from_k2loc(k2loc) {
    const kctx = await this._init_key();
    kctx.k1ref = undefined;
    kctx.k2loc = k2loc;
    return this._finish_key(kctx)}

, // k21pair may be tuple of `[k1ref, k2pair]` or `k1ref` alone; lazily avoids rehashing `k2loc`

  async from_k21pair(k21pair) {
    const kctx = await this._init_key();
    if (! Array.isArray(k21pair)) {
      if ('function' !== typeof k21pair.k21pair) {
        kctx.k1ref = k21pair;
        return this._from_kctx(kctx)}

      k21pair = k21pair.k21pair();}

    kctx.k1ref = k21pair[1];
    kctx.k2loc = k21pair[0];
    return this._finish_key(kctx)}


, //
  // Protected extension api

  // _init_key(is_new) : kctx // subclass responsibility
  // _finish_key(kctx) : kctx // subclass responsibility
  async _from_kctx(kctx) {
    kctx.k2loc = await this._kdf2_loc(kctx.k1ref, kctx);
    return this._finish_key(kctx)}


, //
  // Addtional public api

  as_session() {return this}
, init_shared_codec: init_opaque_shared_codec

, as_core() {return {
    ciphered: this.ciphered

  , from_k1ref: k1ref => this.from_k1ref(k1ref)
  , from_k2loc: k2loc => this.from_k2loc(k2loc)
  , from_k21pair: k21pair => this.from_k21pair(k21pair)
  , from_content: u8_buf => this.from_content(u8_buf)
  , from_random: () => this.from_random()
  , from_u8: u8_k0 => this.from_u8(u8_k0)

  , as_session: (...args) => this.as_session(...args).as_core()

  , as_core: _self} } };

function _self() {return this}

const kdf_random_16 = () => u8_crypto_random(16);
const kdf_sha_256 = u8 => u8_sha_256(u8);

const _as_u8_async = async u8 => u8 && new Uint8Array(u8);

const opaque_basic_key_proto ={
  ciphered: false
, k21pair() {return [this.k2loc, this.k1ref]}

, encode_content: _as_u8_async
, decode_content: _as_u8_async
, encode_utf8: async utf8 => utf8_to_u8(utf8)
, decode_utf8: async u8 => u8_to_utf8(u8)};


const opaque_basic_api ={
  ... opaque_core_api
, ciphered: false

, _kdf0_random: kdf_random_16
, _kdf0_hash: kdf_sha_256
, _kdf1_ref: kdf_sha_256
, _kdf2_loc: kdf_sha_256

, key_proto: opaque_basic_key_proto

, _init_key(is_new) {return {__proto__: this.key_proto}}
, _finish_key(kctx) {return kctx}

, _clone(ctx) {return {__proto__: this, as_session: null, ...ctx}} };


const opaque_basic = Object.freeze({
  ... opaque_basic_api});

const opaque_basic_hmac_api ={
  ... opaque_basic_api
, _hmac: u8_hmac_sha_256

, as_session(u8_key) {
    return u8_key ? this.with_hmac(u8_key) : this._clone()}

, with_hmac(u8_key) {
    const {hmac_sign} = this._hmac(u8_key);
    return this._clone({_kdf1_ref: hmac_sign}) }

, _clone(ctx) {return {__proto__: this, as_session: null, ...ctx}} };


const opaque_basic_hmac = Object.freeze({
  ... opaque_basic_hmac_api});

const opaque_tahoe = Object.freeze({
  ... opaque_basic_hmac_api
, ciphered: true

, key_proto:
    Object.freeze(
      bind_tahoe_cipher(u8_aes_256_gcm)) });


const tahoe = () => ({ __proto__: opaque_tahoe });

const tahoe_hmac = u8_key =>
  opaque_tahoe.with_hmac(u8_key);



function bind_tahoe_cipher(cipher) {
  return {
    ciphered: true
  , k21pair() {return [this.k2loc, this.k1ref]}

  , encode_content(u8) {return this.encipher(u8)}
  , decode_content(u8) {return this.decipher(u8)}
  , encode_utf8(utf8) {return this.encipher_utf8(utf8)}
  , decode_utf8(u8) {return this.decipher_utf8(u8)}

  , encipher_utf8(utf8) {
      return this.encipher(utf8_to_u8(utf8)) }

  , async encipher(u8_content) {
      const {k1ref, k2loc, _kdf_secret, _kdf_iv} = this;
      if (k1ref && k2loc) {
        const u8_secret = ! _kdf_secret ? k1ref
          : await _kdf_secret(k1ref);

        const u8_iv = await _kdf_iv(k2loc);

        const u8_enc = await cipher.encrypt(
          u8_content, u8_secret, u8_iv);

        return await this._pack_opaque({
          c:u8_enc, v:u8_iv, l:k2loc}) } }

  , async decipher_utf8(u8_record) {
      const u8 = await this.decipher(u8_record);
      if (undefined !== u8) {
        return u8_to_utf8(u8)} }

  , async decipher(u8_record) {
      const {k1ref, _kdf_secret} = this;
      if (u8_record && k1ref) {
        const {v:u8_iv, c:u8_enc} =
          await this._unpack_opaque(u8_record) || {};

        const u8_secret = ! _kdf_secret ? k1ref
          : await _kdf_secret(k1ref);

        if (u8_enc && u8_secret && u8_iv) {
          return await cipher.decrypt(
            u8_enc, u8_secret, u8_iv) } } }


  , _codec: opaque_shared_codec
  , _kdf_iv: kdf_random_16
  , // _kdf_secret: k1ref => k1ref

    _pack_opaque(obj_body) {
      return this._codec.encode(obj_body)}
  , _unpack_opaque(u8_record) {
      return this._codec.decode(u8_record)} } }

const kdf_kctx_tail = kdf_inner =>
    async (u8_k0, kctx) =>
      u8_mix_aaab(await kdf_inner(u8_k0), kctx.k_ec);

const kdf_key_tail = kdf_inner =>
    async k1ref =>
      u8_mix_aaab(await kdf_inner(k1ref), k1ref);


const opaque_ecdsa_basic = Object.freeze({
  ... opaque_basic_api

, _hmac: u8_hmac_sha_256
, _kdf1_ref: kdf_kctx_tail(kdf_sha_256)
, _kdf2_loc: kdf_key_tail(kdf_sha_256)

, key_proto: Object.freeze(
    bind_ecdsa_key_proto({
      kdf_ec: kdf_sha_256
    , ecdsa_signer: u8_ecdsa_sha_256.p521
    , ecdsa_verify: u8_ecdsa_sha_256.verify}) )


, async _init_key(is_new) {
    const kctx ={__proto__: this.key_proto};
    await kctx._init_eckey(is_new, kctx);
    return kctx}

, as_session(...args) {return this._clone({
    key_proto: this.key_proto.as_session(...args)}) }

, with_hmac(u8_key) {
    const {hmac_sign} = this._hmac(u8_key);
    return this._clone({
      _kdf1_ref: (async ( u8_key, kctx ) =>
        this._kdf1_ref(await hmac_sign(u8_key), kctx) ) }) } });


function bind_ecdsa_key_proto(kw_cfg) {
  return {
    ... bind_ecdsa_basic()
  , ... bind_ecdsa_codec(kw_cfg)} }


function bind_ecdsa_basic() {
  return {
    ciphered: false
  , k21pair() {return [this.k2loc, this.k1ref]}

  , encode_utf8(utf8) {
      return this.encode_content(utf8_to_u8(utf8))}

  , async decode_utf8(record) {
      const u8 = await this.decode_content(record);
      if (undefined !== u8) {
        return u8_to_utf8(u8)} }

  , async encode_content(u8) {
      const {k1ref, k2loc} = this;
      if (k1ref && k2loc) {
        return await this._pack_opaque({
          c:u8, l:k2loc}) } }

  , async decode_content(record) {
      const {k1ref, k2loc, _kdf_secret} = this;
      if (record && k1ref && k2loc) {
        const {c:u8} = await this._unpack_opaque(record) || {};
        return u8} } } }



function bind_ecdsa_codec({kdf_ec, ecdsa_signer, ecdsa_verify}) {
  async function do_kctx_ec(kctx, ec_sign) {
    kctx._ec_sign = ec_sign;
    kctx.ec = await ec_sign.ec;
    kctx.k_ec = await kdf_ec(kctx.ec);
    return kctx}

  return {
    async validate(record) {
      if (record) {
        const res = await this._unpack_opaque(record);
        return undefined !== res} }


  , async _pack_opaque(obj_body) {
      const {_ec_sign, _codec: {encode}} = this;

      obj_body.e = await _ec_sign.ec;
      const body = encode(obj_body);
      const {sig} = await _ec_sign(body);

      return encode({z:sig, b:body}) }


  , async _unpack_opaque(record) {
      const {k2loc, _codec: {decode}} = this;
      let obj_sig;
      try {obj_sig = decode(record);}
      catch (err) {return }// ignore decoding error

      const {z:sig, b:body} = obj_sig;

      let obj_body;
      try {obj_body = decode(body);}
      catch (err) {return }// ignore decoding error

      const {e: ec, l: _k2loc} = obj_body;
      if (! u8_fast_equal(k2loc, _k2loc) ) {
        return}

      try {
        if (! u8_test_aaab(_k2loc, await kdf_ec(ec)) ) {
          return}

        if (! await ecdsa_verify({ec, sig}, body) ) {
          return} }
      catch (err) {return }// ignore verify errors

      return obj_body}

  , _codec: opaque_shared_codec
  , _init_eckey: (is_new, kctx) =>
      do_kctx_ec(kctx, ecdsa_signer())

  , as_session(ec_sign) {
      if (! ec_sign) {
        ec_sign = ecdsa_signer();}

      return {__proto__: this,
        as_session: null
      , _init_eckey: (is_new, kctx) =>
          do_kctx_ec(kctx, ec_sign) } } } }


function u8_mix_aaab(a, b) {
  const alen = a.length, blen = b.length;
  for (let i=3; i<alen; i+=4) {
    a[i] = b[i % blen];}
  return a}

function u8_test_aaab(a, b) {
  const alen = a.length, blen = b.length;
  for (let i=3; i<alen; i+=4) {
    if (a[i] !== b[i % blen]) {
      return false} }
  return true}

const kdf_hmac_phorbas =
  u8_hmac_sha_256('phorbas').hmac_sign;


const opaque_ecdsa_tahoe = Object.freeze({
  ... opaque_ecdsa_basic
, ciphered: true

, key_proto: Object.freeze(
    bind_tahoe_ecdsa({
      cipher: u8_aes_256_gcm
    , kdf_ec: kdf_sha_256
    , ecdsa_signer: u8_ecdsa_sha_256.p521
    , ecdsa_verify: u8_ecdsa_sha_256.verify}) ) });

function bind_tahoe_ecdsa(kw_cfg) {
  return {
    ... bind_tahoe_cipher(kw_cfg.cipher)
  , ... bind_ecdsa_codec(kw_cfg)

  , // 1 of 4 bytes of k1ref are present in k2loc; hash the AES encryption key an additional time
    _kdf_secret: kdf_hmac_phorbas} }

function create_opaque_ecdhe(opaque_base, _ecdh_) {
  const opaque ={
    __proto__: opaque_base
  , ecdh: _ecdh_.ecdh
  , with_ecdh};

  return Object.assign(with_ecdh,{
    with_ecdh, ecdh: _ecdh_.ecdh,
    ciphered: opaque_base.ciphered} )

  async function with_ecdh(ec_other) {
    return opaque.with_hmac(
      await _ecdh_(await ec_other)) } }


function bind_opaque_ecdhe_mirror(opaque) {
  return (async ( ec_other ) => {
    const _ecdh_ = u8_ecdhe.mirror(await ec_other);
    return create_opaque_ecdhe(opaque, _ecdh_)
      .with_ecdh(ec_other)}) }

const opaque_ecdhe_basic = () =>
  create_opaque_ecdhe(
    opaque_basic_hmac,
    u8_ecdhe.p256());

const opaque_ecdhe_basic_mirror =
  bind_opaque_ecdhe_mirror(
    opaque_basic_hmac);

const opaque_ecdhe_tahoe = () =>
  create_opaque_ecdhe(
    opaque_tahoe,
    u8_ecdhe.p521());

const opaque_ecdhe_tahoe_mirror =
  bind_opaque_ecdhe_mirror(
    opaque_tahoe);

export { _bind_ecdhe, _bind_ecdsa, _bind_hmac_sha, _bind_sha_digest, bind_ecdsa_basic, bind_ecdsa_codec, bind_ecdsa_key_proto, bind_opaque_ecdhe_mirror, bind_tahoe_cipher, bind_tahoe_ecdsa, create_opaque_ecdhe, ecc_by_len, hex_to_u8, init_opaque_shared_codec, kdf_hmac_phorbas, kdf_kctx_tail, kdf_key_tail, kdf_random_16, kdf_sha_256, opaque_basic, opaque_basic_api, opaque_basic_hmac, opaque_basic_hmac_api, opaque_core_api, opaque_ecdhe_basic, opaque_ecdhe_basic_mirror, opaque_ecdhe_tahoe, opaque_ecdhe_tahoe_mirror, opaque_ecdsa_basic, opaque_ecdsa_tahoe, opaque_shared_codec, opaque_tahoe, tahoe, opaque_ecdhe_tahoe as tahoe_ecdhe, opaque_ecdhe_tahoe_mirror as tahoe_ecdhe_mirror, tahoe_hmac, u8_aes_256_gcm, u8_aes_256_gcm as u8_aes_gcm, u8_crypto_random, u8_ecdhe, u8_ecdsa_sha_256 as u8_ecdsa, u8_ecdsa_sha_256, u8_ecdsa_sha_384, u8_ecdsa_sha_512, u8_fast_equal, u8_hmac_sha_256 as u8_hmac, u8_hmac_sha_256 as u8_hmac_sha, u8_hmac_sha_256, u8_hmac_sha_384, u8_hmac_sha_512, u8_maybe_utf8, u8_mix_aaab, u8_sha_256, u8_sha_384, u8_sha_512, u8_test_aaab, u8_timing_equal, u8_to_hex, u8_to_utf8, utf8_to_u8 };
//# sourceMappingURL=index.mjs.map
