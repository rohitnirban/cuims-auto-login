function waitForElement(selector, callback) {
    const interval = setInterval(() => {
        const element = document.querySelector(selector);
        if (element) {
            clearInterval(interval);
            callback(element);
        }
    }, 100);
}

function loginUser(userId, userPassword) {
    const currentURL = window.location.href;

    if (currentURL.startsWith("https://lms.cuchd.in/login/index.php")) {
        waitForElement("#username", (userIdInput) => {
            userIdInput.value = userId;
        });
        waitForElement("#password", (passwordInput) => {
            passwordInput.value = userPassword;
        });
        waitForElement("#loginbtn", (loginButton) => {
            loginButton.click();
        });
    }
}

chrome.storage.local.get(["autoLoginEnabled", "userId", "userPassword"], (data) => {
    if (data.autoLoginEnabled && data.userId && data.userPassword) {
        loginUser(data.userId, data.userPassword);
    }
});

