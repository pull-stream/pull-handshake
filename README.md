# pull-handshake

Create handshakes for binary protocols with pull streams.

# Example

``` js
var stream = handshake()
var shake = stream.handshake

// Pull some amount of data out of the stream
shake.read(32, function (err, data) {

  // Write a response...
  shake.write(new Buffer('hello there'))

  shake.read(32, function (err, data) {
    // Get a confirmation,
    // and then attach the application
    var stream = createApplicationStream()

    pull(stream, shake.rest(), stream)
    // shake.rest() returns a duplex binary stream.
  })
})

// 'stream' can now be plugged into the other end of the handshake
pull(stream, someRemoteStream, stream)
```

## API

### `const stream = handshake([opts], [callback])`

#### opts

Type: `Object`<br>
Default: `{timeout: 5e3}`

The allowed duration for the handshake to take place.

#### callback

Type: `Function`<br>
Default: `function noop () {}`

This will be called when the handshake completes, or fails. In the case of failure it is called with an `error`.

### `const shake = stream.handshake`

A duplex pull-stream. Also exposes reader and writer functions:
- `read(bytes, cb(err, buf))`
- `write(buf)`

### `shake.rest()`

Returns a duplex binary pull-stream. After the handshake is complete, this can be plugged into whatever inner application or encryption stream you're using.

## License

MIT
