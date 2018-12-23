const fs = require('fs')
const streamSignature = require('../index.js')
const signature = new streamSignature()
let testfile = 'test/example.png'

signature.on('signature', signature => {
  console.log('File signature for file:', testfile)
  console.log(JSON.stringify(signature, null, 2))
})

fs.createReadStream(testfile).pipe(signature)