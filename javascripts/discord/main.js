import '../_dom2.js'
import Discord from './discord.js'

const TOKEN_KEY = '[javascripts] discord.token'
const NO_STORE = 'please do not store token in localStorage thank'

const params = new URL(window.location).searchParams
const script = params.get('script')

if (script) {
  const token = localStorage.getItem(TOKEN_KEY)
  const tokenInput = Elem('input', {
    type: 'text',
    value: token === NO_STORE ? '' : token,
    onchange: () => {
      if (!storeInput.checked) {
        localStorage.setItem(TOKEN_KEY, tokenInput.value)
      }
    }
  })
  const storeInput = Elem('input', {
    type: 'checkbox',
    checked: token === NO_STORE,
    onchange: () => {
      if (storeInput.checked) {
        localStorage.setItem(TOKEN_KEY, NO_STORE)
      } else {
        localStorage.setItem(TOKEN_KEY, tokenInput.value)
      }
    }
  })
  document.body.appendChild(Fragment([
    Elem('p', {}, [
      Elem('label', {}, [
        'Token: ',
        tokenInput
      ])
    ]),
    Elem('p', {}, [
      Elem('label', {}, [
        storeInput,
        'Do not store token in localStorage',
      ])
    ]),
    Elem('button', {
      autofocus: true,
      onclick: () => {
        empty(document.body)
        import(new URL(script, window.location)).then(({ default: main }) => {
          main(tokenInput.value, Discord)
        }).catch(() => {
          document.body.appendChild(Elem('p', {}, ['There was a problem. Check the console?']))
        })
      }
    }, ['Start'])
  ]))
} else {
  document.body.appendChild(Elem('p', {}, [
    'Add ',
    Elem('code', {}, ['?script=example.js']),
    ' or some other path to a JS file to the URL to load it'
  ]))
}
