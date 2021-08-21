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

function u8_to_utf8$1(u8) {
  return new TextDecoder('utf-8').decode(u8) }

function utf8_to_u8$1(utf8) {
  return new TextEncoder('utf-8').encode(utf8) }

const u8_maybe_utf8 = u8 =>
  'string' === typeof u8 ? utf8_to_u8$1(u8) : u8;


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

const cbor_break_sym = Symbol('CBOR-break');
const cbor_done_sym = Symbol('CBOR-done');
const cbor_eoc_sym = Symbol('CBOR-EOC');

function cbor_accum(base) {
  return iv => ({
    __proto__: base,
    res: base.init(iv) })}

const cbor_tag ={
  [Symbol.toStringTag]: 'cbor_tag',

  from(tag, body) {
    return {__proto__: this, tag, body}}

, to_cbor_encode(enc_ctx, v) {
    enc_ctx.tag_encode(v.tag, v.body);} };


const cbor_nest ={
  [Symbol.toStringTag]: 'cbor_nest',

  from(body) {
    return {__proto__: this, body}}

, to_cbor_encode(enc_ctx, v) {
    let {body, u8} = v;
    enc_ctx.nest(body, 'body' in v ? null : u8); }

, with_ctx(ctx) {
    let self ={
      __proto__: this
    , decode_cbor() {
        return this.body = ctx
          .from_nested_u8(this.u8)
          .decode_cbor()} };

    return u8 =>({__proto__: self, u8}) } };

Array.from(Array(256),
  (_, v) => v.toString(2).padStart(8, '0'));

Array.from(Array(256),
  (_, v) => v.toString(16).padStart(2, '0'));

function u8_to_utf8(u8) {
  return new TextDecoder('utf-8').decode(u8) }

function utf8_to_u8(utf8) {
  return new TextEncoder('utf-8').encode(utf8) }

function as_u8_buffer(u8) {
  



  if (u8 instanceof Uint8Array) {
    return u8}
  if (ArrayBuffer.isView(u8)) {
    return new Uint8Array(u8.buffer)}
  if (u8 instanceof ArrayBuffer) {
    return new Uint8Array(u8)}
  return Uint8Array.from(u8)}

function u8_concat(parts) {
  let i=0, len=0;
  for (const b of parts) {
    const byteLength = b.byteLength;
    if ('number' !== typeof byteLength) {
      throw new Error("Invalid part byteLength") }
    len += byteLength;}

  const u8 = new Uint8Array(len);
  for (const u8_part of parts) {
    u8.set(u8_part, i);
    i += u8_part.byteLength;}
  return u8}

async function * u8_as_stream(u8) {
  yield as_u8_buffer(u8);}

const _obj_kind_ = Function.call.bind(Object.prototype.toString);
// Like _obj_kind_ = (v) => ({}).toString.call(v) // but using precompiled attribute lookup and zero object allocations

function bind_encode_dispatch(ctx, api) {
  let simple_map, encode_object, lut_types;

  ctx.encode = encode;
  ctx.encode_object = v => encode_object(v, ctx);

  // rebind() binds the following: 
  //   - simple_map, encode_object, lut_types
  //   - '[object Object]' via lut_types.set @ _obj_kind_({}), encode_object
  api.rebind = rebind;
  return

  function rebind(host) {
    Object.defineProperties(ctx,{
      host: {value: host}} );

    simple_map = host._simple_map;
    lut_types = new Map(lut_common_types);

    for (const [k,fn] of host._encoder_map.entries()) {
      if ('string' === typeof k && 'function' === typeof fn) {
        lut_types.set(k, fn); } }

    if (host.bind_encode_object) {
      encode_object = host.bind_encode_object(ctx, lut_types);}

    else if (host.encode_object) {
      encode_object = host.encode_object;}

    if (encode_object) {
      lut_types.set(_obj_kind_({}), encode_object); }
    else encode_object = lut_types.get(_obj_kind_({})); }


  function encode(v) {
    // Lookup table for well-known values directly to CBOR zero-width encodings
    let ev = lut_fast_w0.get(v);
    if (undefined !== ev) {
      ctx.add_w0(ev);
      return}

    // Lookup table for "simple" special instances
    if (undefined !== simple_map) {
      let sv = simple_map.get(v);
      if (undefined !== sv) {
        ctx.simple(sv);
        return} }

    if (undefined !== v.to_cbor_encode) {
      v.to_cbor_encode(ctx, v);
      return}

    let encoder = lut_types.get(_obj_kind_(v));
    if (undefined !== encoder) {
      encoder(v, ctx);
      return}

    // not '[object Object]', but also not handled explicitly. (e.g. [object Date])
    encode_object(v, ctx);} }



// lut_fast_w0 is a lookup table for well-known values directly to CBOR zero-width encodings
const lut_fast_w0 = new Map([
  [ false, 244 ], [ true, 245 ],
  [ null, 246 ], [ undefined, 247 ],

  // pos w0 ints: [ 0, 0 ], [ 1, 1 ], [ 2, 2 ], [ 3, 3 ], [ 4, 4 ], [ 5, 5 ], [ 6, 6 ], [ 7, 7 ], [ 8, 8 ], [ 9, 9 ], [ 10, 10 ], [ 11, 11 ], [ 12, 12 ], [ 13, 13 ], [ 14, 14 ], [ 15, 15 ], [ 16, 16 ], [ 17, 17 ], [ 18, 18 ], [ 19, 19 ], [ 20, 20 ], [ 21, 21 ], [ 22, 22 ], [ 23, 23 ],
  ... Array.from({length:24}, (v,i) => [i, i])

, // neg w0 ints: [ -1, 32 ], [ -2, 33 ], [ -3, 34 ], [ -4, 35 ], [ -5, 36 ], [ -6, 37 ], [ -7, 38 ], [ -8, 39 ], [ -9, 40 ], [ -10, 41 ], [ -11, 42 ], [ -12, 43 ], [ -13, 44 ], [ -14, 45 ], [ -15, 46 ], [ -16, 47 ], [ -17, 48 ], [ -18, 49 ], [ -19, 50 ], [ -20, 51 ], [ -21, 52 ], [ -22, 53 ], [ -23, 54 ], [ -24, 55 ]
  ... Array.from({length:24}, (v,i) => [-i-1, 32+i]) ]);


