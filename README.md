# pull-handshake

make a duplex protocol with a handshake.

given an async function to retrive some state,


``` js
handshake(function (cb) {
  //get your header
}, function (me, you) {
  //compare my header with your header and decide what to send.
  //return a duplex pull-stream
  return {
    source: ...,
    sink: ...
  }
})

```


## License

MIT
