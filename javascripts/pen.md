# Scratch-like Pen in JavaScript
This was made for JavaScript learners.

To use, just make sure there's
```html
<script src="somewhere/pen.js"></script>
```
somewhere in your document. Then, in a script tag, you can do
```javascript
var pen=new Pen(480,360);
```
The `480` and `360` is the width and the height in pixels, respectively. The coordinate system is based off Scratch, where the origin is in the centre and positive Y is upwards.

## Motion
```javascript
pen.x=30; // set x to 30
pen.y=40; // set y to 40
pen.goto(0,0); // go to x: 0 y: 0
```
This is how you can change the psuedosprite's position. If the pen was down, it'd draw lines.

## Pen
There are no looks or sound blocks because they aren't really pen related. Here are the pen blocks:
```javascript
pen.clear; // clear
pen.penDown; // pen down
pen.penUp; // pen up
pen.colour='rgba(255,255,255,0.5)'; // set pen color to 2147483647
pen.size=100; // set pen size to 100
pen.pen.down // pen down?
pen.pen.size // pen size
pen.pen.colour // pen colour
```
The pen colour can be a name (like `white`), in hexadecimal format (like `#ffffff`), RGB(A) format (like `rgb(1,2,3)` or `rgba(1,2,3,0.2)`; the alpha channel is between 0 and 1), or HSL(A) format (like `hsl(0,0%,0%)`).

## Control
There are no data blocks because they're already built into JavaScript and there are no event blocks because usually 100% pen projects only run off of a single when green flag clicked block. Here're the control blocks:
```javascript
pen.wait(1,()=>{ // wait 1 secs
  /* CODE HERE */
});
pen.repeat(10,()=>{ // repeat 10
  /* CODE HERE */
});
pen.forever(()=>{ // forever
  /* CODE HERE */
});
pen.until(true,()=>{ // repeat until
  /* CODE HERE */
});
```
Out of the three loops, `forever` runs 60 times per second. `repeat` and `until` try to run all of it in one frame, so make sure they don't go on forever.

## Sensing
```javascript
pen.colourAt(0,0) // color at x: 0 y: 0
pen.mouse.down // mouse down?
pen.mouse.X // mouse x
pen.mouse.Y // mouse y
```
`colourAt` is based off the suggested [color at x: y:](https://scratch.mit.edu/discuss/topic/250529/) block that returns the colour of a pixel. Here it returns the colour in hexadecimal (ARGB like on Scratch) converted to decimal.
