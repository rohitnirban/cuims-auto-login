(() => {
    if (window.cuimsAutoLoginLoaded) return;
    window.cuimsAutoLoginLoaded = true;

    const CONFIG = {
        MAX_RETRIES: 7,
        OCR_API_KEYS: [
            "K86940850288957",
            "K83300106788957",
            "K89935611888957",
            "K85050292688957",
            "K83675191488957",
            "K84547944988957",
            "K88166917288957"
        ],
        CAPTCHA_SELECTOR: "img[src*='GenerateCaptcha.aspx']",
        REFRESH_TIMEOUT: 3000,
        OCR_TIMEOUT: 10000,
        OCR_API_URL: "https://api.ocr.space/parse/image"
    };

    // Helper to get a random API key
    const getRandomAPIKey = () =>
        CONFIG.OCR_API_KEYS[Math.floor(Math.random() * CONFIG.OCR_API_KEYS.length)];

    // Optimized element waiter using MutationObserver
    const waitForElement = (selector, timeout = 10000) => new Promise((resolve, reject) => {
        const start = Date.now();
        const observer = new MutationObserver(() => {
            const el = document.querySelector(selector);
            if (el) {
                observer.disconnect();
                resolve(el);
            } else if (Date.now() - start > timeout) {
                observer.disconnect();
                reject(`Timeout: ${selector}`);
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
        // Initial check in case the element already exists
        const el = document.querySelector(selector);
        if (el) {
            observer.disconnect();
            resolve(el);
        }
    });

    // Unified error handler
    const handleError = (error, context) =>
        console.error(`[${context}]`, error);

    // Optimized CAPTCHA solver
    const solveCaptcha = async (imgElement, callback) => {
        let retryCount = 0;

        while (retryCount < CONFIG.MAX_RETRIES) {
            try {
                const captchaText = await Promise.race([
                    extractTextFromImage(imgElement),
                    new Promise((_, r) => setTimeout(r, CONFIG.OCR_TIMEOUT, "OCR timeout"))
                ]);

                if (/^[a-z0-9]{4}$/i.test(captchaText)) {
                    callback(captchaText);
                    return;
                }

                retryCount++;
                await refreshCaptcha(imgElement);
                imgElement = await waitForElement(CONFIG.CAPTCHA_SELECTOR);
            } catch (error) {
                handleError(error, "CAPTCHA Solver");
                retryCount++;
            }
        }
        handleError("Max retries reached", "CAPTCHA Solver");
    };

    // Efficient CAPTCHA refresh
    const refreshCaptcha = async (imgElement) => {
        try {
            const newSrc = `${imgElement.src.split('?')[0]}?t=${Date.now()}`;
            await new Promise((resolve, reject) => {
                imgElement.onload = resolve;
                imgElement.onerror = reject;
                imgElement.src = newSrc;
                setTimeout(reject, CONFIG.REFRESH_TIMEOUT);
            });
        } catch {
            document.querySelector("#lnkupCaptcha")?.click();
            await waitForElement(CONFIG.CAPTCHA_SELECTOR);
        }
    };

    // Optimized OCR with proper image processing
    const extractTextFromImage = async (imgElement) => {
        try {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            // Draw the image onto the canvas
            canvas.width = imgElement.width;
            canvas.height = imgElement.height;
            ctx.drawImage(imgElement, 0, 0, imgElement.width, imgElement.height);

            // Preprocess the image for better OCR accuracy
            ctx.filter = "contrast(150%) brightness(110%) grayscale(100%)";
            ctx.drawImage(imgElement, 0, 0, imgElement.width, imgElement.height);

            // Convert canvas to base64 image
            const imageData = canvas.toDataURL("image/png");

            // Send the image to OCR API
            const response = await fetch(CONFIG.OCR_API_URL, {
                method: "POST",
                headers: {
                    "apikey": getRandomAPIKey(),
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams({
                    "base64Image": imageData,
                    "language": "eng",
                    "OCREngine": "2",
                    "scale": "true",
                    "isTable": "false"
                })
            });

            const data = await response.json();
            return data.ParsedResults?.[0]?.ParsedText?.trim().slice(0, 4) || "";
        } catch (error) {
            handleError(error, "OCR");
            return "";
        }
    };

    // Optimized login flow
    const loginUser = async (userId, password) => {
        try {
            const isPasswordPage = location.href.includes("identifier");
            const fields = await Promise.all([
                waitForElement(isPasswordPage ? "#txtLoginPassword" : "#txtUserId"),
                waitForElement(isPasswordPage ? CONFIG.CAPTCHA_SELECTOR : 'input[name="btnNext"]')
            ]);

            fields[0].value = isPasswordPage ? password : userId;

            if (isPasswordPage) {
                await solveCaptcha(fields[1], async (text) => {
                    const [input, button] = await Promise.all([
                        waitForElement("#txtcaptcha"),
                        waitForElement('input[name="btnLogin"]')
                    ]);
                    input.value = text;
                    button.click();
                });
            } else {
                fields[1].click();
            }
        } catch (error) {
            handleError(error, "Login Flow");
        }
    };

    // Initialization
    chrome.storage.local.get(["autoLoginEnabled", "userId", "userPassword"], (data) => {
        if (data.autoLoginEnabled && data.userId && data.userPassword) {
            requestIdleCallback(() => loginUser(data.userId, data.userPassword));
        }
    });
})();