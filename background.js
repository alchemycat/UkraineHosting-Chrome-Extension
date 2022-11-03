chrome.runtime.onMessage.addListener(function (request, sender) {
    if (request.type === 'startBG') {
        chrome.storage.local.set({
            status: {
                task: 'email',
                process: true,
            },
        });
        chrome.tabs.query({ active: true }, (tabs) => {
            chrome.tabs.update(tabs[0].id, { url: request.url });
        });

        // chrome.storage.local.remove('dns');
    } else if (request.type === 'loadpage') {
        chrome.tabs.query({ active: true }, (tabs) => {
            chrome.tabs.update(tabs[0].id, { url: request.url });
        });
    }
});
