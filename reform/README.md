# Reform: sheeptester.github.io design reform

There are a lot of unstyled web pages on my website, characteristically black
Times New Roman text on a white background. I didn't bother adding CSS to them
because I didn't think it was necessary, and I was lazy. Some examples of web
pages that I use frequently are:

- [intense contrast](https://sheeptester.github.io/javascripts/intense-contrast.html)
- [jpg quality](https://sheeptester.github.io/javascripts/jpg-quality.html)
- [image translucentifier](https://sheeptester.github.io/javascripts/image-translucentifier.html)
- [svg to png](https://sheeptester.github.io/words-go-here/misc/svgtopng.html)

But I'm pretty sure people, even non web devs, regard these pages as unfinished,
suspicious, unprofessional, etc. and might outright refuse to use them even if
they work and are adless.

For a while, I've been thinking of establishing a design/component library for
my own use, and I think that will be what Reform will bring about.

## Implementation

I will introduce Reform in four stages:

1. Collect all unstyled pages across my website.
2. Figure out what these pages need to figure out what would best serve the web
   pages I create in the future.
3. Update all unstyled pages to adopt the new style system (Reform).
4. Write documentation and code samples so I can use Reform in new web pages.

Some features that Reform will have:

- An aqua gradient on the top to conform with the home page for a bit of
  site-wide identity.
  - The l'sxafeto design will also be adjusted just on the Reform pages. I think
    I will remove the circle and add the aqua gradient to the sheep outline.
- Support for light and dark theme using CSS variables. CSS variables are
  optimal because I may want to add a light/dark toggle in the future, but
  that's currently low priority.
- Improved user experience:
  - All pages will accept images via the clipboard.
  - Sliders will show the numerical value and allow you to edit the value
    directly.
  - Form fields will support more detailed labels.
- Improved developer experience:
  - I won't have to copy and paste the ugly code from JPG Quality every time I
    want to make a new web page that accepts an image.
- A CSS-powered (using `::after`) bubble that says "Loading..." then "JavaScript
  failed to run." if JavaScript does not add `.js-enabled` or something to
  `<body>` in time.

## Existing unstyled pages

I'll focus on interactive web pages first, but I've settled on about five Reform
page layouts/templates:

- A single column form with form fields that immediately update the output, like
  [font maker](https://sheeptester.github.io/javascripts/fontmaker.html).
  - This is the most flexible in terms of responsive design, and most existing
    web pages are already like this.
- A sidebar with settings with an output image prominently taking up the rest of
  the screen, like [gif
  caption](https://sheeptester.github.io/javascripts/gif-caption.html).
  - I'm not sure if the sidebar layout is best, though. It gives little room for
    detailed labels.
- A two column textarea, where one side is the input and the other side is the
  output, like
  [encrypt](https://sheeptester.github.io/javascripts/encrypt.html).
- A redirect page with a drawing of a sheep.
- A 404 page with a drawing of a sheep.

- Image output
  - https://sheeptester.github.io/words-go-here/misc/chunks.html Settings, input
    -> output image.
  - https://sheeptester.github.io/javascripts/intense-contrast.html Input ->
    output image, with settings. Detailed radios. Output image is interactive.
  - https://sheeptester.github.io/words-go-here/misc/ucsd-map.html Settings,
    slider. Output image.
  - https://sheeptester.github.io/javascripts/mutate.html Many tables. Play and
    next frame button. Image output? (constant size)
  - https://sheeptester.github.io/javascripts/pip-image.html Image input with
    video output. Action button.
  - https://sheeptester.github.io/javascripts/grapher.html Single-line input,
    text, error, and image output.
- https://sheeptester.github.io/words-go-here/misc/pixel-font.html A settings
  form that gets disabled once set. Two live outputs. Has a wide glyph editor.
- https://sheeptester.github.io/javascripts/notifications.html Many inputs with
  detailed labels linking to documentation. Action button.
- https://sheeptester.github.io/javascripts/raw-json-img.html Image input,
  settings, long text output (this could have a copy button!).
- https://sheeptester.github.io/javascripts/cryptography.html Various unrelated
  input -> output text fields. Caesar cipher table.
- https://sheeptester.github.io/javascripts/image-translucentifier.html Input
  output image, color inputs, color picker. Shows input and output side-by-side.
- https://sheeptester.github.io/hello-world/bones-and-muscles.html Action
  button.
- https://sheeptester.github.io/words-go-here/misc/format.html Textarea input.
  Output has colors/formatting; how to deal with dark/light theme text colors?
- https://sheeptester.github.io/theflat/easierjson.html Textarea input,
  console.log output.
- https://sheeptester.github.io/words-go-here/misc/animated-painting-maker.html
  Settings, image input, two output images + textarea output.
- https://sheeptester.github.io/calculator/calc/ Single-line input and action
  button produces number output. I think the action button can be replaced with
  a live input -> output relationship.
- https://sheeptester.github.io/happynumbers/factoring/RAGE.html I think this
  page is broken.
- https://sheeptester.github.io/hello-world/dynamic-sw/ Two-button control
  panel.
- https://sheeptester.github.io/hello-world/underground-markup.html Textarea
  input, formatted output.
- https://sheeptester.github.io/calculator/oldindex.html A function called
  `calc`. It wants you to run `calc` in the console.
- https://sheeptester.github.io/words-go-here/savefiletest.html A simple form
  (textarea input) with an action button.
- https://sheeptester.github.io/words-go-here/misc/file-editor.html Four-button
  control panel. Textarea input.
- https://sheeptester.github.io/javascripts/zwsp-embedder.html Three inputs,
  where the first two drive the third. The relationship between the input/output
  textareas is shown in a table-like layout. SPECIAL LAYOUT
- https://sheeptester.github.io/words-go-here/misc/triangulated-coordinates.html
  Largely a static page, but it has two input -> output forms.
- https://sheeptester.github.io/hello-world/nbt-parser.html Takes a file, and
  outputs a pretty-printed JSON tree. I think I should not touch this until I
  add my own JSON-tree capabilities.
- https://sheeptester.github.io/all/generator.html Takes a textarea input (JSON)
  (maybe we should allow dragging and dropping text files into textareas). Not
  sure what the output is.
- https://sheeptester.github.io/words-go-here/misc/minimal-markup.html Input
  textarea -> output rich text.
- https://sheeptester.github.io/javascripts/imagetoscheme.html Input image +
  settings -> display text.
- https://sheeptester.github.io/words-go-here/misc/circles.html Input image,
  settings are set by keyboard only, interactive angles on a circle. This might
  be tough.
- https://sheeptester.github.io/words-go-here/misc/keyboard.html Input textarea,
  output is a keyboard SVG. Has a slider for playback and a play button.
- https://sheeptester.github.io/yesnt/timing-thing.html Output table.
- https://sheeptester.github.io/words-go-here/misc/fix-x.html Select file, has
  an output log, then downloads output.
- https://sheeptester.github.io/sentence/mspllesier.html Action button edits the
  input textarea. I think overwriting the user input is a bad idea, so we should
  change this to an input -> output kind of thing.
- https://sheeptester.github.io/javascripts/combining.html Large font input
  textarea. A bunch of styled buttons for adding diacritics.
- https://sheeptester.github.io/sentence/ Action button with output text with
  big font.
- https://sheeptester.github.io/javascripts/jpg-quality.html Input image.
  Slider. Dropdown.
- https://sheeptester.github.io/hello-world/pi.html A table.
- https://sheeptester.github.io/javascripts/delegalifier.html Input -> output
  textarea.
- https://sheeptester.github.io/javascripts/video/text.html Input video, output
  video and downloads file.
- https://sheeptester.github.io/life/scrolltest.html Three output numbers.
- https://sheeptester.github.io/javascripts/voice-control.html
- https://sheeptester.github.io/javascripts/chopper.html
- https://sheeptester.github.io/javascripts/abbrevator.html
- https://sheeptester.github.io/yesnt/simple-reverb-test.html
- https://sheeptester.github.io/words-go-here/misc/factorial.html
- https://sheeptester.github.io/words-go-here/misc/factorial-bigint.html
- https://sheeptester.github.io/words-go-here/misc/factorial-scinot.html
- https://sheeptester.github.io/animations/kjlsintro2.html
- https://sheeptester.github.io/hello-world/scheme-interpret.html
- https://sheeptester.github.io/words-go-here/misc/yangyangyangyang.html
- https://sheeptester.github.io/words-go-here/misc/dialog.html
- https://sheeptester.github.io/word-prediction/js/test.html
- https://sheeptester.github.io/words-go-here/misc/accelerationtest.html
- https://sheeptester.github.io/javascripts/greedy.html
- https://sheeptester.github.io/gamepro5/minigames/color.html
- https://sheeptester.github.io/hello-world/mobile-pwa-test.html
- https://sheeptester.github.io/words-go-here/misc/zelmanov-rref.html
- https://sheeptester.github.io/words-go-here/misc/gcal.html
- https://sheeptester.github.io/hello-world/merge-horiz.html
- https://sheeptester.github.io/javascripts/image-shuffler.html
- https://sheeptester.github.io/javascripts/bignummathtester.html
- https://sheeptester.github.io/hello-world/bell.html
- https://sheeptester.github.io/hello-world/zdsfghnjvc.html (what is this??)
- https://sheeptester.github.io/scratch-vm/video-sensing.html
- https://sheeptester.github.io/animations/kjlsintro.html
- https://sheeptester.github.io/words-go-here/misc/simplex.html
- https://sheeptester.github.io/javascripts/shepform/
- https://sheeptester.github.io/javascripts/video/video-test.html
- https://sheeptester.github.io/happynumbers/factoring/
- https://sheeptester.github.io/words-go-here/misc/skin.html
- https://sheeptester.github.io/happynumbers/bytwos/
- https://sheeptester.github.io/animations/svg/pies.html
- https://sheeptester.github.io/javascripts/font-colour-remover.html
- https://sheeptester.github.io/words-go-here/misc/we-are-merely-pawns-of-ucb.html
- https://sheeptester.github.io/hello-world/svgception.html
- https://sheeptester.github.io/words-go-here/misc/filledcube.html
- https://sheeptester.github.io/javascripts/randomised-music.html
- https://sheeptester.github.io/platformre/levelplaytest.html
- https://sheeptester.github.io/words-go-here/misc/acm.html
- https://sheeptester.github.io/hello-world/plaincolour.html
- https://sheeptester.github.io/javascripts/cho.html
- https://sheeptester.github.io/words-go-here/misc/2048simplified.html
- https://sheeptester.github.io/words-go-here/misc/dehtmlify.html
- https://sheeptester.github.io/javascripts/fontmaker.html (this also needs to be fixed for Scratch 3.0)
- https://sheeptester.github.io/hello-world/f.html
- https://sheeptester.github.io/javascripts/blur.html
- https://sheeptester.github.io/hello-world/test/embedder.html
- https://sheeptester.github.io/words-go-here/misc/imgtosvg.html
- https://sheeptester.github.io/platformre/keypresses.html
- https://sheeptester.github.io/hello-world/flappybirdwithifstatements.html
- https://sheeptester.github.io/javascripts/searchparser.html
- https://sheeptester.github.io/javascripts/fill-perf.html
- https://sheeptester.github.io/hello-world/attitude.html
- https://sheeptester.github.io/javascripts/semi-what.html
- https://sheeptester.github.io/hello-world/mirroring.html
- https://sheeptester.github.io/javascripts/peerjs.html
- https://sheeptester.github.io/words-go-here/misc/schedulemaker.html
- https://sheeptester.github.io/sentence/word.html
- https://sheeptester.github.io/calculator/leapday/
- https://sheeptester.github.io/calculator/base/
- https://sheeptester.github.io/hello-world/tenmillionpages.html
- https://sheeptester.github.io/javascripts/caretdemo.html
- https://sheeptester.github.io/hello-world/big-file-viewer.html
- https://sheeptester.github.io/olamreee/override-editor.html
- https://sheeptester.github.io/words-go-here/misc/opentype.html
- https://sheeptester.github.io/words-go-here/misc/svgtopng.html
- https://sheeptester.github.io/javascripts/byte-sorter.html
- TODO:
  - https://sheeptester.github.io/dumb-multiplayer-server/client/
  - https://sheeptester.github.io/javascripts/multiplayer/
