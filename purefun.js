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

/*

filter(fun, arr)
----------------

Filters arrays

    > function odd(n){ return eq(1, mod(n, 2)) }
    > filter(odd, [1,2,3])
    [1,3]

Works for objects too

    > function odd(n){ return eq(1, mod(n, 2)) }
    > filter(odd, {one: 1, two: 2, three: 3})
    [1, 3]

*/
exports.filter = filter
function filter(fun, arr){
    return map(id, arr).filter(fun)
}

/*

take(n:Number, arr:Array) => Array
----------------------------------

Return the first `n` elements of `arr`.

Takes first n elements of array

    > take(2, [1,2,3])
    [1, 2]

Returns same array if n > length(arr)

    > take(5, [1,2,3])
    [1,2,3]

Works for function arguments

    > function f(){
    ... return take(2, arguments)
    ... }
    > f(1,2,3)
    [1,2]

*/
exports.take = take
function take(n, arr){
    return map(id, arr).slice(0, n)
}

/*

isArray(obj) => Boolean
-----------------------

Tells whether a thing is an array.

Is array

    > isArray([])
    true

Is not array

    > isArray(1)
    false

*/

exports.isArray = isArray
function isArray(obj){
    return Array.isArray(obj)
}

// Functions
// =========

/*

compose(f:Function, g:Function) => Function
-------------------------------------------

Composes any number of functions by chaining them together.

    > function times2(n){ return n * 2 }
    > function add3(n){ return n + 3 }
    > var f = compose(times2, add3)
    > f(3)
    9

*/
exports.compose = compose
function compose(f, g){
    return function(){
        return g(apply(f, arguments))
    }
}

/*

curry(fun:Function, fixargs...) => Function
----------------------------------------

Returns a new function which the first n args where `n` is the length of `fixargs`.

    > var add1 = curry(add, 1)
    > add1(2)
    3

*/
exports.curry = curry
function curry(fun){
    var fixargs = tail(arguments)
    return function(){
        return apply(fun, concat(fixargs, arguments))
    }
}

/*

apply(fun:Function, args:Array) => Anything
----------------------------------------

Applies a function to an array of arguments.

    > apply(add, [1,2])
    3

*/
exports.apply = apply
function apply(fun, args){
    return fun.apply(null, args)
}

// Operators
// =========

// Define matching functions for binary operators

/*

op(operator)
------------

Returns a function that represents the binary operator.

Add

    > op('+')(1, 2)
    3

Subtract

    > op('-')(2, 1)
    1

Strict equal

    > op('===')({}, {})
    false

*/

exports.op = op
function op(op){
    return new Function('x', 'y', 'return x' + op + 'y')
}


/*

eq(one, other)
--------------

Alias for op('===').

*/
var eq = exports.eq = op('===')

/*

add(x, y)
---------

Alias for op('+').

*/
var add = exports.add = op('+')

/*

mod(one, other)
---------------

Alias for op('%')

*/
var mod = exports.mod = op('%')

// Strings
// =======

/*

split(sep:String, str:String) => Array (of Strings)
---------------------------------------------------

Splits `str` on the string separator `sep` into an array of strings.

    > split(',', 'a,b,c,d')
    ['a','b','c','d']

*/
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

/*

isString(obj) => true
---------------------

Tells whether a thing is a string

Is a string

    > isString('abc')
    true

not a string
    
    > isString(3)
    false

*/
exports.isString = isString
function isString(obj){
    return typeof obj === 'string'
}
