window.onload = () => {
    const btn = document.querySelector('.btn');
    //https://adm.tools/domains/
    btn.addEventListener('click', () => {
        chrome.runtime.sendMessage({
            type: 'startBG',
            url: 'https://adm.tools/hosting/account/475465/mail/boxes/',
        });
    });
};
