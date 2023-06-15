let textract = require( '../lib' );

textract.fromFileWithPath( '/Users/xplicit/Documents/work/personal/ai-cv-generator-documents/cvs/Oluwakemi Akinola-Adedeji_Resume.pdf', { preserveLineBreaks: true }, ( error, text ) => {
  console.log({ text: text.texts });
});
