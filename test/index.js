var pull = require('pull-stream')

var handshake = require('../')
var tape = require('tape')

//test subcomponents.

var once = handshake.once
var header = handshake.header
var lazy = handshake.lazy

var END = function (abort, cb) { cb(abort || true) }

tape('once - turns a callback into a pull stream', function (t) {
  pull(
    once(function (cb) {
      process.nextTick(function () {
        cb(null, 1)
      })
    }, END),
    pull.collect(function (err, one) {
      t.notOk(err)
      t.deepEqual(one, [1])
      t.end()
    }))
})

tape('once - error aborts the stream', function (t) {
  var err = new Error()
  pull(
    once(function (cb) {
      process.nextTick(function () {
        cb(err)
      })
    }, function never (abort, cb) {
      //should never get called.
      t.ok(false, 'should never happen')
      cb(new Error('should never happen'))
    }),
    pull.collect(function (_err, one) {
      t.ok(err)
      t.strictEqual(_err, err)
      t.end()
    }))
})

tape('header takes the first element from the stream', function (t) {
  var head = {header: true}, called = false

  pull(
    pull.values([head, 1, 2, 3, 4]),
    header(function (header) {
        t.strictEqual(header, head)
        called = true
      },
      pull.collect(function (err, ary) {
        t.ok(called)
        t.notOk(err)
        t.deepEqual(ary, [1, 2, 3, 4])
        t.end()
      })
    )
  )
})

//QUESTION: how should I header handle errors?
//should the header be past the error? or the first stream?

tape('lazy make a stream, but pipe it later', function (t) {

  var later = lazy(), flowing = false
  pull(
    pull.values([4, 3, 2, 1]),
    pull.through(function (a) {
      flowing = true
    }),
    later
  )

  setTimeout(function () {
    t.notOk(flowing)
    later.start(pull.collect(function (err, ary) {
      t.notOk(err)
      t.ok(flowing)
      t.deepEqual(ary, [4, 3, 2, 1])
      t.end()
    }))
  }, 100)

})

tape('lazy make a stream, but pipe it later', function (t) {

  var later = lazy(), flowing = false, err = new Error()

  pull(
    //error immediately.
    function (end, cb) {
      cb(err)
    },
    pull.through(function (a) {
      flowing = true
    }),
    later
  )

  setTimeout(function () {
    t.notOk(flowing)
    later.start(pull.collect(function (_err) {
      t.ok(_err)
      t.notOk(flowing)
      t.strictEqual(_err, err)
      t.end()
    }))
  }, 100)

})


