chrome.runtime.onMessage.addListener(async function (request, sender) {
    if (request.type === 'startBG') {
        chrome.storage.local.set({
            status: {
                task: 'removeemail',
                process: true,
            },
        });

        chrome.tabs.create({
            url: request.url,
        });
    } else if (request.type === 'removedns') {
        chrome.storage.local.set({
            status: {
                task: 'removedns',
                process: true,
            },
        });

        chrome.tabs.update(sender.tab.id, { url: request.url });

        // chrome.tabs.create({
        //     url: request.url,
        // });
    } else if (request.type === 'removesite') {
        chrome.storage.local.set({
            status: {
                task: 'removesite',
                process: true,
            },
        });

        chrome.tabs.update(sender.tab.id, { url: request.url });

        // chrome.tabs.create({
        //     url: request.url,
        // });
    } else if (request.type === 'stop') {
        let { tasks } = await getStorageData('tasks');

        chrome.storage.local.set({
            status: {
                task: 'stop',
                process: false,
            },
        });

        if (tasks.length > 0) {
            tasks = tasks.splice(1);
            chrome.storage.local.set({ tasks });
        }
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