// floating point encodings
const cu8_f32_nan = new Uint8Array([0xfa, 0x7f, 0xc0, 0, 0]);
const cu8_f32_neg_zero = new Uint8Array([0xfa, 0x80, 0, 0, 0]);
const lut_fp_raw = new Map([
  [-0, cu8_f32_neg_zero]
, [NaN, cu8_f32_nan]
, [Infinity, new Uint8Array([0xfa, 0x7f, 0x80, 0, 0])]
, [-Infinity, new Uint8Array([0xfa, 0xff, 0x80, 0, 0])] ]);


function encode_number(v, ctx) {
  if (! Number.isSafeInteger(v)) {
    const raw = lut_fp_raw.get(v);
    if (undefined === raw) {
      // floating point or very large numbers
      ctx.float64(v);}

    else {
      ctx.raw_frame(raw);} }

  else if (v > 0) {
    // pos int
    ctx.add_int(0x00, v);}

  else if (v < 0) {
    // neg int
    ctx.add_int(0x20, -1 - v);}

  else if (Object.is(-0, v)) {
    // negative zero; does not play well with identity or Map() lookup
    ctx.raw_frame(cu8_f32_neg_zero); }

  else {
    // int zero
    ctx.add_w0(0);} }


function use_encoder_for(lut_types, example, encoder) {
  let kind = _obj_kind_(example);
  lut_types.set( kind, encoder );
  return kind}


const lut_common_types = bind_builtin_types(new Map());

function bind_builtin_types(lut_types) {
  use_encoder_for(lut_types, NaN, (v, ctx) => {ctx.raw_frame(cu8_f32_nan);} );
  use_encoder_for(lut_types, undefined, (v, ctx) => {ctx.add_w0(0xf7);} );
  use_encoder_for(lut_types, null, (v, ctx) => {ctx.add_w0(0xf6);} );
  use_encoder_for(lut_types, true, (v, ctx) => {ctx.add_w0(v ? 0xf5 : 0xf4);} );
  use_encoder_for(lut_types, 'utf8', (v, ctx) => {ctx.add_utf8(v);} );
  use_encoder_for(lut_types, 42, encode_number);
  use_encoder_for(lut_types, 42.1, encode_number);
  use_encoder_for(lut_types, [], (v, ctx) => {ctx.array(v);} );
  use_encoder_for(lut_types, {}, (v, ctx) => {ctx.object_pairs(v);} );

  use_encoder_for(lut_types, parseInt, (() => {} ) );
  use_encoder_for(lut_types, Symbol.iterator, (() => {} ) );


   {// ArrayBuffer and friends
    const ab = new ArrayBuffer(0);
    function encode_bytes(v, ctx) {ctx.add_bytes(v);}
    use_encoder_for(lut_types, ab, encode_bytes);

    for (const ArrayDataKlass of [
        Int8Array, Uint8Array, Uint8ClampedArray,
        Int16Array, Uint16Array, Int32Array, Uint32Array,
        Float32Array, Float64Array, DataView] ) {

      use_encoder_for(lut_types, new ArrayDataKlass(ab), encode_bytes); } }

  return lut_types}

const W1=24, W2=25, W4=26, W8=27; 

const ctx_prototype = bind_ctx_prototype();

function bind_ctx_prototype() {
  return {
    __proto__: null,

    // encode(v) -- installed in bind_encode_dispatch (./jump.jsy)
    // encode_object(v) -- installed in bind_encode_dispatch (./jump.jsy)

    // raw_frame,
    // add_w0, add_w1, add_int,
    // add_bytes, add_utf8, add_buffer,
    // float16_short, float32 float64

    simple(v) {
      // RFC 8949 Simple Values; CBOR Simple Values Registry
      if (v < 24) {
        this.add_w0(0xe0 | v);}
      else if (v <= 0xff) {
        this.add_w1(0xf8, v);}
      else throw new Error(`Invalid simple value: ${v}`) }

  , tag_encode(tag, value) {
      const end_tag = this.tag(tag);
      this.encode(value);
      return end_tag()}

  , tag_encode_object(tag, value) {
      const end_tag = this.tag(tag);
      this.encode_object(value);
      return end_tag()}

  , tag(tag, with_tag) {
      if (true === tag) {tag = 0xd9f7; }// CBOR tag
      this.add_int(0xc0, tag);
      return with_tag || this.host.with_tag(tag)}

  , nest(v, u8) {
      if (! u8) {
        u8 = this.cbor_encode(v);}
      const end_tag = this.tag(24);
      this.add_buffer(0x40, u8);
      return end_tag()}

  , bytes_stream(iterable) {
      const {add_w0, add_bytes} = this;
      add_w0(0x5f); // bytes stream
      for (const v of iterable) {
        add_bytes(v);}
      add_w0(0xff); }// break

  , utf8_stream(iterable) {
      const {add_w0, add_utf8} = this;
      add_w0(0x7f); // utf8 stream
      for (const v of iterable) {
        add_utf8(v);}
      add_w0(0xff); }// break


  , array(arr) {
      const {add_int, encode} = this;
      const len = arr.length;
      add_int(0x80, len);

      for (let i=0; i<len; i++) {
        encode(arr[i]);} }

  , list(iterable, count) {
      const {add_int, encode} = this;
      add_int(0x80, count);

      for (const v of iterable) {
        encode(v);

        if (0 >= count --) {
          return} } }

  , list_stream(iterable) {
      const {add_w0, encode} = this;
      add_w0(0x9f); // list stream

      for (const v of iterable) {
        encode(v);}

      add_w0(0xff); }// break


  , object_pairs(v) {
      const {add_int, encode} = this;
      const ns = Object.entries(v);
      const count = ns.length;

      add_int(0xa0, count);
      for (let i=0; i<count; i++) {
        const e = ns[i];
        encode(e[0]);
        encode(e[1]);} }


  , pairs(iterable, count) {
      const {add_int, encode} = this;
      add_int(0xa0, count);

      for (const e of iterable) {
        encode(e[0]);
        encode(e[1]);

        if (0 >= count --) {
          return} } }

  , pair_stream(iterable) {
      const {add_w0, encode} = this;
      add_w0(0xbf); // map stream

      for (const e of iterable) {
        encode(e[0]);
        encode(e[1]);}

      add_w0(0xff); } } }// break



