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
              default: 'apple'
            },
            B: {
              type: Scratch.ArgumentType.STRING,
              default: 'APPLE'
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
          opcode: 'ternaryOperator',

          blockType: Scratch.BlockType.REPORTER,

          text: 'if [A] then [B] else [C]',
          arguments: {
            A: {
              type: Scratch.ArgumentType.BOOLEAN
            },
            B: {
              type: Scratch.ArgumentType.STRING,
              default: 'dog'
            },
            C: {
              type: Scratch.ArgumentType.STRING,
              default: 'cat'
            }
          }
        }
      ]
    }
  }

  isExactly(args) {
    return args.A === args.B;
  }

  isLessOrEqual(args) {
    return args.A <= args.B;
  }

  isMoreOrEqual(args) {
    return args.A >= args.B;
  }

  trueBlock() {
    return true;
  }

  falseBlock() {
    return false;
  }

  exponent(args) {
    return Math.pow(args.A, args.B);
  }

  pi(args) {
    return Math.PI;
  }

  ternaryOperator(args) {
    return args.A ? args.B : args.C;
  }

}

Scratch.extensions.register(new Utilities());
