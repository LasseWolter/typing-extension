// ================== VAR SETUP ==================
let running = true;
const offlineText = offline ? "[OFFLINE]" : "";
const placeholderText = offlineText + " Enable captions to see text here...";
let captions;
let textSoFarArr = [];

let counter = 0;
let idx = 0;
let text = "";
let textArr = []

// ================== MAIN ==================
addCaptionBox();

if (offline) {
  console.log("OFFLINE MODE");
  fetchCaptionsFromFile();
} else {
  fectchCaptions();
}

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
  // Mutiply by fps to make display time independent of the framerate
  if (counter % (lineDisplayDuration * fps) === 0) {
    textArr.push(captions[idx]);
    if (textArr.length > maxLinesToDisplay) {
      textArr.shift();
    }
    text = textArr.join('\n');
    idx++;
  }

  if (idx === 0) {
    badge.innerText = placeholderText;
  } else {
    badge.innerText = text;
  }
}, 1000 / fps); // 1000 milliseconds = 1 second

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
