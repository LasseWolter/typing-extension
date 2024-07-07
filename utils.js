function decodeUnicodeEscapeSequence(str) {
  return str
    .replace(/\\u/g, "%u")
    .replace(/(%u)([a-fA-F\d]{4})/gi, function(_, _, hex) {
      return String.fromCharCode(parseInt(hex, 16));
    });
}

function parseXML(xmlStr) {
  // Create a new DOMParser object
  var parser = new DOMParser();

  // Parse the XML string into a DOM Document
  var doc = parser.parseFromString(xmlStr, "application/xml");

  // Find all <text> elements in the document
  var texts = Array.from(doc.querySelectorAll("text"));

  // Extract the text content of each <text> element and store it in an array
  var textContents = texts.map((textElement) => textElement.textContent.trim());

  return textContents;
}
