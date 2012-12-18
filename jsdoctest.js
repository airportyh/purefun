var fs = require('fs')
var esprima = require('esprima')
var markdown = require('markdown')
var purefun = require('./purefun')
var util = require('util')

function read(filename){
    return fs.readFileSync(filename) + ''
}

with(purefun){

var ast = function(code){
    return esprima.parse(code, {loc: true, comment: true})
}

var formatMarkdown = function(md){
    return '<p>\n' + indent(markdown.markdown.toHTML(md)) + '\n</p>'
}

var parseMarkdown = function(md){
    return markdown.markdown.parse(md)
}

var splitLines = curry(split, '\n')
var joinLines = curry(join, '\n')
var addIndent = curry(add, '    ')
var indent = function(text){
    return joinLines(map(addIndent, splitLines(text)))
}

var commentsWithinCode = compose(ast, prop('comments'))

var lineType = function(line){
    if (line.charAt(0) === '>'){
        return {type: 'code start', line: line.substring(1).replace(/^[\s]+/, '')}
    }else if (line.substring(0, 3) === '...'){
        return {type: 'code continue', line: line.substring(3)}
    }else{
        return {type: 'expectation', line: line}
    }
}

var markdownToText = function(elm){
    return join('', map(function(part){
        if (isstr(part)) return part
        else return markdownToText(part)
    }, tail(elm)))
}

var testsWithinMarkdown = function(md){
    var elements = parseMarkdown(md)
    var tests = foldr(function(tests, elm, idx){
        if (eq('code_block', head(elm))){
            var prevElm = elements[idx - 1]
            // TODO: watch for case when prevElm is not present
            return concat(tests, [{
                description: markdownToText(prevElm)
                , codeLines: map(lineType, splitLines(elm[1]))
            }])
        }else{
            return tests
        }
    }, [], elements)
    return tests
}

var testsWithinComments = function(comments){
    var blockComments = map(prop('value'), filter(function(comment){
        return eq('Block', comment.type)
    }, comments))
    var testsets = map(testsWithinMarkdown, blockComments)
    return apply(concat, testsets)
}

var testDisplay = function(test){
    return joinLines(map(function(line){
        switch(line.type){
        case 'code start': return '> ' + line.line
        case 'code continue': return '... ' + line.line
        case 'expectation': return line.line
        default: return ''
        }
    }, test.codeLines))
}

var testCode = function(test){
    return foldr(function(code, line){
        switch(line.type){
            case 'code start':
            case 'code continue':
                return code + '\n' + line.line
            default: return code
        }
    }, '', test.codeLines)
}

var testExpectation = function(test){
    // TODO rewrite using find
    return foldr(function(expectation, line){
        switch(line.type){
            case 'expectation': return line.line
            default: return expectation
        }
    }, null, test.codeLines)
}

var runTests = function(tests){
    var ok = true
    tests.forEach(function(test){
        var code = testCode(test)
        var expectation = testExpectation(test)

        try{
            var expected = eval(expectation)
            var got = eval(code)
        }catch(e){
            console.log('not ok ' + test.description)
            console.log(indent(e.stack))
            return
        }

        if (util.inspect(expected) !== util.inspect(got)){
            console.log('not ok ' + test.description)
            /*console.log(indent('not ok \u2718'))
            console.log(indent(indent(join('\n', [
                'expected: '
                , util.inspect(expected)
                , 'got: '
                , util.inspect(got)
            ]))))
            */
            ok = false
        }else{
            console.log('ok ' + test.description)
            //console.log(indent('ok \u2714'))
            //console.log(' ')
        }

    })
    if (!ok) process.nextTick(function(){ process.exit(1) })
}

var code = read('purefun.js')
var comments = commentsWithinCode(code)
var tests = testsWithinComments(comments)
runTests(tests)

}