function bind_encoder_context(stream) {
  let idx_frame = 0, idx_next = 0;
  if (null == stream) {
    stream = u8concat_outstream();}
  else if (!stream.flush && stream[Symbol.asyncIterator]) {
    stream = aiter_outstream(stream);}

  const block_size = stream.block_size || 65536;
  const u8_tip = new Uint8Array(block_size);
  const dv_tip = new DataView(u8_tip.buffer);

  const ctx ={
    __proto__: ctx_prototype
  , raw_frame
  , cbor_encode

  , add_w0(bkind) {
      next_frame(bkind, 1);}

  , add_w1(bkind, v8) {
      u8_tip[ next_frame(bkind, 2) ] = v8;}

  , add_int
  , add_bytes
  , add_utf8
  , add_buffer

  , float16_short(u16) {
      dv_tip.setUint16(next_frame(0xf9, 3), v); }

  , float32(v) {
      dv_tip.setFloat32(next_frame(0xfa, 5), v); }

  , float64(v) {
      dv_tip.setFloat64(next_frame(0xfb, 9), v); } };


  bind_encode_dispatch(ctx, cbor_encode);
  return cbor_encode

  function cbor_encode(v, opt) {
    if (undefined === opt || null === opt) {
      ctx.encode(v);}
    else if (true === opt || 'number' === typeof opt) {
      ctx.tag_encode(opt, v);}
    else if (opt.tag) {
      ctx.tag_encode(opt.tag, v);}

    // flush complete cbor_encode op
    if (idx_next === 0) {
      return stream.flush(null)}

    const blk = u8_tip.slice(0, idx_next);
    idx_frame = idx_next = 0;
    return stream.flush(blk)}




  function add_int(mask, v) {
    if (v <= 0xffff) {
      if (v < 24) {// tiny
        next_frame(mask | v, 1);}

      else if (v <= 0xff) {
        u8_tip[ next_frame(mask | W1, 2) ] = v;}

      else {
        dv_tip.setUint16(next_frame(mask | W2, 3), v); } }

    else if (v <= 0xffffffff) {
      dv_tip.setUint32(next_frame(mask | W4, 5), v); }

    else {
      const idx = next_frame(mask | W8, 9);

      const v_hi = (v / 0x100000000) | 0;
      dv_tip.setUint32(idx, v_hi);

      const v_lo = v & 0xffffffff;
      dv_tip.setUint32(4+idx, v_lo);
      return} }

  function add_bytes(v) {
    add_buffer(0x40, as_u8_buffer(v)); }

  function add_utf8(v) {
    add_buffer(0x60, utf8_to_u8(v)); }

  function add_buffer(mask, buf) {
    add_int(mask, buf.byteLength);
    raw_frame(buf);}


  // block paging

  function next_frame(bkind, frameWidth) {
    idx_frame = idx_next; idx_next += frameWidth;
    if (idx_next > block_size) {
      stream.write(u8_tip.slice(0, idx_frame));
      idx_frame = 0;
      idx_next = frameWidth;}

    u8_tip[idx_frame] = bkind;
    return 1 + idx_frame}


  function raw_frame(buf) {
    const len = buf.byteLength;
    idx_frame = idx_next; idx_next += len;
    if (idx_next <= block_size) {
      u8_tip.set(buf, idx_frame);
      return}

    if (0 !== idx_frame) {
      stream.write(u8_tip.slice(0, idx_frame)); }

    idx_frame = idx_next = 0;
    stream.write(buf); } }



function u8concat_outstream() {
  let blocks = [];
  return {
    write(blk) {blocks.push(blk);}
  , flush(blk) {
      if (0 === blocks.length) {
        return blk}

      if (null !== blk) {
        blocks.push(blk);}
      const u8 = u8_concat(blocks);
      blocks = [];
      return u8} } }


function aiter_outstream(aiter_out) {
  let _x_tail;
  return {
    write(blk) {
      _x_tail = aiter_out.next(blk);}

  , async flush(blk) {
      let tail = (null !== blk)
        ? aiter_out.next(blk)
        : _x_tail;

      _x_tail = null;
      return await tail} } }

class CBOREncoderBasic {
  static get create() {
    return stream => new this(stream)}
  static get encode() {
    return new this().encode}
  static get encode_stream() {
    return stream => new this(stream).encode}

  constructor(stream) {
    this.encode = bind_encoder_context(stream);
    this.rebind();}

  rebind() {
    this.encode.rebind(this);
    return this}

  with_tag(tag) {return noop}

  encoder_map() {
    if (! Object.hasOwnProperty(this, '_encoder_map')) {
      this._encoder_map = new Map(this._encoder_map);
      this.rebind();}
    return this._encoder_map}

  simple_map() {
    if (! Object.hasOwnProperty(this, '_simple_map')) {
      this._simple_map = new Map(this._simple_map);
      this.rebind();}
    return this._simple_map}

  with_encoders(fn_block, skip_rebind) {
    let enc_map = this._encoder_map = new Map(this._encoder_map);
    let add_encoder = use_encoder_for.bind(null, enc_map);
    fn_block(add_encoder, this);
    return skip_rebind ? this
      : this.rebind()} }


CBOREncoderBasic.prototype._encoder_map = new Map();
function noop() {}

class CBOREncoder extends CBOREncoderBasic {}

CBOREncoder.prototype.with_encoders(basic_tag_encoders, true);



function basic_tag_encoders(add_encoder) {
  // tag 1 -- Date
  add_encoder(new Date(), (v, ctx) => {
    const end_tag = ctx.tag(1);
    ctx.float64(v / 1000.);
    end_tag();} );

  // tag 32 -- URIs
  add_encoder(new URL('ws://h'), (v, ctx) => {
    const end_tag = ctx.tag(32);
    ctx.add_utf8(v.toString());
    end_tag();} );

  // tag 258 -- Sets (explicit type)
  add_encoder(new Set(), (v, ctx) => {
    const end_tag = ctx.tag(258);
    ctx.list(v, v.size);
    end_tag();} );

  // tag 259 -- Maps (explicit type)
  add_encoder(new Map(), (v, ctx) => {
    const end_tag = ctx.tag(259);
    ctx.pairs(v.entries(), v.size);
    end_tag();} ); }

const {encode, encode_stream} = CBOREncoder;

class CBORDecoderBase {
  // Possible monkeypatch apis responsibilities:
  //   decode() ::
  //   *iter_decode() ::
  //   async decode_stream() ::
  //   async * aiter_decode_stream() ::

