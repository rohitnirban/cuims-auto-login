document.addEventListener('DOMContentLoaded', function () {
    const userIdInput = document.getElementById('userId');
    const userPasswordInput = document.getElementById('userPassword');
    const loginBtn = document.getElementById('loginBtn');
    const directLoginBtnCuims = document.getElementById('directLoginBtnCuims');
    const directLoginBtnLms = document.getElementById('directLoginBtnLms');
    const autoLoginToggle = document.getElementById('autoLoginToggle');
    const savedUserId = document.getElementById('savedUserId');
    const savedUserPassword = document.getElementById('savedUserPassword');

    chrome.storage.local.get(['autoLoginEnabled'], function (result) {
        autoLoginToggle.checked = result.autoLoginEnabled ?? false;
    });

    autoLoginToggle.addEventListener('change', function () {
        chrome.storage.local.set({ autoLoginEnabled: autoLoginToggle.checked });
    });

    chrome.storage.local.get(['userId', 'userPassword'], function (result) {
        if (result.userId && result.userPassword) {
            directLoginBtnCuims.style.display = 'block';
            directLoginBtnLms.style.display = 'block';
        }

        if (result.userId) {
            savedUserId.textContent = result.userId;
        } else {
            savedUserId.textContent = 'Not saved';
        }

        if (result.userPassword) {
            savedUserPassword.textContent = result.userPassword;
        } else {
            savedUserPassword.textContent = 'Not saved';
        }
    });

    loginBtn.addEventListener('click', function () {
        const userId = userIdInput.value;
        const userPassword = userPasswordInput.value;

        if (userId && userPassword) {
            chrome.storage.local.set({ userId, userPassword }, function () {
                console.log('Credentials saved.');
            });
        } else {
            alert('Please provide both User ID and Password.');
        }
    });

    directLoginBtnCuims.addEventListener('click', function () {
        if (autoLoginToggle.checked) {
            chrome.storage.local.get(['userId', 'userPassword'], function (result) {
                if (result.userId && result.userPassword) {
                    chrome.runtime.sendMessage({
                        action: 'openAndLogin',
                        userId: result.userId,
                        userPassword: result.userPassword
                    });
                } else {
                    alert('Stored credentials not found.');
                }
            });
        } else {
            alert('Enable Direct Login to use this feature.');
        }
    });

    directLoginBtnLms.addEventListener('click', function () {
        if (autoLoginToggle.checked) {
            chrome.storage.local.get(['userId', 'userPassword'], function (result) {
                if (result.userId && result.userPassword) {
                    chrome.runtime.sendMessage({
                        action: 'openAndLoginLms',
                        userId: result.userId,
                        userPassword: result.userPassword
                    });
                } else {
                    alert('Stored credentials not found.');
                }
            });
        } else {
            alert('Enable Direct Login to use this feature.');
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['userId', 'userPassword'], (data) => {
        if (data.userId && data.userPassword) {
            document.getElementById('savedUserId').textContent = data.userId;
            document.getElementById('savedUserPassword').textContent = '********';
            document.getElementById('changeCredentialsBtn').classList.remove('hidden');
        } else {
            document.getElementById('loginForm').classList.remove('hidden');
        }
    });

    document.getElementById('changeCredentialsBtn').addEventListener('click', () => {
        document.getElementById('loginForm').classList.remove('hidden');
        document.getElementById('changeCredentialsBtn').classList.add('hidden');
    });

    document.getElementById('loginForm').addEventListener('submit', (event) => {
        event.preventDefault();
        const userId = document.getElementById('userId').value;
        const userPassword = document.getElementById('userPassword').value;

        chrome.storage.local.set({ userId, userPassword }, () => {
            document.getElementById('savedUserId').textContent = userId;
            document.getElementById('savedUserPassword').textContent = '********';
            document.getElementById('loginForm').classList.add('hidden');
            document.getElementById('changeCredentialsBtn').classList.remove('hidden');
        });
    });
});
