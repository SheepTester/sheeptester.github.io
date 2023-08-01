# Reform: sheeptester.github.io design reform

[intense-contrast]: https://sheeptester.github.io/javascripts/intense-contrast.html
[jpg-quality]: https://sheeptester.github.io/javascripts/jpg-quality.html
[image-translucentifier]: https://sheeptester.github.io/javascripts/image-translucentifier.html
[svg-to-png]: https://sheeptester.github.io/words-go-here/misc/svgtopng.html
[font-maker]: https://sheeptester.github.io/javascripts/fontmaker.html
[gif-caption]: https://sheeptester.github.io/javascripts/gif-caption.html
[encrypt]: https://sheeptester.github.io/javascripts/encrypt.html

There are a lot of unstyled web pages on my website, characteristically black Times New Roman text on a white background. I didn't bother adding CSS to them because I didn't think it was necessary, and I was lazy. Some examples of web pages that I use frequently are:

- [intense-contrast]
- [jpg-quality]
- [image-translucentifier]
- [svg-to-png]

But I'm pretty sure people, even non web devs, regard these pages as unfinished, suspicious, unprofessional, etc. and might outright refuse to use them even if they work and are adless.

For a while, I've been thinking of establishing a design/component library for my own use, and I think that will be what Reform will bring about.

A lot of "unstyled pages" listed below already do have a bit of style. The Reform program is mainly to get rid of Times New Roman, unless it's clear that the rest of the app has been graced with enough styling that the Times New Roman may be intentional (OlamREEE).

## Implementation

I will introduce Reform in four stages:

1. Collect all unstyled pages across my website.
2. Figure out what these pages need to figure out what would best serve the web pages I create in the future.
3. Update all unstyled pages to adopt the new style system (Reform).
4. Write documentation and code samples so I can use Reform in new web pages.

Some features that Reform will have:

- An aqua gradient on the top to conform with the home page for a bit of site-wide identity.
  - The l'sxafeto design will also be adjusted just on the Reform pages. I think I will remove the circle and add the aqua gradient to the sheep outline.
- Support for light and dark theme using CSS variables. CSS variables are optimal because I may want to add a light/dark toggle in the future, but that's currently low priority.
- Improved user experience:
  - All pages will accept images via the clipboard.
  - Sliders will show the numerical value and allow you to edit the value directly.
  - Form fields will support more detailed labels.
- Improved developer experience:
  - I won't have to copy and paste the ugly code from [jpg-quality] every time I want to make a new web page that accepts an image.
- A CSS-powered (using `::after`) bubble that says "Loading..." then "JavaScript failed to run." if JavaScript does not add `.js-enabled` or something to `<body>` in time.

## Existing unstyled pages

I'll focus on interactive web pages first, but I've settled on about five Reform page layouts/templates:

- A single column form with form fields that immediately update the output, like [font-maker].
  - This is the most flexible in terms of responsive design, and most existing web pages are already like this.
- A sidebar with settings with an output image prominently taking up the rest of the screen, like [gif-caption].
  - I'm not sure if the sidebar layout is best, though. It gives little room for detailed labels.
- A two column textarea, where one side is the input and the other side is the output, like [encrypt].
- A redirect page with a drawing of a sheep.
- A 404 page with a drawing of a sheep.

Common themes:

- Settings
  - Text fields tend to be input textareas
  - Number fields (sometimes integer-only)
  - Sliders
    - Sometimes used to select a time during playback
  - Radios with descriptions
  - Dropdowns (which are basically radios but harder to style)
    - Dropdowns only make sense for long lists of options, like for TTS voice
- Inputs
  - Select file, paste image, textarea
    - A lot of them preview your input image next to the output.
    - Sometimes an input is also an output, using for encryption/decryption.
- Outputs (sometimes multiple): may want to provide a download/copy/share(?) button. Output should automatically recalculate when inputs change, but there can be an option to disable this.
  - Canvas/video
    - Canvas potentially interactive
  - Plain text/code (eg JSON)
  - Rich text
  - Table
  - Working/error log
  - Individual numerical values
- Buttons
  - Download file
  - Play button (often with stop/pause buttons)
  - Control panel (button group): multiple buttons with same hierarchy. It wouldn't make sense for any one of them to be a primary button. They could be shown as a ribbon of adjacent buttons, like in iOS.
- Instructions, about
- Sometimes short inputs or outputs are given a large fonts

Other components:

- Color input
- Download button

  - Should include file name and size

- Image output
  - https://sheeptester.github.io/words-go-here/misc/chunks.html Settings, input -> output image.
  - https://sheeptester.github.io/javascripts/intense-contrast.html Input -> output image, with settings. Detailed radios. Output image is interactive.
  - https://sheeptester.github.io/words-go-here/misc/ucsd-map.html Settings, slider. Output image.
  - https://sheeptester.github.io/javascripts/mutate.html Many tables. Play and next frame button. Image output? (constant size)
  - https://sheeptester.github.io/javascripts/pip-image.html Image input with video output. Action button.
  - https://sheeptester.github.io/javascripts/grapher.html Single-line input, text, error, and image output.
