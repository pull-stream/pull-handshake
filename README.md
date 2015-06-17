# pull-handshake

create handshakes for binary protocols with pull streams.


# example


``` js
var shake = handshake()

//pull some amount of data out of the stream
shake.read(32, function (err, data) {

  //write a response...
  shake.write(new Buffer('hello there'))

  shake.read(32, function (err, data) {
    //get a confirmation,
    //and then attach the application
    var stream = createApplicationStream()
    pull(stream, shake.rest(), stream)
    //shake.rest() returns a duplex binary stream.

  })

})


//shake is itself a duplex pull-stream.
pull(shake, stream, shake)

```

## License

MIT