  static options(options) {
    return (class extends this {})
      .compile(options)}

  static compile(options) {
    this.prototype.compile(options);
    return this}

  constructor(options) {
    if (null != options) {
      this.compile(options);}

    this._U8Ctx_.bind_decode_api(this);}

  compile(options) {
    this.jmp = this._bind_cbor_jmp(options, this.jmp);

    if (options.types) {
      this.types = Object.assign(
        Object.create(this.types || null),
        options.types); }

    this._U8Ctx_ = this._bind_u8ctx(
      this.types, this.jmp, options.unknown);
    return this} }

const decode_types ={
  __proto__: null

, u32(u8, idx) {
    const u32 = (u8[idx] << 24) | (u8[idx+1] << 16) | (u8[idx+2] << 8) | u8[idx+3];
    return u32 >>> 0 }// unsigned int32

, u64(u8, idx) {
    const v_hi = (u8[idx] << 24) | (u8[idx+1] << 16) | (u8[idx+2] << 8) | u8[idx+3];
    const v_lo = (u8[idx+4] << 24) | (u8[idx+5] << 16) | (u8[idx+6] << 8) | u8[idx+7];
    const u64 = (v_lo >>> 0) + 0x100000000*(v_hi >>> 0);
    return u64}

, float16(u8) {
    return {'@f2': u8}}
, float32(u8, idx=u8.byteOffset) {
    return new DataView(u8.buffer, idx, 4).getFloat32(0)}
, float64(u8, idx=u8.byteOffset) {
    return new DataView(u8.buffer, idx, 8).getFloat64(0)}

, bytes(u8) {return u8}
, bytes_stream:
    cbor_accum({
      init: () => []
    , accum: _res_push
    , done: res => u8_concat(res)})

, utf8(u8) {return u8_to_utf8(u8)}
, utf8_stream:
    cbor_accum({
      init: () => []
    , accum: _res_push
    , done: res => res.join('')})


, list:
    cbor_accum({
      init: () => []
    , accum: _res_attr})

, list_stream() {
    return this.list()}


, map:
    cbor_accum({
      init: () => ({})
    , accum: _res_attr})

, map_stream() {
    return this.map()} };


function _res_push(res,i,v) {res.push(v);}
function _res_attr(res,k,v) {res[k] = v;}

const decode_Map ={
  map:
    cbor_accum({
      init: () => new Map()
    , accum: (res, k, v) => res.set(k, v)}) };

const decode_Set ={
  list:
    cbor_accum({
      init: () => new Set()
    , accum: (res, i, v) => res.add(v)}) };

function basic_tags(tags_lut) {
  // from https://tools.ietf.org/html/rfc7049#section-2.4

  // Standard date/time string; see Section 2.4.1
  tags_lut.set(0, () => ts_sz => new Date(ts_sz));
  // Epoch-based date/time; see Section 2.4.1
  tags_lut.set(1, () => seconds => new Date(seconds * 1000));

  // Positive bignum; see Section 2.4.2
  // tags_lut.set @ 2, () => v => v

  // Negative bignum; see Section 2.4.2
  // tags_lut.set @ 3, () => v => v

  // Decimal fraction; see Section 2.4.3
  // tags_lut.set @ 4, () => v => v

  // Bigfloat; see Section 2.4.3
  // tags_lut.set @ 5, () => v => v

  // Expected conversion to base64url encoding; see Section 2.4.4.2
  // tags_lut.set @ 21, () => v => v

  // Expected conversion to base64 encoding; see Section 2.4.4.2
  // tags_lut.set @ 22, () => v => v

  // Expected conversion to base16 encoding; see Section 2.4.4.2
  // tags_lut.set @ 23, () => v => v

  // Encoded CBOR data item; see Section 2.4.4.1
  tags_lut.set(24, ctx => cbor_nest.with_ctx(ctx));

  // URI; see Section 2.4.4.3
  tags_lut.set(32, () => url_sz => new URL(url_sz));

  // base64url; see Section 2.4.4.3
  //tags_lut.set @ 33, () => v => v

  // base64; see Section 2.4.4.3
  //tags_lut.set @ 34, () => v => v

  // Regular expression; see Section 2.4.4.3
  //tags_lut.set @ 35, () => v => v

  // MIME message; see Section 2.4.4.3
  //tags_lut.set @ 36, () => v => v

  // Self-describe CBOR; see Section 2.4.5
  tags_lut.set(55799, () => {});


  // EXTENSIONS

  // CBOR Sets https://github.com/input-output-hk/cbor-sets-spec/blob/master/CBOR_SETS.md
  tags_lut.set(258, ctx => { ctx.use_overlay(decode_Set); });

  // CBOR Maps https://github.com/shanewholloway/js-cbor-codec/blob/master/docs/CBOR-256-spec--explicit-maps.md
  tags_lut.set(259, ctx => { ctx.use_overlay(decode_Map); });

  return tags_lut}

class U8DecodeBaseCtx {

  static subclass(types, jmp, unknown) {
    class U8DecodeCtx_ extends this {}
    let {prototype} = U8DecodeCtx_;
    prototype.next_value = U8DecodeCtx_.bind_next_value(jmp, unknown);
    prototype.types = types;
    return U8DecodeCtx_}


  from_nested_u8(u8) {
    return this.constructor
      .from_u8(u8, this.types)}


  use_overlay(overlay_types) {
    let {types, _apply_overlay, _overlay_noop} = this;

    if (_overlay_noop === _apply_overlay) {
      _apply_overlay = () => {
        this.types = types;}; }

    this._apply_overlay = (() => {
      this._apply_overlay = _apply_overlay;
      this.types = overlay_types;} );
    return types}

  _error_unknown(ctx, type_b) {
    throw new Error(`No CBOR decorder regeistered for ${type_b} (0x${('0'+type_b.toString(16)).slice(-2)})`) }

  _overlay_noop() {}

  // Subclass responsibilities:
  //   static bind_decode_api(decoder)
  //   static bind_next_value(jmp, unknown) ::
  //   move(count_bytes) ::

  // Possible Subclass responsibilities:
  //   decode_cbor() ::
  //   *iter_decode_cbor() ::
  //   async decode_cbor() ::
  }//   async * aiter_decode_cbor() ::

