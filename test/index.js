let textract = require( '../lib' );

textract.fromFileWithPath( '/Users/xplicit/Documents/work/personal/ai-cv-generator-documents/cvs/Oluwadamilare Arabambi .pdf', { preserveLineBreaks: true }, ( error, text ) => {
  console.log({ error, text });
});
