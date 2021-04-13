// deno run --allow-read --allow-write home-page/imitation-scss-parser.js home-page/index.html.scss index.html

const [inputFile, outputFile] = Deno.args
const psuedoScss = await Deno.readTextFile(inputFile)

function * tokenize (text, possibilities) {
  possibilities = Object.entries(possibilities)
  tokenization:
  while (text.length) {
    for (const [type, possibility] of possibilities) {
      let token
      if (typeof possibility === 'string') {
        if (text.startsWith(possibility)) {
          token = possibility
          text = text.slice(possibility.length)
        }
      } else {
        const match = text.match(possibility)
        if (match && match.index === 0) {
          token = match[0]
          text = text.slice(match[0].length)
        }
      }
      if (token) {
        if (type === 'BEGIN_RAW') {
          let raw = ''
          let brackets = 0
          while (text.length) {
            const match = text.match(/^[^()[\]{}]+/)
            if (match) {
              raw += match[0]
              text = text.slice(match[0].length)
            } else {
              raw += text[0]
              if ('[({'.includes(text[0])) {
                brackets++
                text = text.slice(1)
              } else {
                brackets--
                text = text.slice(1)
              }
              if (brackets <= 0) {
                yield ['RAW', raw]
              }
            }
          }
        } else {
          yield [type, token]
        }
        continue tokenization
      }
    }
    console.error(text)
    throw new Error('Cannot tokenize from here.')
  }
}

const tokens = tokenize(psuedoScss, {
  BEGIN_RAW: 'css',
  comment: /^\/\/.*/,
  lparen: '(',
  rparen: ')',
  lbracket: '[',
  rbracket: ']',
  lcurly: '{',
  rcurly: '}',
  equal: '=',
  semicolon: ';',
  colon: ':',
  string: /^"(?:[^"\r\n\\]|\\.)*"|'(?:[^'\r\n\\]|\\.)*'/,
  idName: /^#[\w-]+/,
  className: /^\.[\w-]+/,
  tagName: /^[\w-]+/,
  whitespace: /^\s+/
})

let html = '<!DOCTYPE html>'
const contextStack = [{}]

function startSelector (context) {
  context.type = 'selector'
  context.html = () => {
    const { tagName = 'div', classes = [], id, attributes = [] } = context
    if (classes.length) {
      attributes.push(['class', `"${classes.join(' ')}"`])
    }
    if (id) {
      attributes.push(['id', `"${id}"`])
    }
    return `<${tagName}${attributes.map(([name, value]) => value === undefined ? ' ' + name : ` ${name}=${value}`).join('')}>`
  }
}

const escapeMap = { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }

parser:
for (const [tokenType, token] of tokens) {
  let context = contextStack[contextStack.length - 1]
  console.log([tokenType, token], context)

  switch (tokenType) {
    case 'comment': {
      continue parser
    }

    case 'tagName': {
      if (!context.type) {
        if (token === 'content') {
          context.type = 'content'
          context.step = 'after-content'
          break
        } else {
          startSelector(context)
        }
      }
      if (context.type === 'selector') {
        if (context.tagName) {
          throw new Error('Tag name already set')
        } else {
          context.tagName = token
        }
      } else if (context.type === 'attribute') {
        if (context.step === 'name') {
          context.name = token
          context.step = 'post-name'
        } else if (context.step === 'value') {
          context.value = token
          context.step = 'end'
        }
      } else {
        throw new Error('Invalid tag name context')
      }
      break
    }

    case 'className': {
      if (!context.type) startSelector(context)
      if (context.type === 'selector') {
        if (!context.classes) context.classes = []
        context.classes.push(token.slice(1))
      } else {
        throw new Error('Class token should only be in selector')
      }
      break
    }

    case 'idName': {
      if (!context.type) startSelector(context)
      if (context.type === 'selector') {
        if (context.id) {
          throw new Error('ID already set')
        } else {
          context.id = token.slice(1)
        }
      } else {
        throw new Error('Class token should only be in selector')
      }
      break
    }

    case 'lbracket': {
      if (!context.type) startSelector(context)
      if (context.type === 'selector') {
        contextStack.push({
          type: 'attribute',
          step: 'name'
        })
      } else {
        throw new Error('Left bracket should only be in selector')
      }
      break
    }

    case 'equal': {
      if (context.type === 'attribute') {
        if (context.step === 'post-name') {
          context.step = 'value'
        } else {
          throw new Error('Equal must be after name')
        }
      } else {
        throw new Error('Equal should only be in attribute')
      }
      break
    }

    case 'rbracket': {
      if (context.type === 'attribute') {
        if (context.step === 'post-name' || context.step === 'end') {
          contextStack.pop()
          const parentContext = contextStack[contextStack.length - 1]
          if (!parentContext.attributes) parentContext.attributes = []
          parentContext.attributes.push([context.name, context.value])
        } else {
          throw new Error('Right bracket must be after name or value')
        }
      } else {
        throw new Error('Right bracket should only be in attribute')
      }
      break
    }

    case 'string': {
      if (context.type === 'attribute') {
        if (context.step === 'value') {
          context.value = token
          context.step = 'end'
        } else {
          throw new Error('String must be after equal sign')
        }
      } else if (context.type === 'content') {
        if (context.step === 'value') {
          html += JSON.parse(token).replace(/[<>&"]/g, m => escapeMap[m])
          context.step = 'end'
        } else {
          throw new Error('String must be after colon')
        }
      } else {
        throw new Error('Invalid string context')
      }
      break
    }

    case 'whitespace': {
      if (context.type === 'selector') {
        context.encounteredWhiteSpace = true
      } else {
        continue parser
      }
      break
    }

    case 'lcurly': {
      if (context.type === 'selector') {
        html += context.html()
        contextStack.push({})
      } else {
        throw new Error('Left curly should only be after selector')
      }
      break
    }

    case 'rcurly': {
      contextStack.pop()
      context = contextStack[contextStack.length - 1]
      console.log('RCURLY', context)
      if (context.type === 'selector') {
        html += `</${context.tagName || 'div'}>`
        contextStack.pop()
        contextStack.push({})
      } else {
        throw new Error('Right curly\'s matching left curly should only be after selector')
      }
      break
    }

    case 'semicolon': {
      if (context.type === 'selector') {
        html += context.html()
        contextStack.pop()
        contextStack.push({})
      } else if (context.type === 'content') {
        if (context.step === 'end') {
          contextStack.pop()
          contextStack.push({})
        } else {
          throw new Error('Colon must be after string')
        }
      } else {
        throw new Error('Invalid semicolon context')
      }
      break
    }

    case 'colon': {
      if (context.type === 'content') {
        if (context.step === 'after-content') {
          context.step = 'value'
        } else {
          throw new Error('Colon must be after `content`')
        }
      } else {
        throw new Error('Colon should only be in content')
      }
      break
    }

    default: {
      console.log(html)
      throw new Error(`Not done with ${tokenType} yet`)
    }
  }
}

console.log(contextStack)

await Deno.writeTextFile(outputFile, html + `\n<!-- Generated from ${inputFile} -->\n`)