class U8SyncDecodeCtx extends U8DecodeBaseCtx {
  static bind_decode_api(decoder) {
    decoder.decode = u8 =>
      this.from_u8(u8, decoder.types)
        .decode_cbor();

    decoder.iter_decode = u8 =>
      this.from_u8(u8, decoder.types)
        .iter_decode_cbor();}


  static get from_u8() {
    const inst0 = new this();

    return (u8, types) => {
      u8 = as_u8_buffer(u8);
      const inst ={
        __proto__: inst0
      , idx: 0, u8
      , _apply_overlay: inst0._overlay_noop};

      if (types && types !== inst0.types) {
        inst.types = types;}
      return inst} }


  static bind_next_value(jmp, unknown) {
    if (null == unknown) {
      unknown = this._error_unknown;}

    return function next_value() {
      const doneTypes = this._apply_overlay();

      const type_b = this.u8[ this.idx ++ ];
      if (undefined === type_b) {
        this.idx--;
        throw cbor_done_sym}

      const decode = jmp[type_b] || unknown;
      const res = decode(this, type_b);

      return undefined === doneTypes
        ? res : doneTypes(res)} }


  decode_cbor() {
    try {
      return this.next_value()}
    catch (e) {
      throw cbor_done_sym !== e ? e
        : new Error(`End of content`) } }


  *iter_decode_cbor() {
    try {
      while (1) {
        yield this.next_value();} }
    catch (e) {
      if (cbor_done_sym !== e) {
        throw e} } }


  move(count_bytes) {
    const {idx, byteLength} = this;
    const idx_next = idx + count_bytes;
    if (idx_next >= byteLength) {
      throw cbor_eoc_sym}
    this.idx = idx_next;
    return idx} }

const _cbor_jmp_base ={
  bind_jmp(options, jmp) {
    jmp = jmp ? jmp.slice()
      : this.bind_basics_dispatch( new Map() );

    if (null == options) {
      options = {};}

    if (options.simple) {
      this.bind_jmp_simple(options, jmp);}

    if (options.tags) {
      this.bind_jmp_tag(options, jmp);}
    return jmp}

, bind_jmp_simple(options, jmp) {
    if (options.simple) {
      const as_simple_value = this.bind_simple_dispatch(options.simple);
      const tiny_simple = this.cbor_tiny(as_simple_value);

      for (let i=0xe0; i<= 0xf3; i++) {
        jmp[i] = tiny_simple;}

      jmp[0xf8] = this.cbor_w1(as_simple_value);}
    return jmp}


, bind_jmp_tag(options, jmp) {
    if (options.tags) {
      const as_tag = this.bind_tag_dispatch(
        this.build_tags_lut(options.tags));
      const tiny_tag = this.cbor_tiny(as_tag);

      for (let i=0xc0; i<= 0xd7; i++) {
        jmp[0xc0 | i] = tiny_tag;}

      jmp[0xd8] = this.cbor_w1(as_tag);
      jmp[0xd9] = this.cbor_w2(as_tag);
      jmp[0xda] = this.cbor_w4(as_tag);
      jmp[0xdb] = this.cbor_w8(as_tag);}

    return jmp}


, bind_basics_dispatch(tags_lut) {
    this.bind_tag_dispatch(tags_lut);

    const tiny_pos_int = this.cbor_tiny(this.as_pos_int);
    const tiny_neg_int = this.cbor_tiny(this.as_neg_int);
    const tiny_bytes = this.cbor_tiny(this.as_bytes);
    const tiny_utf8 = this.cbor_tiny(this.as_utf8);
    const tiny_list = this.cbor_tiny(this.as_list);
    const tiny_map = this.cbor_tiny(this.as_map);
    const tiny_tag = this.cbor_tiny(this.as_tag);
    const tiny_simple_repr = this.cbor_tiny(this.as_simple_repr);

    const jmp = new Array(256);

    for (let i=0; i<= 23; i++) {
      jmp[0x00 | i] = tiny_pos_int;
      jmp[0x20 | i] = tiny_neg_int;
      jmp[0x40 | i] = tiny_bytes;
      jmp[0x60 | i] = tiny_utf8;
      jmp[0x80 | i] = tiny_list;
      jmp[0xa0 | i] = tiny_map;
      jmp[0xc0 | i] = tiny_tag;
      jmp[0xe0 | i] = tiny_simple_repr;}


    const cbor_widths =[
      this.cbor_w1,
      this.cbor_w2,
      this.cbor_w4,
      this.cbor_w8];

    for (let w=0; w< 4; w++) {
      const i = 24+w, cbor_wN = cbor_widths[w];
      jmp[0x00 | i] = cbor_wN(this.as_pos_int);
      jmp[0x20 | i] = cbor_wN(this.as_neg_int);
      jmp[0x40 | i] = cbor_wN(this.as_bytes);
      jmp[0x60 | i] = cbor_wN(this.as_utf8);
      jmp[0x80 | i] = cbor_wN(this.as_list);
      jmp[0xa0 | i] = cbor_wN(this.as_map);
      jmp[0xc0 | i] = cbor_wN(this.as_tag);}


    // streaming data types
    jmp[0x5f] = ctx => this.as_stream(ctx, ctx.types.bytes_stream());
    jmp[0x7f] = ctx => this.as_stream(ctx, ctx.types.utf8_stream());
    jmp[0x9f] = ctx => this.as_stream(ctx, ctx.types.list_stream());
    jmp[0xbf] = ctx => this.as_pair_stream(ctx, ctx.types.map_stream());

    // semantic tag

    // primitives
    jmp[0xf4] = () => false;
    jmp[0xf5] = () => true;
    jmp[0xf6] = () => null;
    jmp[0xf7] = () => {}; // undefined
    jmp[0xf8] = this.cbor_w1(this.as_simple_repr);
    jmp[0xf9] = this.as_float16;
    jmp[0xfa] = this.as_float32;
    jmp[0xfb] = this.as_float64;
    //jmp[0xfc] = undefined
    //jmp[0xfd] = undefined
    //jmp[0xfe] = undefined
    jmp[0xff] = () => cbor_break_sym;

    return jmp}


, // simple values

  as_pos_int: (ctx, value) => value,
  as_neg_int: (ctx, value) => -1 - value,
  as_simple_repr: (ctx, key) => `simple(${key})`,

  bind_simple_dispatch(simple_lut) {
    if ('function' !== typeof simple_lut.get) {
      throw new TypeError('Expected a simple_value Map') }

    return (ctx, key) => simple_lut.get(key)}


, build_tags_lut(tags) {
    let lut = new Map();

    let q = [tags];
    while (0 !== q.length) {
      let tip = q.pop();

      if (true === tip) {
        tip = basic_tags;}

      if (Array.isArray(tip)) {
        q.push(... tip);}

      else if (tip.from_cbor_decode) {
        tip.from_cbor_decode(lut, cbor_accum);}

      else if ('function' === typeof tip) {
        tip(lut, cbor_accum);}

      else {
        for (let [k,v] of tip.entries()) {
          lut.set(k,v);} } }

    return lut}


, // Subclass responsibility: cbor size/value interpreters
  //   cbor_tiny(as_type) :: return function w0_as(ctx, type_b) ::
  //   cbor_w1(as_type) :: return function w1_as(ctx) ::
  //   cbor_w2(as_type) :: return function w2_as(ctx) ::
  //   cbor_w4(as_type) :: return function w4_as(ctx) ::
  //   cbor_w8(as_type) :: return function w8_as(ctx) ::

  // Subclass responsibility: basic types
  //   as_bytes(ctx, len) ::
  //   as_utf8(ctx, len) ::
  //   as_list(ctx, len) ::
  //   as_map(ctx, len) ::

  // Subclass responsibility: streaming types
  //   as_stream(ctx, accum) ::
  //   as_pair_stream(ctx, accum) ::

  // Subclass responsibility: floating point primitives
  //   as_float16(ctx) :: return ctx.types.float16(...)
  //   as_float32(ctx) ::
  //   as_float64(ctx) ::


  // Subclass responsibility: tag values
  };// bind_tag_dispatch(tags_lut) ::

