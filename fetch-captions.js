// Fetch url for auto-generated captions from youtube
async function getCaptionUrl() {
  const response = await fetch(window.location);
  rawHtml = await response.text();

  let matches = rawHtml.match(
    new RegExp('(?<=captionTracks.*baseUrl":")[^"]+"', "g"),
  );

  if (!matches) {
    return;
  }
  var decodedUrl = decodeUnicodeEscapeSequence(matches[0].replace('"', ""));
  return decodedUrl;
}

async function fetchCaptionsFromFile() {
  console.log("Reading captions from file.");
  var response = await fetch(chrome.runtime.getURL(offlineFile));
  rawXml = await response.text();
  var captions = parseXML(rawXml);
  console.log(`No of Captions: ${captions.length}`);
  return captions;
}

async function fectchCaptions() {
  const url = await getCaptionUrl();
  console.log(url);
  const response = await fetch(url);
  rawXml = await response.text();
  var captions = parseXML(rawXml);
  console.log(`No of Captions: ${captions.length}`);
  return captions;
}

