window.onload = () => {
    const btn = document.querySelector('.btn');

    btn.addEventListener('click', () => {
        chrome.runtime.sendMessage({
            type: 'dns',
            url: 'https://adm.tools/domains/',
        });
    });
};
