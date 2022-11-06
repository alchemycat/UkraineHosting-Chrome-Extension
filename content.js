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
                        const isExist = await findTable('#boxes_list');
                        if (!isExist) {
                            chrome.runtime.sendMessage({
                                type: 'removedns',
                                url: `https://adm.tools/Domains/${domainId}/Manage/Records/`,
                            });
                        }
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
                        const isExist = await findTable('#domain_records_list');
                        //передаем эмейлы в функцию для удаления DNS записей
                        if (!isExist) {
                            chrome.runtime.sendMessage({
                                type: 'removesite',
                                url: `https://adm.tools/hosting/account/${accountid}/virtual/`,
                            });
                        }
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
                console.log('Нет активных заданий');
            }
        }
    }

    async function sites() {
        const isExist = await findTable('#virtual_list');
        //передаем поддомен в функцию которая удалит сайты
        if (!isExist) {
            chrome.runtime.sendMessage({ type: 'stop' });
            alert(`Выполнение завершено`);
            return;
        }

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
                await next.click();
                await sleep(randomInteger(4000, 7000));
                await waitLoading();

                await sites();
            } else {
                chrome.runtime.sendMessage({ type: 'stop' });
                alert(`Выполнение завершено`);
            }
        } else {
            chrome.runtime.sendMessage({ type: 'stop' });
            alert(`Выполнение завершено`);
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
                    const btn = site.querySelector('.c-site-item__delete');
                    await btn.click();
                    await sleep(randomInteger(500, 800));
                    //Ждем пока появится кнопка подтверждения удаления
                    let deleteBtn = await findElement('#delete_hosts_submit');
                    await sleep(randomInteger(500, 800));
                    //Подтверждаем удаление
                    await deleteBtn.click();
                    await sleep(randomInteger(500, 800));
                    //Проверяем закрылось ли модальное окно подтверждения удаления
                    await isClosed('.dimmer');
                    await sleep(randomInteger(500, 800));

                    //полное удаление
                    let sitesList = document.querySelectorAll(
                        '[onclick*="return delete_domain_and_mailboxes"]'
                    );

                    for (let s of sitesList) {
                        let attrValue = s.getAttribute('onclick');
                        if (attrValue.includes(name)) {
                            //подтверждаем удаление
                            s.click();
                            await sleep(randomInteger(500, 800));
                            let deleteBtn = await findElement('.submit-btn');
                            await sleep(randomInteger(500, 800));
                            await deleteBtn.click();
                            await sleep(randomInteger(500, 800));
                            await isClosed('#confirm_modal');
                        }
                    }
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
                    await sleep(randomInteger(500, 800));
                    //Ждем пока появится кнопка подтверждения удаления
                    let deleteBtn = await findElement('.submit-btn');
                    await sleep(randomInteger(500, 800));
                    //Подтверждаем удаление
                    await deleteBtn.click();
                    await sleep(randomInteger(500, 800));
                    //Проверяем закрылось ли модальное окно подтверждения удаления
                    await isClosed('#confirm_modal');
                } else {
                    continue;
                }
                await sleep(randomInteger(500, 800));
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
                await sleep(randomInteger(500, 800));
                let deleteBtn = await findElement('.submit-btn');
                await sleep(randomInteger(500, 800));
                await deleteBtn.click();
                await sleep(randomInteger(500, 800));
                await isClosed('#confirm_modal');
            } else {
                continue;
            }
            await sleep(randomInteger(500, 800));
        }
    }

    init();

    function findTable(selector) {
        return new Promise((resolve, reject) => {
            let counter = 0;
            let table = document
                .querySelector(selector)
                .querySelector('.table');
            let id = setInterval(() => {
                if (table) {
                    clearInterval(id);

                    resolve(true);
                } else {
                    table = document
                        .querySelector(selector)
                        .querySelector('.table');
                    counter++;
                    if (counter > 50) {
                        clearInterval(id);
                        resolve(false);
                        // chrome.runtime.sendMessage({ type: 'stop' });
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
                    if (counter > 50) {
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
                    if (counter > 50) {
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

    function randomInteger(min, max) {
        // получить случайное число от (min-0.5) до (max+0.5)
        let rand = min - 0.5 + Math.random() * (max - min + 1);
        return Math.round(rand);
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
