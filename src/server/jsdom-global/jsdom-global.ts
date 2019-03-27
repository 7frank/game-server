
var KEYS = require('./keys')

var defaultHtml = '<!doctype html><html><head><meta charset="utf-8">' +
  '</head><body></body></html>'
export
  function globalJsdom(html, options) {
  if (html === undefined) {
    html = defaultHtml
  }

  if (options === undefined) {
    options = {}
  }

  // Idempotency
  // @ts-ignore
  if (global.navigator &&
    // @ts-ignore
    global.navigator.userAgent &&
    // @ts-ignore
    global.navigator.userAgent.indexOf('Node.js') > -1 &&
    // @ts-ignore
    global.document &&
    // @ts-ignore
    typeof global.document.destroy === 'function') {
    // @ts-ignore
    return global.document.destroy
  }

  var jsdom = require('jsdom')
  // var document = new jsdom.JSDOM(html, options)

  var document = jsdom.JSDOM.fromURL(html, options)
  return document.then((document) => {
    var window = document.window
    KEYS.forEach(function (key) {
      global[key] = window[key]
    })
    // @ts-ignore
    global.document = window.document
    // @ts-ignore
    global.window = window
    window.console = global.console
    document.destroy = cleanup




      // inject headless gl context HTMLCanvasElement.prototype.getContext
      var gl = require('gl')(400, 300, { preserveDrawingBuffer: true })
      console.warn("!!! patching headless gl context", gl)
      HTMLCanvasElement.prototype.getContext = function (type) {

        console.warn("!!! using headless gl context", gl)

        return gl
      }




  })

}

export
  function cleanup() {
  KEYS.forEach(function (key) { delete global[key] })
}