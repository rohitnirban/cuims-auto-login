function waitForElement(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
        const interval = 100;
        let elapsedTime = 0;

        const checkExist = setInterval(() => {
            const element = document.querySelector(selector);
            if (element) {
                clearInterval(checkExist);
                resolve(element);
            } else if (elapsedTime >= timeout) {
                clearInterval(checkExist);
                reject(new Error(`Element ${selector} not found within ${timeout}ms`));
            }
            elapsedTime += interval;
        }, interval);
    });
}

function loginUser(userId, userPassword) {
    const currentURL = window.location.href;

    if (currentURL == "https://lms.cuchd.in/login/index.php" || currentURL == "https://lms.cuchd.in/login/index.php?loginredirect=1") {
        waitForElement("#username").then((userIdInput) => {
            userIdInput.value = userId;
        });
        waitForElement("#password").then((passwordInput) => {
            passwordInput.value = userPassword;
        });
        waitForElement("#loginbtn").then((loginButton) => {
            loginButton.click();
        });
    }
}

chrome.storage.local.get(["autoLoginEnabled", "userId", "userPassword"], (data) => {
    if (data.autoLoginEnabled && data.userId && data.userPassword) {
        loginUser(data.userId, data.userPassword);
    }
});