const _cbor_jmp_sync ={
  __proto__: _cbor_jmp_base

, // cbor size/value interpreters
  cbor_tiny(as_type) {
    return function w0_as(ctx, type_b) {
      return as_type(ctx, type_b & 0x1f) } }

, cbor_w1(as_type) {
    return function w1_as(ctx) {
      const idx = ctx.move(1);
      return as_type(ctx, ctx.u8[idx]) } }

, cbor_w2(as_type) {
    return function w2_as(ctx) {
      const u8 = ctx.u8, idx = ctx.move(2);
      return as_type(ctx, (u8[idx] << 8) | u8[idx+1]) } }

, cbor_w4(as_type) {
    return function w4_as(ctx) {
      const u8 = ctx.u8, idx = ctx.move(4);
      return as_type(ctx, ctx.types.u32(u8, idx)) } }

, cbor_w8(as_type) {
    return function w8_as(ctx) {
      const u8 = ctx.u8, idx = ctx.move(8);
      return as_type(ctx, ctx.types.u64(u8, idx)) } }


, // basic types

  as_bytes(ctx, len) {
    const u8 = ctx.u8, idx = ctx.move(len);
    return ctx.types.bytes(
      u8.subarray(idx, idx + len)) }

, as_utf8(ctx, len) {
    const u8 = ctx.u8, idx = ctx.move(len);
    return ctx.types.utf8(
      u8.subarray(idx, idx + len)) }

, as_list(ctx, len) {
    const {res, accum, done} = ctx.types.list(len);
    for (let i=0; i<len; i++) {
      accum(res, i, ctx.next_value()); }

    return undefined !== done ? done(res) : res}

, as_map(ctx, len) {
    const {res, accum, done} = ctx.types.map(len);
    for (let i=0; i<len; i++) {
      const key = ctx.next_value();
      const value = ctx.next_value();
      accum(res, key, value); }

    return undefined !== done ? done(res) : res}


, // streaming

  as_stream(ctx, {res, accum, done}) {
    let i = 0;
    while (true) {
      const value = ctx.next_value();
      if (cbor_break_sym === value) {
        return undefined !== done ? done(res) : res}

      accum(res, i++, value); } }

, as_pair_stream(ctx, {res, accum, done}) {
    while (true) {
      const key = ctx.next_value();
      if (cbor_break_sym === key) {
        return undefined !== done ? done(res) : res}

      accum(res, key, ctx.next_value()); } }


, // floating point primitives

  as_float16(ctx) {
    const u8 = ctx.u8, idx = ctx.move(2);
    return ctx.types.float16(
      u8.subarray(idx, idx+2)) }

, as_float32(ctx) {
    const u8 = ctx.u8, idx = ctx.move(4);
    return ctx.types.float32(u8, idx)}

, as_float64(ctx) {
    const u8 = ctx.u8, idx = ctx.move(8);
    return ctx.types.float64(u8, idx)}


, // tag values

  bind_tag_dispatch(tags_lut) {
    if ('function' !== typeof tags_lut.get) {
      throw new TypeError('Expected a tags Map') }

    return function(ctx, tag) {
      const tag_handler = tags_lut.get(tag);
      if (tag_handler) {
        let res = tag_handler(ctx, tag);
        if ('object' === typeof res) {
          return res.custom_tag(ctx, tag)}

        const body = ctx.next_value();
        return undefined === res ? body : res(body)}

      return cbor_tag.from(tag, ctx.next_value())} } };

class CBORDecoderBasic extends CBORDecoderBase {
  // decode(u8) ::
  static get decode() {
    return new this().decode}

  // *iter_decode(u8) ::
  static get iter_decode() {
    return new this().iter_decode}

  _bind_cbor_jmp(options, jmp) {
    return _cbor_jmp_sync.bind_jmp(options, jmp)}

  _bind_u8ctx(types, jmp, unknown) {
    return (this.U8DecodeCtx || U8SyncDecodeCtx)
      .subclass(types, jmp, unknown)} }

CBORDecoderBasic.compile({
  types: decode_types});


class CBORDecoder extends CBORDecoderBasic {}

CBORDecoder.compile({
  types: decode_types,
  tags: [true] /* [true] is an alias for [basic_tags] built-in  */});

const {decode, iter_decode} = new CBORDecoder();

