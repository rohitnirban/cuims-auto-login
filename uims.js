// Function to wait for an element in the DOM
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
    }, 1000);
}

function showCaptchaError() {
    alert("Failed to recognize CAPTCHA. Please solve it manually.");
}

function loginUser(userId, userPassword) {
    const currentURL = window.location.href;

    if (currentURL === "https://students.cuchd.in/" || currentURL === "https://students.cuchd.in/login.aspx") {
        waitForElement("#txtUserId", 10000).then((userIdInput) => {
            userIdInput.value = userId;
            const nextButton = document.querySelector('input[name="btnNext"]');
            if (nextButton) {
                nextButton.click();
            }
        }).catch((error) => {
            console.error(error);
        });
    } else if (currentURL.includes("identifier")) {
        waitForElement("#txtLoginPassword", 10000).then((passwordInput) => {
            passwordInput.value = userPassword;

            waitForElement("img[src*='GenerateCaptcha.aspx']", 10000).then((captchaImg) => {
                solveCaptcha(captchaImg, (captchaText) => {
                    waitForElement("#txtcaptcha", 10000).then((captchaInput) => {
                        captchaInput.value = captchaText || "";
                        console.log("Entered CAPTCHA:", captchaText);

                        waitForElement('input[name="btnLogin"]', 10000).then((loginButton) => {
                            loginButton.click();
                        }).catch((error) => {
                            console.error(error);
                        });
                    }).catch((error) => {
                        console.error(error);
                    });
                });
            }).catch((error) => {
                console.error(error);
            });
        }).catch((error) => {
            console.error(error);
        });
    }
}

chrome.storage.local.get(["autoLoginEnabled", "userId", "userPassword"], (data) => {
    if (data.autoLoginEnabled && data.userId && data.userPassword) {
        loginUser(data.userId, data.userPassword);
    }
});

async function fillCaptcha() {
    try {
        const captchaImage = await waitForElement('#captchaImage');
        const captchaText = await recognizeCaptcha(captchaImage);
        const captchaInput = await waitForElement('#captchaInput');
        captchaInput.value = captchaText;
        document.querySelector('#loginButton').click();
    } catch (error) {
        console.error('Error filling CAPTCHA:', error);
    }
}

fillCaptcha();

