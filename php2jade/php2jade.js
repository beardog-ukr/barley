var fs = require('fs');
//var path = require('path');
var util = require('util');
//var Buffer = require('buffer').Buffer;
//var BufferMaxSize = 10*1024*1024 ;


// ============================================================================
/**
 * Attempts to transform php file into jade
 *
 *
 * @param {String}
 * @param {String}
 */
function transformFiles(sourcePath, resultPath) {
  console.log('transformFiles: here %s, to %s', sourcePath, resultPath);
  fs.readFile(sourcePath, 'utf8',  function(err, data) {
    if (err) {//
      console.log('> failed to read file %s', sourcePath);
      return ;
    }

    var partsParser = require(__dirname+'/partsParser.js');
    var parts = partsParser.parse(data) ;

    var partsStr = '';//util.inspect(parts, false, 2);
    parts.forEach(function(part) {
      partsStr += part.type + ': ' + part.code + '\n';
    });


    fs.writeFile(resultPath, partsStr, 'utf8', function (err) {
      if (err) {
        console.log('> failed to write file %s', resultPath);
        return ;
      }
    });
  });
//
}

//---
exports.transform = transformFiles ;