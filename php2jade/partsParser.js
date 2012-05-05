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

function performParse(source) {
  var fake   = [ {type:'php', code:'<?php something?>'}
               , {type:'php', code:'<?php get_more() ?>'}
               , {type:'html', code:'<hr>'}
               , {type:'unknown', code:'ababagalamaga'}
               ];
  return fake;
}

exports.parse = performParse;
