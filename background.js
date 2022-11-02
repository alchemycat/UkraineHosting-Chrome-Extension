chrome.runtime.onMessage.addListener(function (request, sender) {
    if (request.type === 'dns') {
        chrome.storage.local.set({
            status: {
                dns: true,
            },
        });
        chrome.tabs.query({ active: true }, (tabs) => {
            chrome.tabs.update(tabs[0].id, { url: request.url });
        });

        // chrome.storage.local.remove('dns');
    }
});
