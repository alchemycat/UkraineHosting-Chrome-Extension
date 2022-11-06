chrome.runtime.onMessage.addListener(async function (request, sender) {
    if (request.type === 'startBG') {
        chrome.storage.local.set({
            status: {
                task: 'removeemail',
                process: true,
            },
        });

        chrome.tabs.create(
            {
                url: request.url,
            },
            (tab) => {
                const tabId = tab.id;
                chrome.storage.local.set({ tabId });
            }
        );
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
    } else if (request.type === 'complete') {
        console.log('Complete');
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
    } else if (request.type === 'stop') {
        const { tabId } = await getStorageData('tabId');
        chrome.storage.local.set({
            status: {
                task: 'stop',
                process: false,
            },
        });
        chrome.tabs.update(tabId, { url: 'https://adm.tools/hosting/' });
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
