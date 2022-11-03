chrome.runtime.onMessage.addListener(function (request, sender) {
    if (request.type === 'startBG') {
        chrome.storage.local.set({
            status: {
                task: 'removeemail',
                process: true,
            },
        });

        loadPage(request.url);
    } else if (request.type === 'findurl') {
        chrome.storage.local.set({
            status: {
                task: 'findurl',
                process: true,
            },
        });

        loadPage(request.url);
    } else if (request.type === 'removedns') {
        chrome.storage.local.set({
            status: {
                task: 'removedns',
                process: true,
            },
        });

        loadPage(request.url);
    } else if (request.type === 'removesite') {
        chrome.storage.local.set({
            status: {
                task: 'removesite',
                process: true,
            },
        });

        loadPage(request.url);
    } else if (request.type === 'stop') {
        console.log('all task complete');
    }

    function loadPage(url) {
        //load page for
        chrome.tabs.query({ active: true }, (tabs) => {
            chrome.tabs.update(tabs[0].id, { url });
        });
    }
});
