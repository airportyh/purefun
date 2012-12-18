if (typeof describe !== 'undefined'){
    var expect = require('chai').expect
}else{
    var describe = function(){}
}

// Objects and Arrays
// =====================

/*

id(obj)
-------

Returns its first argument.

    > id('bobby')
    'bobby'

*/
exports.id = id
function id(obj){
    return obj
}

/*

map(fun, obj)
-------------

Returns an array gotten from iterating `obj` and calling `fun(value, key)`
onat each iteration.

It can map arrays

    > function times2(n){ return n * 2 }
    > map(times2, [1, 2, 3])
    [2, 4, 6]

It can also map objects

    > map(function(value, key){ return key + ':' + value }, 
    ...   {one: 1, two: 2})
    ['one:1', 'two:2']

It can also map function arguments

    > function times2(n){ return n * 2 }
    > function f(){ return map(times2, arguments) }
    > f(1, 2, 3)
    [2, 4, 6]

*/
exports.map = map
function map(fun, obj){
    var ret = []
    for (var key in obj){
        ret.push(fun(obj[key], key))
    }
    return ret
}

/*

prop(name)
----------

Returns a function `f(obj)` that returns the `name` property of `obj`.

    > prop('name')({ name: 'Bob' })
    'Bob'

*/
exports.prop = prop
function prop(name){
    return function(obj){
        return obj[name]
    }
}

// Arrays
// ======

/*

length(arr)
-----------

Returns the length of an array

    > length([1,2,3])
    3

*/
exports.length = length
function length(arr){
    return arr.length
}

/*

join(sep, arr)
--------------

Joins an array `arr` into a string by converting all items to strings and then
concatenating them with `sep` as the separator

It joins an array

    > join(' ', ['a', 'b', 'c'])
    'a b c'

It also joins an object

    > join(' ', {one: 1, two: 2})
    '1 2'

*/
exports.join = join
function join(sep, arr){
    return map(id, arr).join(sep)
}

/*

sum(arr)
--------

Returns the sum of an array of numbers

    > sum([1,2,3])
    6

*/
exports.sum = sum
function sum(arr){
    return foldr(add, 0, arr)
}

/*

folder(fun, initial, arr)
-------------------------

Folds an array(or array-like object) from left to right.

    > foldr(function(word, letter){
    ... return word + letter
    ... }, '', ['a', 'b', 'c'])
    'abc'

*/
exports.foldr = foldr
function foldr(fun, initial, arr){
    return arr.reduce(fun, initial)
}

/*

concat(arrays...)
-----------------

Concatenates any number of arrays.

It can concat arrays

    > concat([1,2], [3,4])
    [1,2,3,4]

It can concat function arguments

    > function f(){
    ...     var fargs = arguments
    ...     return function g(){
    ...         var gargs = arguments
    ...         return concat(fargs, gargs)
    ...     }
    ... }
    > f(1,2)(3,4)
    [1,2,3,4]

*/
exports.concat = concat
function concat(){
    return foldr(function(arr, obj){
        return arr.concat(map(id, obj))
    }, [], map(id, arguments))
}

/*

tail(arr)
---------

Returns an array consisting of all elements of `arr` except the first element.

    > tail([1,2,3])
    [2,3]

can tail function arguments

    > function f(){ return tail(arguments) }
    > f(1,2,3)
    [2,3]

*/
exports.tail = tail
function tail(arr){
    return map(id, arr).slice(1)
}

/*

head(arr)
---------

Returns the first element of `arr`.

    > head([1,2,3])
    1

*/
exports.head = head
function head(arr){
    return arr[0]
}

describe('filter', function(){ 
    it('filters an array based on a conditional', function(){
        expect(filter(odd, [1,2,3])).to.deep.equal([1,3])
    })
    it('works for objects too', function(){
        expect(filter(odd, {one: 1, two: 2, three: 3})).to.deep.equal([1,3])
    })
    function odd(n){
        return eq(1, mod(n, 2))
    }
})

/*

filter(fun, arr)
----------------



*/
exports.filter = filter
function filter(fun, arr){
    return map(id, arr).filter(fun)
}

describe('take', function(){
    it('takes first n elements of array', function(){
        expect(take(n = 2, [1,2,3])).to.deep.equal([1,2])
    })
    it('is returns same array if n > length(arr)', function(){
        expect(take(n = 5, [1,2,3])).to.deep.equal([1,2,3])
    })
    it('works for function arguments', function(){
        function f(){
            return take(n = 2, arguments)
        }
        expect(f(1,2,3)).to.deep.equal([1,2])
    })
    var n
})
exports.take = take
function take(n, arr){
    return map(id, arr).slice(0, n)
}



// Functions
// =========

describe('compose', function(){
    it('can compose', function(){
        function times2(n){
            return n * 2
        }
        function add3(n){
            return n + 3
        }
        var f = compose(times2, add3)
        expect(f(3)).to.equal(9)
    })
})
exports.compose = compose
function compose(f, g){
    return function(){
        return g(apply(f, arguments))
    }
}

exports.curry = curry
function curry(fun){
    var fixargs = tail(arguments)
    return function(){
        return apply(fun, concat(fixargs, arguments))
    }
}
describe('curry', function(){
    it('can curry one argument', function(){
        function add(x, y){
            return x + y
        }
        var add1 = curry(add, 1)
        expect(add1(2)).to.equal(3)
    })
})

describe('apply', function(){
    it('applys arguments to a function', function(){
        expect(apply(add, [1, 2])).to.equal(3)
    })
})
exports.apply = apply
function apply(fun, args){
    return fun.apply(null, args)
}

// Operators
// =========

describe('operators', function(){
    it('adds', function(){
        expect(add(1,2)).to.equal(3)
    })
    it('eq gives strict equality', function(){
        expect(eq(1,1)).to.be.ok
        expect(eq(1,'1')).not.to.be.ok
    })
})

// Define matching functions for binary operators
'\
add:+ \
eq:=== \
gt:> \
gte:>= \
lt:< \
lte:<= \
mod:%\
'.split(' ').forEach(function(def){
    var pair = def.split(':')
    var name = pair[0]
    var op = pair[1]
    exports[name] = global[name] = new Function('x', 'y', 'return x' + op + 'y')
})

// Strings
// =======

exports.split = split
function split(sep, str){
    return str.split(sep)
}

exports.extend = extend
function extend(obj){
    for (var key in exports){
        obj[key] = exports[key]
    }
}

exports.isstr = isstr
function isstr(obj){
    return typeof obj === 'string'
}

exports.trim = trim
function trim(str){
    return str.trim()
}