async function * _aiter_move_stream(u8_stream) {
  let n = yield;
  let i0=0, i1=n;
  let u8_tail;

  if (u8_stream.subarray) {
    // make an iterable of Uint8Array
    u8_stream = [u8_stream];}

  for await (let u8 of u8_stream) {
    u8 = as_u8_buffer(u8);
    if (u8_tail) {
      u8 = u8_concat([u8_tail, u8]);
      u8_tail = void 0;}

    while (i1 <= u8.byteLength) {
      n = yield u8.subarray(i0, i1);
      i0 = i1; i1 += n;}

    u8_tail = i0 >= u8.byteLength ? void 0
      : u8.subarray(i0);
    i0 = 0; i1 = n;} }


class U8AsyncDecodeCtx extends U8DecodeBaseCtx {
  static bind_decode_api(decoder) {
    decoder.decode_stream = (u8_stream) =>
      this.from_u8_stream(u8_stream, decoder.types)
        .decode_cbor();

    decoder.aiter_decode_stream = (u8_stream) =>
      this.from_u8_stream(u8_stream, decoder.types)
        .aiter_decode_cbor();}


  static from_u8(u8, types) {
    return this.from_u8_stream(u8_as_stream(u8), types)}

  static get from_u8_stream() {
    const inst0 = new this();

    return (u8_stream, types) => {
      let u8_aiter = _aiter_move_stream(u8_stream);
      u8_aiter.next(); // prime the async generator

      const inst ={
        __proto__: inst0
      , _apply_overlay: inst0._overlay_noop
      , u8_aiter};

      if (types && types !== inst0.types) {
        inst.types = types;}

      return inst} }

  static bind_next_value(jmp, unknown) {
    if (null == unknown) {
      unknown = this._error_unknown;}

    return async function next_value() {
      const doneTypes = this._apply_overlay();

      const [type_b] = await this.move_stream(1, cbor_done_sym);
      const decode = jmp[type_b] || unknown;
      const res = await decode(this, type_b);

      return undefined === doneTypes
        ? res : await doneTypes(res)} }


  async decode_cbor() {
    try {
      return await this.next_value()}
    catch (e) {
      throw cbor_done_sym !== e ? e
        : new Error(`End of content`) } }


  async *aiter_decode_cbor() {
    try {
      while (1) {
        yield await this.next_value();} }
    catch (e) {
      if (cbor_done_sym !== e) {
        throw e} } }


  async move_stream(count_bytes, eoc_sym=cbor_eoc_sym) {
    let tip = await this.u8_aiter.next(count_bytes);
    if (tip.done) {throw eoc_sym}
    return tip.value} }

const _cbor_jmp_async ={
  __proto__: _cbor_jmp_base

, // cbor size/value interpreters
  cbor_tiny(as_type) {
    return function w0_as(ctx, type_b) {
      return as_type(ctx, type_b & 0x1f) } }

, cbor_w1(as_type) {
    return async function w1_as(ctx) {
      const u8 = await ctx.move_stream(1);
      return as_type(ctx, u8[0]) } }

, cbor_w2(as_type) {
    return async function w2_as(ctx) {
      const u8 = await ctx.move_stream(2);
      return as_type(ctx, (u8[0] << 8) | u8[1]) } }

, cbor_w4(as_type) {
    return async function w4_as(ctx) {
      const u8 = await ctx.move_stream(4);
      return as_type(ctx, ctx.types.u32(u8, 0)) } }

, cbor_w8(as_type) {
    return async function w8_as(ctx) {
      const u8 = await ctx.move_stream(8);
      return as_type(ctx, ctx.types.u64(u8, 0)) } }


, // basic types

  async as_bytes(ctx, len) {
    const u8 = await ctx.move_stream(len);
    return ctx.types.bytes(
      u8.subarray(0, len)) }

, async as_utf8(ctx, len) {
    const u8 = await ctx.move_stream(len);
    return ctx.types.utf8(
      u8.subarray(0, len)) }

, async as_list(ctx, len) {
    const {res, accum, done} = ctx.types.list(len);
    for (let i=0; i<len; i++) {
      accum(res, i, await ctx.next_value()); }

    return undefined !== done ? done(res) : res}

, async as_map(ctx, len) {
    const {res, accum, done} = ctx.types.map(len);
    for (let i=0; i<len; i++) {
      const key = await ctx.next_value();
      const value = await ctx.next_value();
      accum(res, key, value); }

    return undefined !== done ? done(res) : res}


, // streaming

  async as_stream(ctx, {res, accum, done}) {
    let i = 0;
    while (true) {
      const value = await ctx.next_value();
      if (cbor_break_sym === value) {
        return undefined !== done ? done(res) : res}

      accum(res, i++, value); } }

, async as_pair_stream(ctx, {res, accum, done}) {
    while (true) {
      const key = await ctx.next_value();
      if (cbor_break_sym === key) {
        return undefined !== done ? done(res) : res}

      accum(res, key, await ctx.next_value()); } }


, // floating point primitives

  async as_float16(ctx) {
    return ctx.types.float16(
      await ctx.move_stream(2)) }

, async as_float32(ctx) {
    return ctx.types.float32(
      await ctx.move_stream(4)) }

, async as_float64(ctx) {
    return ctx.types.float64(
      await ctx.move_stream(8)) }


, // tag values

  bind_tag_dispatch(tags_lut) {
    if ('function' !== typeof tags_lut.get) {
      throw new TypeError('Expected a tags Map') }

    return async function as_tag(ctx, tag) {
      const tag_handler = tags_lut.get(tag);
      if (tag_handler) {
        const res = await tag_handler(ctx, tag);
        if ('object' === typeof res) {
          return res.custom_tag(ctx, tag)}

        const body = await ctx.next_value();
        return undefined === res ? body : res(body)}

      return cbor_tag.from(tag, await ctx.next_value())} } };

class CBORAsyncDecoderBasic extends CBORDecoderBase {
  // async decode_stream(u8_stream, opt) ::
  static get decode_stream() {
    return new this().decode_stream}

  // async *aiter_decode_stream(u8_stream, opt) ::
  static get aiter_decode_stream() {
    return new this().aiter_decode_stream}

  _bind_cbor_jmp(options, jmp) {
    return _cbor_jmp_async.bind_jmp(options, jmp)}

  _bind_u8ctx(types, jmp, unknown) {
    return (this.U8DecodeCtx || U8AsyncDecodeCtx)
      .subclass(types, jmp, unknown)} }

CBORAsyncDecoderBasic.compile({
  types: decode_types});


class CBORAsyncDecoder extends CBORAsyncDecoderBasic {}

CBORAsyncDecoder.compile({
  types: decode_types,
  tags: [true] /* [true] is an alias for [basic_tags] built-in  */});

