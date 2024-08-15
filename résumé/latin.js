// @ts-check

/**
 * @param {string} original
 * @param {string} word
 * @returns {string}
 */
function keepCase (original, word) {
  return Array.from(word.toLowerCase(), (c, i) =>
    original[i] && original[i] === original[i].toUpperCase()
      ? c.toUpperCase()
      : c
  ).join('')
}

/**
 * @param {string} text
 * @param {(word: string) => string} transform
 * @returns {string}
 */
function transformWords (text, transform) {
  return text.replace(/[a-z]+/gi, word =>
    keepCase(word, transform(word.toLowerCase()))
  )
}

const vowels = 'aeiou'

/** @type {Record<string, string>} */
const endings = {
  a: 'am',
  e: 'em',
  i: 'is',
  o: 'om',
  u: 'us'
}

/** @type {Record<string, string>} */
const mappings = {
  i: 'ego',
  am: 'sum',
  a: 'un',
  to: 'ad',
  in: 'en',
  of: 'de',
  and: 'et',
  for: 'pro'
}
const mappingsReverse = Object.fromEntries(
  Object.entries(mappings).map(([k, v]) => [v, k])
)
const weird = 'is'
const lengthEndings = [
  weird,
  'um',
  'us',
  'ae',
  'os',
  'as',
  'es',
  'am',
  'em',
  'im',
  'ex'
]

/**
 * @param {string} word
 * @returns {string}
 */
function toLatin (word) {
  if (mappings[word]) {
    return mappings[word]
  }
  const startsWithVowel = vowels.includes(word[0])
  const ending = endings[word[0]] ?? 'um'
  let i = 0
  while (vowels.includes(word[i]) && i < word.length) {
    i++
  }
  while (
    !vowels.includes(word[i]) &&
    (word[i] !== 'y' || startsWithVowel) &&
    i < word.length
  ) {
    i++
  }
  if (i >= word.length || i >= lengthEndings.length) {
    return word + weird
  }
  return word.slice(i) + word.slice(0, i) + lengthEndings[i]
}

/**
 * @param {string} word
 * @returns {string}
 */
function fromLatin (word) {
  if (mappingsReverse[word]) {
    return mappingsReverse[word]
  }
  const ending = word.slice(-2)
  if (ending === weird) {
    return word.slice(0, -2)
  }
  const index = word.length - 2 - lengthEndings.indexOf(ending)
  return word.slice(index, -2) + word.slice(0, index)
}

/**
 * @param {string} passage
 * @returns {string}
 */
export function encode (passage) {
  const result = transformWords(passage, toLatin)
  if (transformWords(result, fromLatin) !== passage) {
    console.error(result, transformWords(result, fromLatin))
    throw new Error('passage cannot be decoded. this is a bug')
  }
  return result
}

/**
 * @param {string} passage
 * @returns {string}
 */
export function decode (passage) {
  return transformWords(passage, fromLatin)
}
