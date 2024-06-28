const youtube = "https://www.youtube.com";
let enabledFirstTime = true;

chrome.action.onClicked.addListener(async (tab) => {
  if (tab.url.startsWith(youtube)) {
    // Retrieve the action badge to check if the extension is 'ON' or 'OFF'
    const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
    // Next state will always be the opposite
    const nextState = prevState === "ON" ? "OFF" : "ON";

    // Set the action badge to the next state
    await chrome.action.setBadgeText({
      tabId: tab.id,
      text: nextState,
    });

    // Only insert once
    if (enabledFirstTime) {
      enabledFirstTime = false;
      // Insert the CSS file when the user turns the extension on
      await chrome.scripting.executeScript({
        files: ["typing.js"],
        target: { tabId: tab.id },
      });
    }
    else {
      (async () => {
        const response = await chrome.tabs.sendMessage(tab.id, { state: nextState });
        // do something with response here, not outside the function
        // console.log(response);
      })();
    }
  }
});
