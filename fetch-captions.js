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

async function fectchCaptions(offline) {
  let response;
  if (offline) {
    console.log(`Reading captions from file: ${offlineFile}`);
    response = await fetch(chrome.runtime.getURL(offlineFile));
  } else {
    console.log(`Fetching captions from url: ${url}`);
    const url = await getCaptionUrl();
    response = await fetch(url);
  }

  rawXml = await response.text();
  var captions = parseXML(rawXml);
  captions = captions.map((c) => unescapeHtmlString(c));
  console.log(`No of Captions: ${captions.length}`);
  return captions;
}