new CBORAsyncDecoder();

const opaque_shared_codec ={
  encode: encode,
  decode: decode,};

function u8_crypto_random(n) {
  return crypto.getRandomValues(
    new Uint8Array(n)) }

const _import_aes_gcm_raw = aeskey =>
  crypto.subtle.importKey('raw', aeskey.subarray(-32),
    {name: 'AES-GCM', length: 256}, false, ['encrypt', 'decrypt']);

const u8_aes_256_gcm ={
  async encrypt(raw_content, key_cipher, key_iv) {
    key_cipher = await _import_aes_gcm_raw(key_cipher);
    return new Uint8Array(await crypto.subtle.encrypt(
      {name: 'AES-GCM', tagLength: 128,
          iv: key_iv.subarray(-12) }// IV of 96 bits (12 bytes) 
      , key_cipher, raw_content) ) }

  , async decrypt(enc_content, key_cipher, key_iv, absent) {
    try {
      key_cipher = await _import_aes_gcm_raw(key_cipher);
      return new Uint8Array(await crypto.subtle.decrypt(
        {name: 'AES-GCM', tagLength: 128,
            iv: key_iv.subarray(-12) }// IV of 96 bits (12 bytes) 
        , key_cipher, enc_content) ) }
    catch (err) {
      if (undefined !== absent) {
        return absent}

      err = new AggregateError([err]);
      err.aes_decrypt = true;
      throw err} } };

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

, 


  as_core() {return {
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
, encode_utf8: async utf8 => utf8_to_u8$1(utf8)
, decode_utf8: async u8 => u8_to_utf8$1(u8)};


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
    return this._clone({_kdf1_ref: hmac_sign})}

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
      return this.encipher(utf8_to_u8$1(utf8)) }

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
        return u8_to_utf8$1(u8)} }

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
      _u8_mix_aaab( await kdf_inner(u8_k0), kctx.k_ec );

const kdf_key_tail = kdf_inner =>
    async k1ref =>
      _u8_mix_aaab( await kdf_inner(k1ref), k1ref );


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
      return this.encode_content(utf8_to_u8$1(utf8))}

  , async decode_utf8(u8_record) {
      const u8 = await this.decode_content(u8_record);
      if (undefined !== u8) {
        return u8_to_utf8$1(u8)} }

  , async encode_content(u8) {
      const {k1ref, k2loc} = this;
      if (k1ref && k2loc) {
        return await this._pack_opaque({
          c:u8, l:k2loc}) } }

  , async decode_content(u8_record) {
      const {k1ref, k2loc, _kdf_secret} = this;
      if (u8_record && k1ref && k2loc) {
        const {c:u8} = await this._unpack_opaque(u8_record) || {};
        return u8} } } }



function bind_ecdsa_codec({kdf_ec, ecdsa_signer, ecdsa_verify}) {
  async function do_kctx_ec(kctx, ec_sign) {
    kctx._ec_sign = ec_sign;
    kctx.ec = await ec_sign.ec;
    kctx.k_ec = await kdf_ec(kctx.ec);
    return kctx}

  return {
    async validate(u8_record) {
      if (u8_record) {
        const res = await this._unpack_opaque(u8_record);
        return undefined !== res} }


  , async _pack_opaque(obj_body) {
      const {_ec_sign, _codec: {encode}} = this;

      obj_body.e = await _ec_sign.ec;
      const body = encode(obj_body);
      const {sig} = await _ec_sign(body);

      return encode({z:sig, b:body}) }


  , async _unpack_opaque(u8_record) {
      const {k2loc, _codec: {decode}} = this;
      let obj_sig;
      try {obj_sig = decode(u8_record);}
      catch (err) {return }// ignore decoding error

      const {z:sig, b:body} = obj_sig;

      let obj_body;
      try {obj_body = decode(body);}
      catch (err) {return }// ignore decoding error

      const {e: ec, l: _k2loc} = obj_body;
      if (! u8_fast_equal(k2loc, _k2loc) ) {
        return}

      try {
        if (! _u8_test_aaab( _k2loc, await kdf_ec(ec) )) {
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


function _u8_mix_aaab(a, b) {
  const alen = a.length, blen = b.length;
  for (let i=3; i<alen; i+=4) {
    a[i] = b[i % blen];}
  return a}

function _u8_test_aaab(a, b) {
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

export { _bind_ecdhe, _bind_ecdsa, _bind_hmac_sha, _bind_sha_digest, _u8_mix_aaab, _u8_test_aaab, bind_ecdsa_basic, bind_ecdsa_codec, bind_ecdsa_key_proto, bind_opaque_ecdhe_mirror, bind_tahoe_cipher, bind_tahoe_ecdsa, decode as cbor_decode, encode as cbor_encode, create_opaque_ecdhe, ecc_by_len, hex_to_u8, kdf_hmac_phorbas, kdf_kctx_tail, kdf_key_tail, kdf_random_16, kdf_sha_256, opaque_basic, opaque_basic_api, opaque_basic_hmac, opaque_basic_hmac_api, opaque_core_api, opaque_ecdhe_basic, opaque_ecdhe_basic_mirror, opaque_ecdhe_tahoe, opaque_ecdhe_tahoe_mirror, opaque_ecdsa_basic, opaque_ecdsa_tahoe, opaque_shared_codec, opaque_tahoe, tahoe, opaque_ecdhe_tahoe as tahoe_ecdhe, opaque_ecdhe_tahoe_mirror as tahoe_ecdhe_mirror, tahoe_hmac, u8_aes_256_gcm, u8_aes_256_gcm as u8_aes_gcm, u8_crypto_random, u8_ecdhe, u8_ecdsa_sha_256 as u8_ecdsa, u8_ecdsa_sha_256, u8_ecdsa_sha_384, u8_ecdsa_sha_512, u8_fast_equal, u8_hmac_sha_256 as u8_hmac, u8_hmac_sha_256 as u8_hmac_sha, u8_hmac_sha_256, u8_hmac_sha_384, u8_hmac_sha_512, u8_maybe_utf8, u8_sha_256, u8_sha_384, u8_sha_512, u8_timing_equal, u8_to_hex, u8_to_utf8$1 as u8_to_utf8, utf8_to_u8$1 as utf8_to_u8 };
//# sourceMappingURL=index.mjs.map
