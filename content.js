// Function to wait for an element in the DOM
function waitForElement(selector, callback, maxWait = 10000) {
    const interval = setInterval(() => {
        const element = document.querySelector(selector);
        if (element) {
            clearInterval(interval);
            callback(element);
        }
    }, 500);

    setTimeout(() => clearInterval(interval), maxWait);
}

async function solveCaptcha(captchaImgElement, callback) {
    try {
        const captchaText = await extractTextFromImage(captchaImgElement);
        console.log("Extracted CAPTCHA:", captchaText);

        if (captchaText && captchaText.length > 2) {
            callback(captchaText);
        } else {
            console.warn("OCR Failed, retrying...");
            retryCaptchaRecognition(captchaImgElement, callback);
        }
    } catch (error) {
        console.error("Error solving CAPTCHA:", error);
        showCaptchaError();
    }
}

function extractTextFromImage(imgElement) {
    return new Promise((resolve, reject) => {
        try {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            canvas.width = imgElement.width;
            canvas.height = imgElement.height;

            ctx.drawImage(imgElement, 0, 0, imgElement.width, imgElement.height);

            const imageData = canvas.toDataURL("image/png");

            Tesseract.recognize(imageData, "eng")
                .then(({ data: { text } }) => {
                    resolve(text.trim());
                })
                .catch(reject);
        } catch (err) {
            reject(err);
        }
    });
}

function retryCaptchaRecognition(captchaImgElement, callback) {
    setTimeout(() => {
        solveCaptcha(captchaImgElement, callback);
    }, 2000);
}

function showCaptchaError() {
    alert("Failed to recognize CAPTCHA. Please solve it manually.");
}

function loginUser(userId, userPassword) {
    const currentURL = window.location.href;

    if (currentURL === "https://students.cuchd.in/") {
        waitForElement("#txtUserId", (userIdInput) => {
            userIdInput.value = userId;
            const nextButton = document.querySelector('input[name="btnNext"]');
            if (nextButton) {
                nextButton.click();
            }
        });
    } else if (currentURL.includes("Login.aspx")) {
        waitForElement("#txtLoginPassword", (passwordInput) => {
            passwordInput.value = userPassword;

            waitForElement("img[src*='GenerateCaptcha.aspx']", (captchaImg) => {
                solveCaptcha(captchaImg, (captchaText) => {
                    waitForElement("#txtcaptcha", (captchaInput) => {
                        captchaInput.value = captchaText || "";
                        console.log("Entered CAPTCHA:", captchaText);

                        waitForElement('input[name="btnLogin"]', (loginButton) => {
                            loginButton.click();
                        });
                    });
                });
            });
        });
    }
}

chrome.storage.local.get(["autoLoginEnabled", "userId", "userPassword"], (data) => {
    if (data.autoLoginEnabled && data.userId && data.userPassword) {
        loginUser(data.userId, data.userPassword);
    }
});

