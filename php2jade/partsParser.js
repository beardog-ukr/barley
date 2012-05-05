var util = require('util');

function getParts(source) {


  var result = [];

  var cch = '' ;//current symbol
  var pch = '' ;//previous symbol
  var cp = {type:'', code:''}; //current part


  //values for state:
  //10: waiting for next token
  // 11: got <
  // 12: got <! and some symbols; checking for <!-- or <!DOCTYPE
  //20: parsing php code
  // 21:
  // 21: inside php comment, waiting for newline
  //30: undefined states
  //40: processing <!DOCTYPE
  // 41: processing first letters
  // 42: processing other stuff
  //50: html comment ('<!--')
  //60: html tag
  //100: php sequence


  var state = 1 ;
  var cindex=0;

  var stop = false;
  while (!stop) {
    cch = source[cindex];

    switch(state) {
      case 10:
        if ((cch === ' ')||(cch==='\t')||(cch==='\n')) {
          //just skip it
        }
        else if (cch==='<') {
          cp.code += cch ;
          state = 11;
        }
        else {
          cp.code += cch ;
          state = 30;
        }
        cindex++;
        break;

      case 11:
        if (cch==='!') {
          state = 12;
        }
        else if(cch==='?') {
          state = 100;
        }
        else {
          state=60;
        }
        cp.code += cch ;
        cindex++;
        break;

      case 12:
        var cs = cp.code + cch;
        var sampleCommentStart = '<!--';
        var isCommentStart = false;
        if (cs.length<=sampleCommentStart.length) {
          isCommentStart = true;
          for(var i=0; i<cs.length; i++) {
            if (cs[i]!==sampleCommentStart[i]) {
              isCommentStart = false;
              break;
            }
          }
        }

        var sampleDoctype = '<!DOCTYPE';
        var isDoctype = false;
        if ((!isCommentStart)&&(cs.length<=sampleDoctype.length)) {
          isDoctype = true;
          for(var i=0; i<cs.length; i++) {
            if (cs[i]!==sampleDoctype[i]) {
              isDoctype = false;
              break;
            }
          }
        }

        if ((isDoctype)||(isCommentStart)) {
          if (isDoctype) {
            if (cs === sampleDoctype) {
              state = 40 ;
            }
            cp.code = cs;
          }

          if (isCommentStart) {
            if (cs === sampleCommentStart) {
              state = 50 ;
            }
            cp.code = cs;
          }

          cindex++
        }
        else {
          //go to undefined state
          state = 30;
          cp.code = cs;
          cindex++;
        }
        break;

      case 20:
        if ((cch === ' ')||(cch==='\t')||(cch==='\n')) {
          //just skip it
        }
        else if (cch==='<') {
          cp.code += cch ;
          state = 11;
        }
        else {
          cp.code += cch ;
          state = 30;
        }
        cindex++;
        break;










      default:
        console.log('error: wrong state(%i) at %i, buffer = %s', state, cindex, codeBuffer);
        stop = true;
    }

  }//of while


  return result;
}

function performFakeParse(source) {
  var fake   = [ {type:'php', code:'<?php something?>'}
               , {type:'php', code:'<?php get_more() ?>'}
               , {type:'html', code:'<hr>'}
               , {type:'unknown', code:'ababagalamaga'}
               ];
  return fake;
}

function stepFindNewPart() {
  //
}




