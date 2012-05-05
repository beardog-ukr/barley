var util = require('util');

// ============================================================================

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

        if (currentIndex<source.length) {
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
    cp.type='doctype'; //current part
    var cch = source[currentIndex]; //current character

    var stop = false;
    while(!stop) {
      if (cch==='>') {
        cp.code += cch ;
        results.push(cp);
        cp = {type:'', code:''}; //
        currentIndex++ ;
        nextStep = stepFindNewPart;
        stop = true;
      }
      else {
        cp.code += cch ;
        currentIndex++ ;

        if (currentIndex<source.length) {
          cch = source[currentIndex];
        }
        else { //well, it's almost impossiblle situation for '<!DOCTYPE' entries, but just in case
          nextStep = null;
          results.push(cp);
          stop = true;
        }
      }
    }
  }

/**
 *
 */
  function stepFindNewPart() {
//    console.log('stepFindNewPart here');
    var cch = '';
    if (currentIndex<source.length) {
      cch = source.charAt(currentIndex);
    }
    else {
      nextStep = null;
      return ;
    }

    while( (cch===' ') || (cch==='\t') || (cch==='\r') || (cch==='\n') ) {
      currentIndex++ ;//
      if (currentIndex<source.length) {
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
      console.log('stepFindNewPart: will go to stepContent (%s, %i)', util.inspect(cch), currentIndex);
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

        if (currentIndex<source.length) {
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

        if (currentIndex<source.length) {
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

// ============================================================================
/**
 *
 */
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

// ============================================================================
// ============================================================================
// ============================================================================

exports.parse = performParse; //performFakeParse;
