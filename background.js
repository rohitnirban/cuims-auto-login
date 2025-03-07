chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "openAndLogin") {
        const url = "https://students.cuchd.in";

        chrome.tabs.create({ url }, (tab) => {
            chrome.storage.local.set({
                userId: message.userId,
                userPassword: message.userPassword
            });

            chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
                if (tabId === tab.id && info.status === "complete") {
                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        files: ["uims.js"]
                    });

                    chrome.tabs.onUpdated.removeListener(listener);
                }
            });
        });
    }
    if (message.action === "openAndLoginLms") {
        const url = "https://lms.cuchd.in/login/index.php";

        chrome.tabs.create({ url }, (tab) => {
            chrome.storage.local.set({
                userId: message.userId,
                userPassword: message.userPassword
            });

            chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
                if (tabId === tab.id && info.status === "complete") {
                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        files: ["lms.js"]
                    });

                    chrome.tabs.onUpdated.removeListener(listener);
                }
            });
        });
    }
});