- https://sheeptester.github.io/javascripts/notifications.html Many inputs with detailed labels linking to documentation. Action button.
- https://sheeptester.github.io/javascripts/raw-json-img.html Image input, settings, long text output (this could have a copy button!).
- https://sheeptester.github.io/javascripts/cryptography.html Various unrelated input -> output text fields. Caesar cipher table.
- https://sheeptester.github.io/javascripts/image-translucentifier.html Input output image, color inputs, color picker. Shows input and output side-by-side.
- https://sheeptester.github.io/hello-world/bones-and-muscles.html Action button.
- https://sheeptester.github.io/words-go-here/misc/format.html Textarea input. Output has colors/formatting; how to deal with dark/light theme text colors?
- https://sheeptester.github.io/theflat/easierjson.html Textarea input, console.log output.
- https://sheeptester.github.io/words-go-here/misc/animated-painting-maker.html Settings, image input, two output images + textarea output.
- https://sheeptester.github.io/calculator/calc/ Single-line input and action button produces number output. I think the action button can be replaced with
  a live input -> output relationship.
- https://sheeptester.github.io/happynumbers/factoring/RAGE.html I think this page is broken.
- https://sheeptester.github.io/hello-world/dynamic-sw/ Two-button control panel.
- https://sheeptester.github.io/hello-world/underground-markup.html Textarea input, formatted output.
- https://sheeptester.github.io/calculator/oldindex.html A function called `calc`. It wants you to run `calc` in the console.
- https://sheeptester.github.io/words-go-here/savefiletest.html A simple form (textarea input) with an action button.
- https://sheeptester.github.io/words-go-here/misc/file-editor.html Four-button control panel. Textarea input.
- https://sheeptester.github.io/javascripts/zwsp-embedder.html Three inputs, where the first two drive the third. The relationship between the input/output
  textareas is shown in a table-like layout. SPECIAL LAYOUT
- https://sheeptester.github.io/words-go-here/misc/triangulated-coordinates.html Largely a static page, but it has two input -> output forms.
- https://sheeptester.github.io/all/generator.html Takes a textarea input (JSON) (maybe we should allow dragging and dropping text files into textareas). Not
  sure what the output is.
- https://sheeptester.github.io/words-go-here/misc/minimal-markup.html Input textarea -> output rich text.
- https://sheeptester.github.io/javascripts/imagetoscheme.html Input image + settings -> display text.
- https://sheeptester.github.io/words-go-here/misc/keyboard.html Input textarea, output is a keyboard SVG. Has a slider for playback and a play button.
- https://sheeptester.github.io/yesnt/timing-thing.html Output table.
- https://sheeptester.github.io/words-go-here/misc/fix-x.html Select file, has an output log, then downloads output.
- https://sheeptester.github.io/sentence/mspllesier.html Action button edits the input textarea. I think overwriting the user input is a bad idea, so we should change this to an input -> output kind of thing.
- https://sheeptester.github.io/sentence/ Action button with output text with large font.
- https://sheeptester.github.io/javascripts/jpg-quality.html Input image. Slider. Dropdown.
- https://sheeptester.github.io/hello-world/pi.html A table.
- https://sheeptester.github.io/javascripts/delegalifier.html Input -> output textarea.
- https://sheeptester.github.io/javascripts/video/text.html Input video, output video and downloads file.
- https://sheeptester.github.io/life/scrolltest.html Three output numbers.
- https://sheeptester.github.io/javascripts/voice-control.html Dropdown and action button.
- https://sheeptester.github.io/javascripts/chopper.html Image input, action button. Output is a grid of clickable images to download and a button to download all as zip.
- https://sheeptester.github.io/javascripts/abbrevator.html Two column input -> output.
- https://sheeptester.github.io/yesnt/simple-reverb-test.html Play and stop buttons.
- https://sheeptester.github.io/words-go-here/misc/factorial.html Large number input inside a bit of math. Output is a number.
  - https://sheeptester.github.io/words-go-here/misc/factorial-bigint.html
  - https://sheeptester.github.io/words-go-here/misc/factorial-scinot.html
