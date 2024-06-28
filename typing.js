// ================== CONFIGS ==================
// Will load offlineFile (specified below) from disk instead of trying to fetch it from the internet
const offline = true;
const offlineFile = "sample/caption.xml";
// ================== CONFIGS END ==================

// ================== VAR SETUP ==================
let running = true;
const placeholderText = "Enable captions to see text here...";
let captions;
let textSoFarArr = [];

const speed = 10;
let counter = 0;
let idx = 0;
let text = "";

// ================== MAIN ==================
setup();
const badge = document.getElementById("badgyBadge");

// Constant UI update loop
var intervalID = setInterval(function() {
  counter++;
  if (!running) {
    return;
  }
  if (!captions || idx == captions.length - 1) {
    console.log("Reached end of the file");
    clearInterval(intervalID);
  }
  if (counter % speed === 0) {
    text = text + captions[idx] + "\n";
    idx++;
  }

  if (idx === 0) {
    badge.innerText = placeholderText;
  } else {
    badge.innerText = text;
  }
}, 100); // 1000 milliseconds = 1 second

// Allows starting and stopping the captions from service worker  
chrome.runtime.onMessage.addListener(
  function(request, _, _) {
    if (request.state) {
      if (request.state === "ON") {
        running = true
      }
      else if (request.state === "OFF") {
        running = false
      }
      else {
        throw `Invalid state. ${request.state} is not a valid state.`;
      }
    }
  }
);

// ================== FUNCTIONS ==================
function setup() {
  addCaptionBox();

  if (offline) {
    console.log("OFFLINE MODE");
    fetchCaptionsFromFile();
  } else {
    fectchCaptions();
  }
}

function addCaptionBox() {
  const badge = document.createElement("div");
  // Use the same styling as the publish information in an article's header
  badge.id = "badgyBadge";
  badge.textContent = placeholderText;
  badge.style.background = "#d794d7";
  badge.style.fontSize = "18px";
  badge.style.margin = "10px";
  badge.style.width = "100vw";
  badge.style.padding = "20px";
  badge.style.position = "absolute";
  badge.style.top = "10px";
  badge.style.zIndex = 99999999; // needs to higher than all other page elements
  badge.style.borderRadius = "5px";

  document.body.insertBefore(badge, document.body.firstChild);
}

function decodeUnicodeEscapeSequence(str) {
  return str
    .replace(/\\u/g, "%u")
    .replace(/(%u)([a-fA-F\d]{4})/gi, function(_, _, hex) {
      return String.fromCharCode(parseInt(hex, 16));
    });
}

// fetch auto captions from youtube
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
  var textContents = parseXML(rawXml);
  captions = textContents;
  console.log(`No of Captions: ${captions.length}`);
  return textContents;
}

async function fectchCaptions() {
  const url = await getCaptionUrl();
  console.log(url);
  const response = await fetch(url);
  rawXml = await response.text();
  var textContents = parseXML(rawXml);
  captions = textContents;
  console.log(`No of Captions: ${captions.length}`);
  return textContents;
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

function textSoFar() {
  // Code to update the UI goes here
  let segments = document.querySelectorAll(".ytp-caption-segment");
  let textArr = Array.from(segments).map((x) => x.innerText);
  if (textSoFarArr.slice(-5).includes(textArr[-1])) {
    return;
  }
  outerLoop: for (let t of textArr.splice(-1)) {
    for (let existingText of textSoFarArr.slice(-5)) {
      if (t.startsWith(existingText)) {
        textSoFarArr.pop();
        textSoFarArr.push(t);
        continue outerLoop;
      }
    }
    textSoFarArr.push(t);
  }
  let idx = Math.min(textSoFarArr.length, 10);

  return textSoFarArr.slice(-idx).join("\n");
}
