//var fs = require('fs');
var path = require('path');

var php2jade = require(__dirname + '/php2jade/php2jade.js');

// ============================================================================
/**
 * Performs all needed actions
 */
function generate(mainPath, resultPath) {

  //---
  php2jade.transform(mainPath+'/php2jade/phpTests/helloWorld01.php', resultPath + '/some.jade');
}


generate(__dirname, __dirname + '/result');





