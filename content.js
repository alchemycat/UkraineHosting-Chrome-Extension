window.onload = () => {
    async function init() {
        //Константы
        const { accountid } = await getStorageData('accountid');
        const { tasks } = await getStorageData('tasks');

        //Получение статуса задачи и текущей задачи
        let { status } = await getStorageData('status');

        if (status) {
            if (status.process) {
                if (!accountid) {
                    alert(
                        'Введите accountId, без него расширение не может работать'
                    );
                    chrome.runtime.sendMessage({ type: 'stop' });
                    return;
                }

                if (status.task === 'removeemail') {
                    const domainId = tasks[0].domainId;
                    try {
                        //логика для emails
                        await findTable('#boxes_list');
                        //передаем список эмейлов из первого массива (после выполнения задания, первый элемент массива будет удален)
                        await removeEmails(tasks[0].emails);
                        //запускаем поиск url для удаления DNS
                        chrome.runtime.sendMessage({
                            type: 'removedns',
                            url: `https://adm.tools/Domains/${domainId}/Manage/Records/`,
                        });
                    } catch (err) {
                        alert(`Ошибка удаления эмейлов: ${err.message}`);
                        //переходим к следующей задаче
                        chrome.runtime.sendMessage({
                            type: 'removedns',
                            url: `https://adm.tools/Domains/${domainId}/Manage/Records/`,
                        });
                    }
                } else if (status.task === 'removedns') {
                    try {
                        await findTable('#domain_records_list');
                        //передаем эмейлы в функцию для удаления DNS записей

                        await removeDNSRecords(tasks[0].emails);
                        chrome.runtime.sendMessage({
                            type: 'removesite',
                            url: `https://adm.tools/hosting/account/${accountid}/virtual/`,
                        });
                    } catch (err) {
                        alert(`Ошибка удаления DNS: ${err.message}`);

                        //Переходим к следующей задаче
                        chrome.runtime.sendMessage({
                            type: 'removesite',
                            url: `https://adm.tools/hosting/account/${accountid}/virtual/`,
                        });
                    }
                } else if (status.task === 'removesite') {
                    //логика для сайта
                    try {
                        await sites();
                    } catch (err) {
                        alert(`Ошибка удаления сайтов: ${err}`);
                        chrome.runtime.sendMessage({ type: 'stop' });
                        alert(`Расширение остановлено`);
                    }
                }
            } else {
                console.log('Задача не активна');
            }
        }
    }

    async function sites() {
        await findTable('#virtual_list');
        //передаем поддомен в функцию которая удалит сайты
        await removeSites();

        const pagination = document.querySelector('.pagination');

        if (pagination) {
            let active = pagination.querySelector('.active');
            const next = active.nextElementSibling;

            if (
                next &&
                next.classList.contains('item') &&
                next.tagName === 'A'
            ) {
                console.log('Открываю следующую страницу');
                await next.click();
                await sleep(5000);
                console.log('Перезапускаю функцию для удаления сайтов');
                await waitLoading();

                await sites();
            } else {
                chrome.runtime.sendMessage({ type: 'stop' });
                alert(`Расширение завершило работу`);
            }
        } else {
            chrome.runtime.sendMessage({ type: 'stop' });
            alert(`Расширение завершило работу`);
        }
    }

    async function removeSites() {
        let taskData = await getStorageData('tasks');
        let emails = taskData.tasks[0].emails;
        let subdomains = [];
        subdomains = emails.map((email) => email.match(/(?<=@).*/gm)[0]);

        const sites = document.querySelectorAll('.c-site-item');
        if (sites.length > 0) {
            for (let site of sites) {
                let name = site.querySelector('.c-site-item__site-name');
                name = name.textContent.trim();
                name = name.replace(/^www\./, '');
                if (subdomains.includes(name)) {
                    //Жмём удалить site
                    console.log(`удаляю сайт ${name}`);
                    const btn = site.querySelector('.c-site-item__delete');
                    await btn.click();
                    await sleep(200);
                    //Ждем пока появится кнопка подтверждения удаления
                    let deleteBtn = await findElement('#delete_hosts_submit');
                    await sleep(300);
                    //Подтверждаем удаление
                    await deleteBtn.click();
                    await sleep(500);
                    //Проверяем закрылось ли модальное окно подтверждения удаления
                    await isClosed('.dimmer');
                    await sleep(300);
                }
            }
        } else {
            console.log('Сайты не найдены');
        }
    }

    async function removeEmails(emails) {
        //Находим все кнопки для удаления почт
        let btns = document.querySelectorAll(
            '[onclick*="MailboxHandler.mailboxDelete"]'
        );

        //проверяем нашлись ли кнопки
        if (btns.length) {
            //начинаем цикл с перебором каждой кнопки
            for (let btn of btns) {
                let email;

                email = btn
                    .getAttribute('onclick')
                    .match(/(?<=\,\s')\S+\@\S+(?=')/gm)[0];
                //получаем email для текущей кнопки если он есть

                if (!email) {
                    //если email не найден тогда пропускаем кнопку
                    continue;
                }

                if (emails.includes(email)) {
                    //Жмём удалить email
                    await btn.click();
                    await sleep(300);
                    //Ждем пока появится кнопка подтверждения удаления
                    let deleteBtn = await findElement('.submit-btn');
                    await sleep(300);
                    //Подтверждаем удаление
                    await deleteBtn.click();
                    await sleep(500);
                    //Проверяем закрылось ли модальное окно подтверждения удаления
                    await isClosed('#confirm_modal');
                } else {
                    continue;
                }
                await sleep(300);
            }
        }
    }

    async function removeDNSRecords(emails) {
        let subdomains = [];

        subdomains = emails.map((email) => email.match(/(?<=@).*/gm)[0]);

        let btns = document.querySelectorAll(
            '[onclick*="return domain_record_delete"]'
        );

        for (let btn of btns) {
            let btnData = btn
                .getAttribute('onclick')
                .match(/(?<=')\S+(?='\))/gm)[0]
                .replaceAll(/<[^>]*>/gm, '');

            try {
                if (/dmarc/.test(btnData)) {
                    btnData = btnData.match(/(?<=dmarc\.)\S+/)[0];
                } else if (/domainkey/.test(btnData)) {
                    btnData = btnData.match(/(?<=domainkey\.)\S+/)[0];
                }
            } catch (err) {
                console.log(err);
            }

            //проверяем содержит ли значение кнопки нужный поддомен, если содержит нужно нажать на кнопку и удалить эту DNS
            if (subdomains.includes(btnData)) {
                await btn.click();
                await sleep(200);
                let deleteBtn = await findElement('.submit-btn');
                await sleep(300);
                await deleteBtn.click();
                await sleep(500);
                await isClosed('#confirm_modal');
            } else {
                continue;
            }
            await sleep(300);
        }
    }

    init();

    function findTable(selector) {
        return new Promise((resolve) => {
            let counter = 0;
            let table = document
                .querySelector(selector)
                .querySelector('.table');
            let id = setInterval(() => {
                if (table) {
                    clearInterval(id);

                    resolve();
                } else {
                    console.log('поиск таблицы');
                    table = document
                        .querySelector(selector)
                        .querySelector('.table');
                    counter++;
                    if (counter > 100) {
                        clearInterval(id);
                        console.log('Не удалось найти элемент на странице');
                        chrome.runtime.sendMessage({ type: 'stop' });
                    }
                }
            }, 100);
        });
    }

    function findElement(selector) {
        //поиск элемента на странице
        return new Promise((resolve) => {
            let counter = 0;
            let element = document.querySelector(selector);
            let id = setInterval(() => {
                if (element) {
                    clearInterval(id);
                    resolve(element);
                } else {
                    element = document.querySelector(selector);
                    counter++;
                    if (counter > 100) {
                        clearInterval(id);
                        chrome.runtime.sendMessage({ type: 'stop' });
                    }
                }
            }, 100);
        });
    }

    //фукнция которая ждет когда прелоадер прогрузится.
    function waitLoading() {
        return new Promise((resolve) => {
            let counter = 0;
            let element = document.querySelector('#ajaxPreloader');

            let id = setInterval(() => {
                if (!element.classList.contains('c-loader')) {
                    clearInterval(id);
                    resolve();
                } else {
                    element = document.querySelector('#ajaxPreloader');

                    counter++;
                    if (counter > 100) {
                        clearInterval(id);
                        chrome.runtime.sendMessage({ type: 'stop' });
                    }
                }
            }, 100);
        });
    }

    function isClosed(selector) {
        //проверяем закрылось ли модальное окно подтверждения удаления записи
        return new Promise((resolve) => {
            let counter = 0;
            let isVisible = document.querySelector(selector);

            let id = setInterval(() => {
                if (isVisible.classList.contains('hidden')) {
                    clearInterval(id);
                    resolve();
                } else {
                    isVisible = document.querySelector(selector);
                    counter++;
                    if (counter > 100) {
                        clearInterval(id);
                        chrome.runtime.sendMessage({ type: 'stop' });
                    }
                }
            });
        }, 100);
    }

    function sleep(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    //Функция достает данные из chrome storage
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
};
