# pull-handshake

Make a duplex protocol that starts with a handshake.

Writing duplex protocols are difficult.
(don't get me started on "callback hell", that is nothing)
This module implements the boiler plate for a duplex protocol
where a handshake is exchanged (and calculating the handshake can be async)

The basic outline for the sort of protocol you can build with pull-handshake is as follows:

1. two entities (databases, etc) connect via a stream.
2. each retrives some meta information (asyncly) and sends that to the other side.
3. when each node has both retrived it's own metadata, and recieved the remote data,
   that is compared - and the node determins what data must be sent, and what to do with
   the data that is expected to be received.

``` js
handshake(function (cb) {
  //callback with your metadata
  getMyMetadata(cb)
}, function (me, you) {
  //compare my header with your header and decide what to send.
  var missing = findDifference(me, you)

  //return a duplex pull-stream, that handles both reading and writing.
  return {
    source: createReadStream(missing)
    sink: createWriteStream()
  }
})

```

see [pull-2step-replicate](https://github.com/dominictarr/pull-2step-replicate)
for a working example.


## License

MIT
