chrome.runtime.onMessage.addListener(async function (request, sender) {
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
        let { tasks } = await getStorageData('tasks');
        chrome.storage.local.set({
            status: {
                task: 'stop',
                process: false,
            },
        });
        console.log(tasks);
        tasks = tasks.splice(1);
        console.log(tasks);
        chrome.storage.local.set({ tasks });
    }

    function loadPage(url) {
        //load page for
        chrome.tabs.query({ active: true }, (tabs) => {
            chrome.tabs.update(tabs[0].id, { url });
        });
    }

    function getStorageData(sKey) {
        return new Promise(function (resolve, reject) {
            chrome.storage.local.get(sKey, function (item) {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError.message);
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError.message);
                    }
                } else {
                    resolve(item);
                }
            });
        });
    }
});
