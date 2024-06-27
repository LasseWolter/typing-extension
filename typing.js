var videoContainer = document.querySelector(".html5-video-container");
var placeholderText = 'Enable captions to see text here...'
var captions;

function decodeUnicodeEscapeSequence(str) {
	return str.replace(/\\u/g, '%u').replace(/(%u)([a-fA-F\d]{4})/ig, function(_, _, hex) {
		return String.fromCharCode(parseInt(hex, 16));
	});
}

// fetch auto captions from youtube 
async function getCaptionUrl() {
	const response = await fetch(window.location);
	rawHtml = await response.text();

	let matches = rawHtml.match(new RegExp('(?<=captionTracks.*baseUrl":")[^"]+"', 'g'));

	if (!matches) {
		return;
	}
	var decodedUrl = decodeUnicodeEscapeSequence(matches[0].replace('"', ''));
	return decodedUrl;
}

async function fectchCaptions() {

	const url = await getCaptionUrl();
	console.log(url);
	const response = await fetch(url);
	rawXml = await response.text();
	var textContents = parseXML(rawXml);
	captions = textContents;
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
	var textContents = texts.map(textElement => textElement.textContent.trim());

	return textContents;
}


// `document.querySelector` may return null if the selector doesn't match anything.
if (videoContainer) {
	const badge = document.createElement("div");
	// Use the same styling as the publish information in an article's header
	badge.id = "badgyBadge";
	badge.classList.add("color-secondary-text", "type--caption");
	badge.textContent = placeholderText;
	badge.style.background = '#d794d7';
	badge.style.fontSize = '18px';
	badge.style.margin = '10px';
	badge.style.padding = '20px';

	let columns = document.getElementById('columns');

	columns.insertAdjacentElement("beforeBegin", badge);
}

var badge = document.getElementById("badgyBadge");

var textSoFarArr = [];
function textSoFar() {
	// Code to update the UI goes here
	let segments = document.querySelectorAll(".ytp-caption-segment");
	let textArr = Array.from(segments).map(x => x.innerText);
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
		textSoFarArr.push(t)
	}
	let idx = Math.min(textSoFarArr.length, 10)

	return textSoFarArr.slice(-idx).join('\n');
}


var speed = 10;

let counter = 0;
let idx = 0;
let text = ''
fectchCaptions()

setInterval(function() {
	counter++;
	if (counter % speed === 0) {
		text = text + '\n' + captions[idx];
		idx++;
	}

	if (idx === 0) {
		badge.innerText = placeholderText;
	}
	else {
		badge.innerText = text;
	}
}, 100); // 1000 milliseconds = 1 second
