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
  if (hideCaptionBox) {
    badge.style.display = 'none';
  }

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

  if (textArr && textArr.length > 0) {
    if (textArr.length > textSoFarArr) {
      for (let line of textArr) {
        textSoFarArr.push(line);
      }
      return;
    }

    // This approach checks if the current line in view is already being displayed. 
    // - If yes, we need to update the current line
    // - If no, we need to add a new line

    // This still allows for mutliple lines with the same text following each other
    // This is because we use .startsWith which will be false for a new line because the last line so far will
    // be longer than the current text in view. 
    lastLineInView = textArr[textArr.length - 1];
    lastLineSoFar = textSoFarArr[textSoFarArr.length - 1];
    if (lastLineInView.startsWith(lastLineSoFar)) {
      textSoFarArr[textSoFarArr.length - 1] = lastLineInView;
    }
    else {
      textSoFarArr.push(lastLineInView)
    }
  }
}


function textSoFarToString(textSoFarArr) {
  if (maxLinesToDisplay === -1) {
    return textSoFarArr.join("\n");
  }
  let idx = Math.min(textSoFarArr.length, maxLinesToDisplay);
  return textSoFarArr.slice(-idx).join("\n");
}
