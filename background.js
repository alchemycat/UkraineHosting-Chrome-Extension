chrome.runtime.onMessage.addListener(function (request, sender) {
    if (request.type === 'startBG') {
        chrome.storage.local.set({
            status: {
                task: 'email',
                process: true,
            },
        });

        //load page
        chrome.tabs.query({ active: true }, (tabs) => {
            chrome.tabs.update(tabs[0].id, { url: request.url });
        });
        // chrome.storage.local.clear();
    } else if (request.type === 'findurl') {
        chrome.storage.local.set({
            status: {
                task: 'findurl',
                process: true,
            },
        });

        //load page for
        chrome.tabs.query({ active: true }, (tabs) => {
            chrome.tabs.update(tabs[0].id, { url: request.url });
        });
    } else if (request.type === 'removedns') {
        chrome.storage.local.set({
            status: {
                task: 'removedns',
                process: true,
            },
        });

        //load page for
        chrome.tabs.query({ active: true }, (tabs) => {
            chrome.tabs.update(tabs[0].id, { url: request.url });
        });
    }
});
