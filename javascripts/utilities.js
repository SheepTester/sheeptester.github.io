class Utilities {

  constructor() {}

  getInfo() {
    return {
      id: 'utilities',
      name: 'Utlities',
      blocks: [
        {
          opcode: 'isExactly',

          blockType: Scratch.BlockType.BOOLEAN,

          text: 'is [A] exactly [B]?',
          arguments: {
            A: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'apple'
            },
            B: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'APPLE'
            }
          }
        },
        {
          opcode: 'isLessOrEqual',

          blockType: Scratch.BlockType.BOOLEAN,

          text: '[A] <= [B]',
          arguments: {
            A: {
              type: Scratch.ArgumentType.NUMBER
            },
            B: {
              type: Scratch.ArgumentType.NUMBER
            }
          }
        },
        {
          opcode: 'isMoreOrEqual',

          blockType: Scratch.BlockType.BOOLEAN,

          text: '[A] >= [B]',
          arguments: {
            A: {
              type: Scratch.ArgumentType.NUMBER
            },
            B: {
              type: Scratch.ArgumentType.NUMBER
            }
          }
        },
        {
          opcode: 'trueBlock',
          blockType: Scratch.BlockType.BOOLEAN,
          text: 'true'
        },
        {
          opcode: 'falseBlock',
          blockType: Scratch.BlockType.BOOLEAN,
          text: 'false'
        },
        {
          opcode: 'exponent',

          blockType: Scratch.BlockType.REPORTER,

          text: '[A] ^ [B]',
          arguments: {
            A: {
              type: Scratch.ArgumentType.NUMBER
            },
            B: {
              type: Scratch.ArgumentType.NUMBER
            }
          }
        },
        {
          opcode: 'pi',
          blockType: Scratch.BlockType.BOOLEAN,
          text: 'pi'
        },
        {
          opcode: 'ternaryOperator',

          blockType: Scratch.BlockType.REPORTER,

          text: 'if [A] then [B] else [C]',
          arguments: {
            A: {
              type: Scratch.ArgumentType.BOOLEAN
            },
            B: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'dog'
            },
            C: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'cat'
            }
          }
        },
        {
          opcode: 'letters',

          blockType: Scratch.BlockType.REPORTER,

          text: 'letters [START] to [END] of [STRING]',
          arguments: {
            START: {
              type: Scratch.ArgumentType.NUMBER,
              defaultValue: 3
            },
            END: {
              type: Scratch.ArgumentType.NUMBER,
              defaultValue: 5
            },
            STRING: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'houses'
            }
          }
        },
        {
          opcode: 'currentMillisecond',
          blockType: Scratch.BlockType.REPORTER,
          text: 'current millisecond'
        },
        {
          opcode: 'fetchFrom',

          blockType: Scratch.BlockType.REPORTER,

          text: 'get content from [URL]',
          arguments: {
            URL: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'https://api.scratch.mit.edu/users/griffpatch/messages/count'
            }
          }
        },
        {
          opcode: 'parseJSON',

          blockType: Scratch.BlockType.REPORTER,

          text: 'get [PATH] from [JSON_STRING]',
          arguments: {
            PATH: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'messages/joe'
            },
            JSON_STRING: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: '{"messages": {"joe": "Hello", "mitch": "Good day!"}, "message_count": 2}'
            }
          }
        }
      ]
    }
  }

  isExactly({A, B}) {
    return A === B;
  }

  isLessOrEqual({A, B}) {
    return A <= B;
  }

  isMoreOrEqual({A, B}) {
    return A >= B;
  }

  trueBlock() {
    return true;
  }

  falseBlock() {
    return false;
  }

  exponent({A, B}) {
    return Math.pow(A, B);
  }

  pi() {
    return Math.PI;
  }

  ternaryOperator({A, B, C}) {
    return A ? B : C;
  }

  letters({STRING, START, END}) {
    return STRING.slice(Math.max(1, START) - 1, Math.min(STRING.length, END) - 1);
  }

  currentMillisecond() {
    return Date.now() % 1000;
  }

  fetchFrom({URL}) {
    return new Promise(resolve => {
      fetch(URL).then(res => res.text()).then(resolve)
      .catch(err => resolve(''));
    });
  }

  parseJSON({PATH, JSON_STRING}) {
    try {
      console.log(PATH, JSON_STRING);
      const path = PATH.toString().split('/').map(prop => decodeURIComponent(prop));
      if (path[0] === '') path.splice(0, 1);
      if (path[path.length - 1] === '') path.splice(-1, 1);
      let json;
      try {
        json = JSON.parse(' ' + JSON_STRING);
      } catch (e) {
        return e.message;
      }
      path.forEach(prop => json = json[prop]);
      if (json === null) return 'null';
      else if (json === undefined) return '';
      else if (typeof json === 'object') return JSON.stringify(json);
      else return json.toString();
    } catch (err) {
      return '';
    }
  }

}

Scratch.extensions.register(new Utilities());
