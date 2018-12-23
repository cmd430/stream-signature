const stream = require('stream')
const util = require('util')

module.exports = streamSignature

function streamSignature (options) {
  if (!(this instanceof streamSignature)) {
    return new streamSignature(options)
  }
  stream.PassThrough.call(this, options)
  this.filetypes = require('./signatures.js')
  this.buffer = {
    size: 0,
    complete: false,
    chunks: []
  }
  this.signature = {
    unknown: true,
    mimetype: 'application/octet-stream',
    description: 'unknown',
    extensions: []
  }
  this.destroyed = false
}

util.inherits(streamSignature, stream.PassThrough)

streamSignature.prototype.end = function (data, enc, cb) {
  if (typeof data === 'function') return this.end(null, null, data)
  if (typeof enc === 'function') return this.end(data, null, enc)
  if (data) this.write(data)
  return stream.PassThrough.prototype.end.call(this, cb)
}

streamSignature.prototype.write = function (chunk) {
  if (!this.buffer.complete) {
    this.buffer.chunks.push(chunk)
    this.buffer.size += chunk.length
    if (this.buffer.size >= 22) {
      this.buffer.complete = true
      this.buffer.data = Buffer.concat(this.buffer.chunks, this.buffer.size)
      let exitFor = false
      for (let filetype of this.filetypes) {
        signatures: for (let sig of filetype.signatures) {
          let matches = true
          for (let ii = 0; ii < sig.length; ii += 2) {
            const offset = sig[ii]
            const byteSeq = sig[ii+1]
            if (!byteSeq.equals(this.buffer.chunks.slice(offset, offset + byteSeq.length))) {
              matches = false
              continue signatures
            }
          }
          if (matches) {
            this.signature = {
              mimetype: filetype.mimetype || 'application/octet-stream',
              description: filetype.description || '',
              extensions: filetype.extensions || []
            }
            exitFor = true
            break
          }
        }
        if (exitFor) break
      }
      this.emit('signature', this.signature)
    }
  }
  return stream.PassThrough.prototype.write.call(this, chunk)
}

streamSignature.prototype.destroy = function (err) {
  if (this.destroyed) return
  this.destroyed = true
  if (err) this.emit('error')
  this.emit('close')
}
