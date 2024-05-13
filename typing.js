const videoContainer = document.querySelector(".html5-video-container");
const placeholderText = 'Enable captions to see text here...'

const text = [];


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

const badge = document.getElementById("badgyBadge");


setInterval(function() {
	// Code to update the UI goes here
	let segments = document.querySelectorAll(".ytp-caption-segment");
	let textArr = Array.from(segments).map(x => x.innerText);
	if (text.slice(-5).includes(textArr[-1])) {
		return;
	}
	outerLoop: for (let t of textArr.splice(-1)) {
		for (let existingText of text.slice(-5)) {
			if (t.startsWith(existingText)) {
				text.pop();
				text.push(t);
				continue outerLoop;
			}
		}
		text.push(t)
	}
	let idx = Math.min(text.length, 10)


	if (idx === 0) {
		badge.innerText = placeholderText;
	}
	else {
		badge.innerText = text.slice(-idx).join('\n');
	}
}, 100); // 1000 milliseconds = 1 second