- https://sheeptester.github.io/animations/kjlsintro2.html Action button (play button).
- https://sheeptester.github.io/hello-world/scheme-interpret.html Just a JavaScript function. Needs an input/output textarea.
- https://sheeptester.github.io/words-go-here/misc/yangyangyangyang.html Settings and an output.
- https://sheeptester.github.io/javascripts/greedy.html Interactive canvas.
- https://sheeptester.github.io/gamepro5/minigames/color.html Game board.
- https://sheeptester.github.io/hello-world/mobile-pwa-test.html Left/right buttons to move an arrow.
- https://sheeptester.github.io/words-go-here/misc/gcal.html Row of fields. Date and time fields.
- https://sheeptester.github.io/hello-world/merge-horiz.html Contenteditable input. Checkboxes. Rich text output.
- https://sheeptester.github.io/javascripts/image-shuffler.html There's an outline around the output so you can tell what part of it is the image.
- https://sheeptester.github.io/hello-world/bell.html Can just be an action button or something.
- https://sheeptester.github.io/hello-world/zdsfghnjvc.html (what is this??) Needs UI
- https://sheeptester.github.io/animations/kjlsintro.html
- https://sheeptester.github.io/words-go-here/misc/simplex.html Run button because this is potentially computationally expensive. Maybe there should be a checkbox to disable immediate re-runs.
- https://sheeptester.github.io/javascripts/video/video-test.html Input video, previews video, downloads webm.
- https://sheeptester.github.io/happynumbers/bytwos/ Ten numbers, outputs five numbers.
- https://sheeptester.github.io/animations/svg/pies.html Two sliders.
- https://sheeptester.github.io/javascripts/font-colour-remover.html Input must be pasted. Two outputs: code and rich text.
- https://sheeptester.github.io/hello-world/svgception.html Action button.
- https://sheeptester.github.io/javascripts/randomised-music.html Start and pause buttons.
- https://sheeptester.github.io/words-go-here/misc/acm.html Color input, styled preset buttons. Uses custom font.
- https://sheeptester.github.io/hello-world/plaincolour.html Download link and byte count (this should be included in all download buttons tbh). Output image may be large, so there should be an option to hide it.
- https://sheeptester.github.io/javascripts/cho.html LaTeX output (rich text). Dropdown is used to select units inline.
- https://sheeptester.github.io/words-go-here/misc/2048simplified.html Four buttons, table view.
- https://sheeptester.github.io/words-go-here/misc/dehtmlify.html Input file, downloads ZIP and outputs message.
- https://sheeptester.github.io/javascripts/fontmaker.html (this also needs to be fixed for Scratch 3.0)
- https://sheeptester.github.io/javascripts/blur.html
- https://sheeptester.github.io/hello-world/test/embedder.html
- https://sheeptester.github.io/words-go-here/misc/imgtosvg.html SVG output (rather than canvas), necessitating a download button (can't right click > copy).
- https://sheeptester.github.io/platformre/keypresses.html
- https://sheeptester.github.io/hello-world/flappybirdwithifstatements.html Canvas and code output. Play/stop button + two more buttons.
- https://sheeptester.github.io/javascripts/searchparser.html Uses `?`. Could also have a text field input. Outputs code.
- https://sheeptester.github.io/javascripts/fill-perf.html Multiple steps. Outputs rows of canvases.
- https://sheeptester.github.io/hello-world/attitude.html Table layout with font sizes and large input.
- https://sheeptester.github.io/javascripts/semi-what.html
- https://sheeptester.github.io/hello-world/mirroring.html Two-way input.
- https://sheeptester.github.io/words-go-here/misc/schedulemaker.html SVG output.
- https://sheeptester.github.io/sentence/word.html Multiple sections each with a generate button that outputs a list of words. Shift-clicking the button generates many words at once (this should be turned into a long press for touch users I think).
- https://sheeptester.github.io/calculator/leapday/ Date input, table output.
- https://sheeptester.github.io/calculator/base/ Inline number inputs in a sentence. I think this could be made two-way.
- https://sheeptester.github.io/hello-world/tenmillionpages.html Uses `?`.
- https://sheeptester.github.io/javascripts/caretdemo.html Just a textarea.
- https://sheeptester.github.io/words-go-here/misc/opentype.html
- https://sheeptester.github.io/words-go-here/misc/svgtopng.html Accepts multiple images.
- https://sheeptester.github.io/javascripts/byte-sorter.html Immediately downloads result after inputting file.
- Complicated
  - https://sheeptester.github.io/words-go-here/misc/pixel-font.html A settings form that gets disabled once set. Two live outputs. Has a wide glyph editor.
  - https://sheeptester.github.io/hello-world/nbt-parser.html Takes a file, and outputs a pretty-printed JSON tree. I think I should not touch this until I add my own JSON-tree capabilities.
  - https://sheeptester.github.io/words-go-here/misc/circles.html Input image, settings are set by keyboard only, interactive angles on a circle. This might be tough.
  - https://sheeptester.github.io/javascripts/combining.html Large font input textarea. A bunch of styled buttons for adding diacritics.
  - https://sheeptester.github.io/happynumbers/factoring/ Inline number inputs that automatically resize.
  - https://sheeptester.github.io/hello-world/big-file-viewer.html Log. File selector can only be used once. Uses keyboard.
- Unfinished web pages
  - https://sheeptester.github.io/word-prediction/js/test.html Just JS functions. Needs UI.
  - https://sheeptester.github.io/words-go-here/misc/zelmanov-rref.html
  - https://sheeptester.github.io/javascripts/bignummathtester.html
  - https://sheeptester.github.io/words-go-here/misc/we-are-merely-pawns-of-ucb.html
- TODO (hard to test)
  - https://sheeptester.github.io/dumb-multiplayer-server/client/
  - https://sheeptester.github.io/javascripts/multiplayer/
  - https://sheeptester.github.io/scratch-vm/video-sensing.html
  - https://sheeptester.github.io/javascripts/peerjs.html
