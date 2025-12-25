# Reform v1 Documentation

## Page template

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <title>...</title>
    <meta name="description" content="..." />
    <meta name="theme-color" content="#4fa1a7" />

    <link rel="stylesheet" type="text/css" href="/sheep3.css" />
    <link rel="stylesheet" type="text/css" href="/reform/v1/index.css" />
    <script src="/sheep3.js" charset="utf-8"></script>
  </head>
  <body>
    <form class="main" role="main" action="javascript:">
      <h1>...</h1>
      <p>...</p>

      <!-- ... -->
    </form>

    <script type="module">
      import { on } from '/reform/v1/index.js'

      // ...
    </script>
  </body>
</html>
```

## I/O components

- Add `reform:paste-target` to the file input class to allow it to receive files from paste.
- Set `data-default` on the file input to the URL of a file to load by default.
- For single-column outputs, I think output-controls should go before output-content.

### Image input

```html
<label class="input-controls file">
  <input
    type="file"
    name="..."
    accept="image/*"
    class="hidden-accessible reform:image-input"
  />
  <span class="icon icon-upload"></span>
  <span class="file-label">Choose, drop, or paste an image</span>
  <span class="file-name">No file selected</span>
</label>
<div class="image-content input-content"><canvas></canvas></div>
```

### Text input

```html
<label class="input-controls file">
  <input type="file" name="..." class="hidden-accessible reform:text-input" />
  <span class="icon icon-upload"></span>
  <span class="file-label"> Choose or drop a text file or type below </span>
  <span class="file-name">No file selected</span>
</label>
<textarea name="..." aria-label="..." class="input-content">...</textarea>
```

### Image output

```html
<div class="image-content output-content">
  <canvas id="..." data-deps="..."></canvas>
</div>
<div class="output-controls">
  <a class="file download">
    <span class="icon icon-download"></span>
    <span class="file-label">Download</span>
    <span class="file-name">No file available</span>
  </a>
  <button
    type="button"
    class="icon icon-copy"
    data-output="output"
    aria-label="Copy"
  ></button>
  <button
    type="button"
    class="icon icon-share"
    data-output="output"
    aria-label="Share"
  ></button>
</div>
```

### Text output

```html
<textarea
  class="output-content"
  id="..."
  data-deps="..."
  aria-label="..."
  readonly
></textarea>
<div class="output-controls">
  <a class="file download">
    <span class="icon icon-download"></span>
    <span class="file-label">Download</span>
    <span class="file-name">No file available</span>
  </a>
  <button
    type="button"
    class="icon icon-copy"
    data-output="output"
    aria-label="Copy"
  ></button>
  <button
    type="button"
    class="icon icon-share"
    data-output="output"
    aria-label="Share"
  ></button>
</div>
```

### Two-column layout

```html
<div class="two-col-io reform:io">...</div>
```

### One-column layout

```html
<div class="col-io reform:io">...</div>
```

### File I/O, no preview

- Note the use of `no-contents`.
- As used in [Byte sorter](https://sheeptester.github.io/javascripts/byte-sorter.html) and [schedule maker](https://sheeptester.github.io/words-go-here/misc/schedulemaker.html).
- The output ID goes in the wrapper.

```html
<div class="two-col-io reform:io no-contents" id="..." data-deps="...">
  <label class="input-controls file">
    <input
      type="file"
      name="..."
      class="hidden-accessible reform:file-input reform:paste-target"
    />
    <span class="icon icon-upload"></span>
    <span class="file-label">Choose, drop, or paste a file</span>
    <span class="file-name">No file selected</span>
  </label>
  <div class="output-controls">
    <a class="file download">
      <span class="icon icon-download"></span>
      <span class="file-label">Download</span>
      <span class="file-name">No file available</span>
    </a>
    <button
      type="button"
      class="icon icon-copy"
      data-output="output"
      aria-label="Copy"
    ></button>
    <button
      type="button"
      class="icon icon-share"
      data-output="output"
      aria-label="Share"
    ></button>
  </div>
</div>
```

```html
<div class="col-io reform:io no-contents">
  <label class="input-controls file">
    <input
      type="file"
      name="..."
      accept="..."
      class="hidden-accessible reform:file-input"
    />
    <span class="icon icon-upload"></span>
    <span class="file-label">Choose or drop a font file (WOFF, OTF, TTF)</span>
    <span class="file-name">No file selected</span>
  </label>
</div>
```

### Output controls, primary copy

This is used by [font-colour-remover](https://sheeptester.github.io/javascripts/font-colour-remover.html) because it's intended to clean the clipboard.

```html
<div class="output-controls">
  <button type="button" data-output="output" class="reform:copy">
    <span class="icon icon-copy"></span>
    <span>...</span>
  </button>
  <a class="download icon-btn icon icon-download" aria-label="Download"></a>
  <button
    type="button"
    class="icon icon-share"
    data-output="output"
    aria-label="Share"
  ></button>
</div>
```

## Form components

### General inputs

- Should work with any text field or select box by default.
- `label-secondary` is optional.

```html
<label class="field-label">
  <span class="label-primary">...</span>
  <span class="label-secondary"> ... </span>
  ...
</label>
```

### Range

```html
<div class="field-label range-wrapper">
  <label class="range-label">
    <span class="label-primary">...</span>
    <input type="range" name="..." min="..." max="..." value="..." />
  </label>
  <input
    type="text"
    inputmode="numeric"
    pattern="[0-9]*"
    name="..."
    min="..."
    max="..."
    value="..."
    aria-label="... value"
  />
