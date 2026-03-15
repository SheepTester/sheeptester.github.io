import { App, AppProps } from './App'

export function Page (props: AppProps) {
  return (
    <html lang='en'>
      <head>
        <meta charSet='UTF-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />

        <title>Meanwhile</title>
        <meta
          name='description'
          content='An art piece contrasting my university life with the interesting times happening around me.'
        />

        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link rel='preconnect' href='https://fonts.gstatic.com' />
        <link
          href='https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Inter&display=swap'
          rel='stylesheet'
        />
        <link rel='stylesheet' type='text/css' href='/sheep3.css' />
        <link rel='stylesheet' type='text/css' href='./dist/index.css' />
        <script src='/sheep3.js'></script>
      </head>
      <body>
        <div id='root'>
          <App {...props} />
        </div>
        {/* <script type='module'>
          {`import { render } from './dist/index.mjs'
          render(document.getElementById('root'))`}
        </script> */}
      </body>
    </html>
  )
}
