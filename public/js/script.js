window.onload = () => {
    //значения хранилища
    async function init() {
        const { accountid } = await getStorageData('accountid');
        let { tasks } = await getStorageData('tasks');

        if (!Array.isArray(tasks)) {
            chrome.storage.local.set({ tasks: [] });
        } else {
            addItems(tasks);
        }

        //

        const accountIdInput = document.querySelector('[name="accountid"]');

        if (accountid) {
            accountIdInput.value = accountid;
        }

        accountIdInput.addEventListener('input', () => {
            chrome.storage.local.set({ accountid: accountIdInput.value });
        });

        function addItems(tasks) {
            const list = document.querySelector('.main__list');

            list.innerHTML = '';

            for (let task of tasks) {
                const item = document.createElement('div');
                item.classList.add('main__item');
                item.textContent = task.subdomain;
                list.append(item);
            }
        }

        const clearBtn = document.querySelector('.button__clear');

        clearBtn.addEventListener('click', () => {
            const list = document.querySelector('.main__list');

            chrome.storage.local.remove('tasks');

            list.innerHTML = '';
        });

        const mainBtn = document.querySelector('.button__add');

        mainBtn.addEventListener('click', async () => {
            const subdomain = document.querySelector('[name="subdomain"]');
            const emailsInput = document.querySelector('[name="emails"]');

            const emails = emailsInput.value.split('\n');

            if (tasks) {
                tasks = [];
            }

            tasks.push({ subdomain: subdomain.value, emails });
            chrome.storage.local.set({
                tasks,
            });

            addItems(tasks);

            subdomain.value = '';
            emailsInput.value = '';
        });

        const btn = document.querySelector('.btn__start');

        btn.addEventListener('click', async () => {
            let { tasks } = await getStorageData('tasks');

            if (tasks.length > 0 && accountid) {
                chrome.runtime.sendMessage({
                    type: 'startBG',
                    url: `https://adm.tools/hosting/account/${accountid}/mail/boxes/`,
                });
            }
        });

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
    }

    init();
};
