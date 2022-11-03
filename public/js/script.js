window.onload = () => {
    //значения хранилища
    async function init() {
        //Константы
        const { accountid } = await getStorageData('accountid');
        let { tasks } = await getStorageData('tasks');
        const { status } = await getStorageData('status');

        const btn = document.querySelector('.btn__start');

        if (!Array.isArray(tasks)) {
            chrome.storage.local.set({ tasks: [] });
            btn.setAttribute('disabled', true);
        } else {
            //Добавляем задания в список
            if (status) {
                if (!status.process) {
                    btn.removeAttribute('disabled', true);
                }
            }
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

            tasks.forEach((task, i) => {
                const item = document.createElement('div');
                item.classList.add('main__item');
                item.textContent = `${i + 1}. ${task.subdomain}`;
                list.append(item);
            });
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

            const errors = [];

            const emails = emailsInput.value.split('\n');

            if (!tasks) {
                tasks = [];
            }

            let subdomainError =
                subdomain.parentElement.querySelector('.error');

            if (!subdomainError.classList.contains('hidden')) {
                subdomainError.classList.add('hidden');
            }

            if (!subdomain.value) {
                subdomainError.classList.remove('hidden');
                errors.push('subdomain');
            }

            let emailError = emailsInput.parentElement.querySelector('.error');

            if (!emailError.classList.contains('hidden')) {
                emailError.classList.add('hidden');
            }

            if (!emailsInput.value) {
                emailError.classList.remove('hidden');
                errors.push('emails');
            }

            if (errors.length > 0) {
                return;
            } else {
                tasks.push({ subdomain: subdomain.value, emails });

                chrome.storage.local.set({
                    tasks,
                });
                addItems(tasks);
                subdomain.value = '';
                emailsInput.value = '';
            }
        });

        btn.addEventListener('click', async () => {
            let { tasks } = await getStorageData('tasks');

            if (tasks.length > 0 && accountid) {
                btn.setAttribute('disabled', true);
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
