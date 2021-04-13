// node home-page/imitation-scss-parser.js home-page/index.html.scss index.html

const fs = require('fs/promises')
const nodePath = require('path')
const YAML = require('yaml')

function * tokenize (text, possibilities) {
  const tokenizers = [Object.entries(possibilities)]
  tokenization:
  while (text.length) {
    for (const [type, rawPossibility] of tokenizers[tokenizers.length - 1]) {
      const possibility = typeof rawPossibility === 'string' || rawPossibility instanceof RegExp
        ? { pattern: rawPossibility }
        : rawPossibility
      let token, groups
      if (typeof possibility.pattern === 'string') {
        if (text.startsWith(possibility.pattern)) {
          token = possibility.pattern
          text = text.slice(possibility.pattern.length)
        }
      } else {
        const match = text.match(possibility.pattern)
        if (match && match.index === 0) {
          token = match[0]
          groups = match
          text = text.slice(match[0].length)
        }
      }
      if (token) {
        if (possibility.pop) {
          tokenizers.pop()
        }
        if (possibility.push) {
          tokenizers.push(Object.entries(possibility.push))
        }
        yield [type, token, groups]
        continue tokenization
      }
    }
    console.error(text)
    throw new Error('Cannot tokenize from here.')
  }
}

const patternTokenizers = {
  in: {
    pattern: 'in',
    pop: true
  },
  variable: /^\$[\w-]+/,
  separator: ',',
  whitespace: /^\s+/
}
const tokenizers = {
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
  import: '@import',
  importFunc: /^import\s*\(\s*("(?:[^"\r\n\\]|\\.)*")\s*\)/,
  each: {
    pattern: '@each',
    push: patternTokenizers
  },
  multilineString: /^"""([^"\\]|\\.)*(?:"{1,2}([^"\\]|\\.)+)*"""/,
  mapGet: /^map\s*\.\s*get\s*\(\s*(\$[\w-]+)\s*,\s*'(?:[^'\r\n\\]|\\.)*'\s*\)/,
  string: /^"(?:[^"\r\n\\]|\\.)*"/,
  idName: /^#[\w-]+/,
  className: /^\.[\w-]+/,
  tagName: /^[\w-]+/,
  whitespace: /^\s+/
}

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

function trimMultilineString (str) {
  const contents = str.slice(3, -3)
  const firstIndentMatch = contents.match(/\n([ \t]*)/)
  return contents.replace(new RegExp(String.raw`\s*\n[ \t]{0,${
    firstIndentMatch
      ? firstIndentMatch[1].length
      : 0
  }}`, 'g'), ' ').trim()
}

async function parseImitationScss (psuedoScss, filePath, { html = '', noisy = false, variables = {} } = {}) {
  const tokens = tokenize(psuedoScss, tokenizers)
  const contextStack = [{}]
  async function analyseToken ([tokenType, token, groups], variables) {
    let context = contextStack[contextStack.length - 1]
    if (noisy) console.log([tokenType, token], context)

    switch (tokenType) {
      case 'comment': {
        break
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

      case 'multilineString':
      case 'string': {
        const strValue = tokenType === 'multilineString'
          ? trimMultilineString(token)
          : JSON.parse(token)
        const escaped = strValue.replace(/[<>&"]/g, m => escapeMap[m])
        if (context.type === 'attribute') {
          if (context.step === 'value') {
            context.value = escaped
            context.step = 'end'
          } else {
            throw new Error('String must be after equal sign')
          }
        } else if (context.type === 'content') {
          if (context.step === 'value') {
            html += escaped
            context.step = 'end'
          } else {
            throw new Error('String must be after colon')
          }
        } else if (context.type === 'import') {
          if (context.step === 'path') {
            const path = nodePath.join(nodePath.dirname(filePath), strValue)
            html += await parseImitationScss(await fs.readFile(path, 'utf8'), path, {
              noisy,
              variables
            })
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
        }
        break
      }

      case 'lcurly': {
        if (context.type === 'selector') {
          html += context.html()
          contextStack.push({})
        } else if (context.type === 'each') {
          contextStack.push({})
        } else {
          throw new Error('Left curly should only be after selector')
        }
        break
      }

      case 'rcurly': {
        contextStack.pop()
        context = contextStack[contextStack.length - 1]
        if (noisy) console.log('RCURLY', context)
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
        } else if (context.type === 'import') {
          if (context.step === 'end') {
            contextStack.pop()
            contextStack.push({})
          } else {
            throw new Error('Colon must be after import path string')
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

      case 'each': {
        if (!context.type) {
          context.type = 'each'
          context.variables = []
          context.step = 'variables'
        } else {
          throw new Error('Each cannot be used inside a context')
        }
        break
      }

      case 'variable': {
        if (context.type === 'each') {
          if (context.step === 'variables') {
            context.variables.push(token)
          } else {
            throw new Error('Variables must be after @each')
          }
        } else {
          throw new Error('Each cannot be used inside a context')
        }
        break
      }

      case 'separator': {
        break
      }

      case 'in': {
        if (context.type === 'each') {
          if (context.step === 'variables') {
            context.step = 'expr'
          } else {
            throw new Error('`in` must be after @each or variables')
          }
        } else {
          throw new Error('in should only be in @each')
        }
        break
      }

      case 'importFunc': {
        if (context.type === 'each') {
          if (context.step === 'expr') {
            const path = nodePath.join(nodePath.dirname(filePath), JSON.parse(groups[1]))
            const yaml = YAML.parse(await fs.readFile(path, 'utf8'))
            if (yaml === null || typeof yaml !== 'object') {
              throw new TypeError('Cannot loop over a non-array/object')
            }
            const array = Array.isArray(yaml)
              ? yaml
              : Object.entries(yaml)
            const minLength = Math.min(...array.map(sublist => Array.isArray(sublist) ? sublist.length : 1))
            if (context.variables > minLength) {
              throw new RangeError(`Destructuring too many variables from a list of at minimum ${minLength} items`)
            }
            context.data = array
            // Collect the HTML inside the block and then perform some
            // substitutions later
            context.tempHtml = html
            html = ''
            context.step = 'contents'
          } else {
            throw new Error('Import function must only be used after in')
          }
        } else {
          throw new Error('Import function should only be in @each')
        }
        break
      }

      case 'import': {
        if (!context.type) {
          context.type = 'import'
          context.step = 'path'
        } else {
          throw new Error('@import cannot be inside a context')
        }
        break
      }

      case 'mapGet': {
        if (context.type === 'each') {
          if (context.step === 'expr') {
            //
            context.data = array
            // Collect the HTML inside the block and then perform some
            // substitutions later
            context.tempHtml = html
            html = ''
            context.step = 'contents'
          } else {
            throw new Error('map.get function must only be used after in')
          }
        } else {
          throw new Error('map.get in wrong context')
        }
      }

      default: {
        console.log(html)
        throw new Error(`${tokenType} not implemented yet`)
      }
    }
  }
  for (const token of tokens) {
    await analyseToken(token, variables)
  }
  if (noisy) console.log(contextStack)
  return html
}

const [, , inputFile, outputFile] = process.argv
fs.readFile(inputFile, 'utf8')
  .then(async psuedoScss => {
    fs.writeFile(
      outputFile,
      await parseImitationScss(psuedoScss, inputFile, {
        html: '<!DOCTYPE html>',
        noisy: true
      }) + `\n<!-- Generated from ${inputFile} -->\n`
    )
  })
