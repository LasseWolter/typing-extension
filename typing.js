// ================== VAR SETUP ==================
let running = true;
const offlineText = offline ? "[OFFLINE]" : "";
const placeholderText = offlineText + " Enable captions to see text here...";
let captions = [];
let textSoFar = [];

let counter = 0;
let idx = 0;
let text = "";
let textArr = []

// ================== MAIN ==================
document.body.insertBefore(createCaptionBox(), document.body.firstChild);
const captionBox = document.getElementById("captionBox");

document.body.insertBefore(createCaptionBox2(), document.body.firstChild);
const liveCaptionBox = document.getElementById("liveCaptionBox");

(async (offline, captions) => {
  if (offline) {
    console.log("OFFLINE MODE");
    captions = await fetchCaptionsFromFile(captions);
  } else {
    captions = await fectchCaptions(captions);
  }

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
      if (maxLinesToDisplay !== -1 && textArr.length > maxLinesToDisplay) {
        textArr.shift();
      }
      text = textArr.join('\n');
      idx++;
    }

    if (idx === 0) {
      captionBox.innerText = placeholderText;
    } else {
      captionBox.innerText = text;
    }

    updateTextSoFar(textSoFar);
    if (textSoFar.length === 0) {
      liveCaptionBox.innerText = placeholderText;
    }
    else {
      liveCaptionBox.innerText = textSoFarToString(textSoFar);
    }
  }, 1000 / fps); // 1000 milliseconds = 1 second
})(offline, captions)


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
function createCaptionBox() {
  let badge = document.createElement("div");
  // Use the same styling as the publish information in an article's header
  badge.id = "captionBox";
  badge.textContent = placeholderText;
  badge.style.background = "#d794d7";
  badge.style.fontSize = "18px";
  badge.style.margin = "10px";
  badge.style.width = "45vw";
  badge.style.padding = "20px";
  badge.style.position = "absolute";
  badge.style.top = "10px";
  badge.style.zIndex = 99999999; // needs to higher than all other page elements
  badge.style.borderRadius = "5px";

  return badge;
}

function createCaptionBox2() {
  let badge = document.createElement("div");
  // Use the same styling as the publish information in an article's header
  badge.id = "liveCaptionBox";
  badge.textContent = placeholderText;
  badge.style.background = "blue";
  badge.style.fontSize = "18px";
  badge.style.margin = "10px";
  badge.style.width = "40vw";
  badge.style.padding = "20px";
  badge.style.position = "absolute";
  badge.style.top = "10px";
  badge.style.left = "55vw";
  badge.style.zIndex = 99999999; // needs to higher than all other page elements
  badge.style.borderRadius = "5px";

  return badge;
}

function updateTextSoFar(textSoFarArr) {
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
}

function textSoFarToString(textSoFarArr) {
  let idx = Math.min(textSoFarArr.length, 10);
  return textSoFarArr.slice(-idx).join("\n");
}
