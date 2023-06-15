/* eslint-disable no-unused-expressions */
var path = require( 'path' )
  , exec = require( 'child_process' ).exec
  , PDFExtract = require( 'pdf.js-extract' ).PDFExtract
  , fs = require( 'fs' );

function extractText( filePath, options, cb ) {
  // See https://github.com/dbashford/textract/issues/75 for description of
  // what is happening here;
  const pdfExtract = new PDFExtract()
  , buffer = fs.readFileSync( filePath )
  , option = { disableCombineTextItems: true }; /* see below */
  pdfExtract.extractBuffer( buffer, option, ( err, data ) => {
    if ( err ) {
      const error = new Error( 'Error extracting PDF text for file at [[ ' +
        path.basename( filePath ) + ' ]], error: ' + err.message );
      cb( error, null );
      return;
    }

    if ( data ) {
      const fonts = {}
      , contents = data.pages.map( ({ content }) => content
        .sort( ({ y: aY }, { y: bY }) => aY - bY )
        .reduce( ( prev, { y, str, x, height, width, fontName }) => {
          const prevLen = prev.length;
          if ( prev[prevLen - 1] && prev[prevLen - 1].y === y ) {
            prev[prevLen - 1].str += str;
            prev[prevLen - 1].metas.push({ str, fontName, x, y, height, width });
          } else {
            prev.push({ str, metas: [{ str, fontName, x, y, height, width }], y });
          }
          fonts[fontName] ? fonts[fontName]++ : fonts[fontName] = 1;

          return prev;
        }, [] )
      )
      , texts = contents.map( ( content ) =>
          content.map( ({ str }) => str.trim() ? str.trim() : str ).join( `\n` )
        );
      cb( null, { texts: texts.join( '\n' ).trim(), contents, fonts });
    }
  });
}

function testForBinary( options, cb ) {
  exec( 'pdftotext -v',
    function( error, stdout, stderr ) {
      var msg;
      if ( stderr && stderr.indexOf( 'pdftotext version' ) > -1 ) {
        cb( true );
      } else {
        msg = 'INFO: \'pdftotext\' does not appear to be installed, ' +
         'so textract will be unable to extract PDFs.';
        cb( false, msg );
      }
    }
  );
}

module.exports = {
  types: ['application/pdf'],
  extract: extractText,
  test: testForBinary
};