</div>
```

### Radio group

- If all options don't need both a `label-primary` and `label-secondary`, then prefer using `label-secondary` for all options.

```html
<fieldset class="radio-set">
  <legend class="label-primary">...</legend>
  <p class="label-secondary">...</p>
  <label class="radio-label">
    <input type="radio" name="..." value="..." class="hidden-accessible" />
    <span class="radio-button"></span>
    <span class="label-primary">...</span>
    <span class="label-secondary">...</span>
  </label>
  <label class="radio-label">
    <input
      type="radio"
      name="..."
      value="no-desc"
      class="hidden-accessible"
      checked
    />
    <span class="radio-button"></span>
    <span class="label-primary">...</span>
    <span class="label-secondary">...</span>
  </label>
  <label class="radio-label">
    <input type="radio" name="..." value="..." class="hidden-accessible" />
    <span class="radio-button"></span>
    <span class="label-primary">...</span>
    <span class="label-secondary">...</span>
  </label>
</fieldset>
```

### Checkbox

```html
<label class="radio-label">
  <input type="checkbox" name="..." class="hidden-accessible" checked />
  <span class="radio-button"></span>
  <span class="label-primary">...</span>
  <span class="label-secondary"> ... </span>
</label>
```

### Button row

```html
<div class="button-row">
  <button type="submit" class="button primary-btn">...</button>
  <button type="button" class="button outline-btn">...</button>
  <button type="button" class="button text-btn">...</button>
</div>
```

### Horizontal layout

```html
<div class="cols">
  <label class="field-label">...</label>
  <label class="field-label">...</label>
</div>
```

## CSS utility class reference

- `.link`: For text links.
- `.hidden-accessible`: Hides an element but make it tab-accessible.
- `.code`: Monospace font.

## JavaScript API

Reform is built on the concept of sources. All form elements are automatically sources, and the `on` function can be used to register custom sources. Even outputs are sources, and they may produce values for output controls to consume.

### Form element sources

Reform automatically subscribes to all form elements in the page, unless `[data-ignore]` is set (used by the special input sources below).

- Number, range, and `[inputmode=numeric]` inputs produce a number.
  - If there's an ancestor `.range-wrapper`, then it'll find the corresponding input to update its value.
- Checkboxes produce a boolean.
- File inputs produce a non-empty `Array` of `File`s.
- Text areas, select boxes, radios, and all other input types produce a string.

Generally, classes prefixed with `reform:` indicate special JavaScript behavior.
Here are the special input sources:

- `input.reform:image-input`: Enables image input handling.
  - It will create a canvas if none already exists in the `.reform:io` wrapper. `willReadFrequently` is set to `data-will-read-frequently` (used by [Intense contrast](https://sheeptester.github.io/javascripts/intense-contrast.html))
  - Selected images are drawn onto the canvas. This is also used for previewing.
  - Produces `CanvasRenderingContext2D`s instead of image files.
- `input.reform:video-input`: Enables video input handling.
  - It will create a `<video>` if none already exists in the `.reform:io` wrapper.
  - Selected videos are loaded in the video element. This is also used for previewing.
  - Produces `HTMLVideoElement` once the video loads (fully?).
- `input.reform:text-input`: Enables text input handling.
  - Produces a string.
- `input.reform:file-input`: Enables single file input handling.
  - Produces a `File`.

Some more info and options:

- `.reform:io` indicates the ancestor element surrounding the input element and its preview. It also becomes the target for dropping files.
  - `.file-name` is populated with the selected file name and size.
- `input.reform:paste-target` makes the source handle files pasted into the web page.
- `input[data-default]` contains the URL of a file to load and use as the default file.

### Custom sources

There is only one exported function, `on`, which is used to register a custom source.

```ts
export type SourceSpec =
  | {
      name: string
      deps?: string[]
    }
  | string
declare export function on<T> (
  spec: SourceSpec,
  callback: (
    object: HTMLElement | CanvasRenderingContext2D | null,
    args: Record<string, unknown>
  ) => Promise<T>
): void
```

The source name is the identifier of the source. It may refer to an element (`object`) in the DOM by its ID (priority) or `name`. If the element is a canvas, then the object is instead the canvas's `CanvasRenderingContext2D`.

#### Dependencies

If `deps` isn't specified in `spec`, then it'll pull the dependencies from space-separated `[data-deps]` if it exists. The dependency list is a list of source identifiers.

If a dependency is prefixed with an ampersand `&`, then the dependency becomes a reference to the object (i.e. HTML element or canvas context) instead of the source's value. For example, `[data-deps="a &b"]` may mean dependency `a` will be the value of an input of name `a`, and dependency `b` is the DOM element of ID or name `b`.

The `callback` will not run until all dependencies are ready, i.e. all their values are not `undefined`. For example, a file input may not have a file selected yet, so it is not considered ready.

#### Callback

`callback` is called with the source's referenced object (i.e. HTML element or canvas context) and `args`, which is an object mapping from each dependency's name to its value.

`args` also contains a function `args.callback` which can be used to make the produce multiple values even after its dependencies have not changed. Since `on` already gets an element by ID for you, it's sometimes used just to attach event listeners to the element and produce values from there.

#### Output controls

Custom sources do not need to produce values, but producing a `File` object is recommended to populate output controls.
If the referenced element has an ancestor `.reform:io` (or itself has the class `.reform:io`), it will try finding a `.output-controls` to add as a dependency to the custom source.
