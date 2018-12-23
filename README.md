# stream-signature

Get the mimetype of a stream based on its contents.

Data for this script was generated from: 
http://en.wikipedia.org/wiki/List_of_file_signatures and by looking at file headers with a Hex editor

This is a fork of [buffer-signature](https://github.com/iarna/buffer-signature) 
by [@iarna](https://github.com/iarna).

**Note: To match against any file format, you'll need a minimum of 22 bytes from the
start of the file.**

## Example use:
```js

const fs = require('fs')
const streamSignature = require('stream-signature')
const signature = new streamSignature()

signature.on('signature', signature => {
  console.log(JSON.stringify(signature, null, 2))
})

fs.createReadStream('path/to/file.png')
.pipe(signature)
.pipe(…whatever else you want to do with the data…)

// outputs:
// {
//   "mimetype": "image/png",
//   "description": "Image encoded in the Portable Network Graphics format",
//   "extensions": [
//     "png"
//   ]
// }
```

#### Changes form `buffer-signature`

* Converted to a PassThrough stream
* No Dependancies
* Emits 'signature' event as soon file signature is detected
  * this event will also be emmited after no signature can be determined with the default `application/octet-stream` as the mimetype with an aditonal property `unknown` set to `true`
* Added more missing filetypes such as:
  * MP4
  * MOV
