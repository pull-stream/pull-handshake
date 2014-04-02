
var handshake = require('../')
var pull = require('pull-stream')
var tape = require('tape')
// make a simple handshake for replication.

// in the handshake each side sends a random number,
// and then the side that sent the lowest number 
var a = [1, 7, 3, 5, 2]

function sendAll (set, done) {
  return handshake(function (cb) {
    cb(null, Math.random())
  }, function (me, you) {
    var later
    //if I picked the low number,
    //send my numbers first.
    var iSendFirst = me < you
    console.log('RETURN', me, iSendFirst, you, set)

    return {
      source: 
      iSendFirst ?
          pull.values(set)
        : later = pull.defer()
      ,
      sink: pull.collect(function (err, ary) {
        console.log('collected', ary, set)
        var missing = []
        if(err) return done(err)

        if(!iSendFirst)//recieve items
          later.resolve(pull.values(set.filter(function (e) {
            return !~ary.indexOf(e)
          })))

        ary.forEach(function (e) {
          if(!~set.indexOf(e)) {
            missing.push(e)
            set.push(e)
          }
        })
        done(null, set, missing, ary, iSendFirst)
      })
    }
  })
}

tape('simple protocol - sends', function (t) {
  var set =  [1, 9, 3, 5, 2]
  var n = 2
  function done () {
    t.end()
  }

  var B = sendAll(set, function (err, set, missing, received) {
    t.notOk(err)
    //the total set, once differences have been added.
    t.deepEqual(set, [1, 9, 3, 5, 2, 7, 8])
    //the missing items which where added.
    t.deepEqual(missing, [7, 8], 'missing')
    //the recieved items. we already had 9.
    t.deepEqual(received, [7, 9, 8])
    if(!--n) done()
  })

  pull(B.source, pull.collect(function (err, ary) {
    t.deepEqual(ary.slice(1), [1, 9, 3, 5, 2], 'B.source')
    if(!--n) done()
  }))

  console.log('source', B.source)
  pull(pull.values([1, 7, 9, 8]), B.sink)

})

tape('simple protocol - recieves', function (t) {
  var set =  [1, 9, 3, 5, 2]
  var n = 2
  function done () {
    t.end()
  }

  var B = sendAll(set, function (err, set, missing, received) {
    t.notOk(err)
    t.deepEqual(set, [1, 9, 3, 5, 2, 7, 8])
    t.deepEqual(missing, [7, 8], 'sent')
    t.deepEqual(received, [7, 9, 8])

    if(!--n) done()
  })

  pull(B.source, pull.collect(function (err, ary) {
    console.log('RECIEVED B', ary)
    t.deepEqual(ary.slice(1), [1, 3, 5, 2], 'recieved from b')

    if(!--n) done()
  }))


  pull(pull.values([0, 7, 9, 8]), B.sink)
})

tape('simple protocol - duplex', function (t) {
  var _a, _b
  function next () {
    if(!(_a && _b)) return
    t.deepEqual(_a.sort(), _b.sort())
    t.end()
  }
  var A =  sendAll([1, 7, 3, 5, 2], function (err, set) {
    _a = set
    next()
  })
  var B =  sendAll([1, 9, 5, 2], function (err, set) {
    _b = set
    next()
  })
  pull(A, B, A)

})