function PartsParser(ss) {

  var self = this;

  var source = ss;
  var results  = [];
  var currentIndex = 0;
  var errorMessage = '';
  var nextStep = stepInitialCheck;

  var cp = {type:'', code:''};

  this.makeNextStep = function() {
    if (nextStep===null) {
      return false ;
    }

    nextStep() ;
    return true;
  };

  this.getErrorMessage = function() {
    return errorMessage;
  };

  this.getResults = function() {
    return results;
  };

  // --------------------------------------------------------------------------
/**
 *
 */
  function stepContent() {
//    console.log('stepContent here');
    cp = {type:'content', code:''}; //current part
    var cch = source[currentIndex]; //current character

    var stop = false;
    while(!stop) {
      if (cch==='<') {
        results.push(cp);
        nextStep = stepLt;
        stop = true;
      }
      else {
        cp.code += cch ;
        currentIndex++ ;
//        console.log('stepContent added %s (%s)', cch, cp.code);

        if (currentIndex<=source.length) {
          cch = source[currentIndex];
        }
        else {
          nextStep = null;
          results.push(cp);
          stop = true;
        }
      }
    }//while
  }

/**
 *
 */
  function stepDoctype() {
    // not implemented yet
    errorMessage = 'Stub call: stepDoctype' ;
    nextStep = null;
  }

/**
 *
 */
  function stepFindNewPart() {
//    console.log('stepFindNewPart here');
//    var fo = {type:'one', code:'two'};
//    results.push(fo);

    var cch = source.charAt(currentIndex);
//    var spacere = new RegExp('/[ \f\n\r\t\v\u00A0\u2028\u2029]/');
    while( (cch===' ') || (cch==='\t') || (cch==='\r') || (cch==='\n') ) {
      currentIndex++ ;//
      if (currentIndex<=source.length) {
        cch = source.charAt(currentIndex);
      }
      else {
        nextStep = null;
        return;
      }
    }

    if (cch==='<') {
//      console.log('stepFindNewPart: will go to stepLt (%s, %i)', util.inspect(cch), currentIndex);
      nextStep = stepLt;
    }
    else {
//      console.log('stepFindNewPart: will go to stepContent (%s, %i)', util.inspect(cch), currentIndex);
      nextStep = stepContent;
    }
  }

// ---------------------------------------------------------------------------
/**
 *
 */
  function stepHtml() {
    cp = {type:'html', code:''}; //current part
    var cch = source[currentIndex]; //current character

    var stop = false;
    while(!stop) {
      if (cch==='>') {
        cp.code += cch ;
        results.push(cp);
        cp = {type:'', code:''}; //reset cp?
        currentIndex++ ;
        nextStep = stepFindNewPart;
        stop = true;
      }
      else {
        cp.code += cch ;
        currentIndex++ ;

        if (currentIndex<=source.length) {
          cch = source[currentIndex];
        }
        else {
          nextStep = null;
          results.push(cp);
          stop = true;
        }
      }
    }//while
  }

// ---------------------------------------------------------------------------
/**
 *
 */
  function stepHtmlComment() {
    // not implemented yet
    errorMessage = 'Stub call: stepHtmlComment' ;
    nextStep = null;
  }

// ---------------------------------------------------------------------------
/**
 *
 */
  function stepInitialCheck() {
//    console.log('stepInitialCheck here %s', source);
    if (source.length<5) {
      errorMessage = 'Source string too short';
      nextStep = null;
    }
    else {
      nextStep = stepFindNewPart;
    }
  }

// ---------------------------------------------------------------------------
/**
 *
 */
  function stepLt() {

/**
 * Checks if source at current position matches given sample
 * @param {String} sample A sample string
 * */
    function checkLine(sample) {
      if ((currentIndex+sample.length)>=source.length) {
        return false; //
      }

      for(var si =0; si<sample.length; si++) {
        if(sample[si]!==source[currentIndex+si]) {
          return false;
        }
      }
      return true;
    }

    //--- one more check
    if (source[currentIndex]!=='<') {
      errorMessage = 'Reached stepLt() with wrong index';
      nextStep = null;
      return;
    }

    //
    var found = false;
    var starts = [ { start: '<!--', func:stepHtmlComment }
                 , { start: '<!DOCTYPE', func:stepDoctype }
                 , { start: '<?=', func:stepPhp }
                 , { start: '<?php', func:stepPhp }
                 ];
    for (var sti=0; sti<starts.length; sti++) {
      var se = starts[sti];
      if (checkLine(se.start)) {
        nextStep = se.func;
        cp.code = se.start;
        currentIndex+= se.start.length;
        found = true;
        break;
      }
    };

    if (!found) {
      nextStep = stepHtml ;
    }

  }

// ---------------------------------------------------------------------------
/**
 *
 */
  function stepPhp() {
    cp.type = 'php'; //current part
    var cch = source[currentIndex]; //current character

    var stop = false;
    while(!stop) {
      if (cch==='>') {
        cp.code += cch ;
        results.push(cp);
        currentIndex++ ;
        nextStep = stepFindNewPart;
        stop = true;
      }
      else {
        cp.code += cch ;
        currentIndex++ ;

        if (currentIndex<=source.length) {
          cch = source[currentIndex];
        }
        else {
          nextStep = null;
          results.push(cp);
          stop = true;
        }
      }
    }//while
  }

}


// ============================================================================
/**
 *
 */
function performFakeParse() {
  var fake   = [ {type:'php', code:'<?php something?>'}
               , {type:'php', code:'<?php get_more() ?>'}
               , {type:'html', code:'<hr>'}
               , {type:'unknown', code:'ababagalamaga'}
               ];
  return fake;
}

function performParse(source) {
  var parser = new PartsParser(source) ;

  var hasToWork = true;
  while (hasToWork) {
    hasToWork = parser.makeNextStep();
  }

  var em = parser.getErrorMessage();
  if (em!=='') {
    console.log('PartsParserError: %s', em);
  }

  return parser.getResults();
}


exports.parse = performParse; //performFakeParse;
