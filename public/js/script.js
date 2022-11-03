window.onload = () => {
    //значения хранилища
    async function init() {
        const { tasks } = await getStorageData('tasks');

        if (!Array.isArray(tasks)) {
            chrome.storage.local.set({ tasks: [] });
        } else {
            addItems(tasks);
        }

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

            chrome.storage.local.clear();

            list.innerHTML = '';
        });

        const mainBtn = document.querySelector('.button__add');

        mainBtn.addEventListener('click', async () => {
            const subdomain = document.querySelector('[name="subdomain"]');
            const emailsInput = document.querySelector('[name="emails"]');

            const emails = emailsInput.value.split('\n');

            tasks.push({ subdomain: subdomain.value, emails });

            chrome.storage.local.set({
                tasks,
            });

            addItems(tasks);

            subdomain.value = '';
            emailsInput.value = '';
        });

        const btn = document.querySelector('.btn');

        btn.addEventListener('click', () => {
            chrome.runtime.sendMessage({
                type: 'startBG',
                url: 'https://adm.tools/hosting/account/475465/mail/boxes/',
            });
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
