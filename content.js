window.onload = () => {
    async function init() {
        //Константы
        const { accountid } = await getStorageData('accountid');
        const { tasks } = await getStorageData('tasks');
        //Проверка статуса задачи и url
        let pageURL = window.location.href;

        //Получение статуса задачи и текущей задачи
        let { status } = await getStorageData('status');

        if (status.process) {
            if (!accountid) {
                alert(
                    'Введите accountId, без него расширение не может работать'
                );
                chrome.runtime.sendMessage({ type: 'stop' });
                return;
            } else {
                // alert(`account id: ${accountid}`);
            }
            if (status.task === 'removeemail') {
                // alert('email start');
                //логика для emails
                await searchTable('#boxes_list');
                //передаем список эмейлов из первого массива (после выполнения задания, первый элемент массива будет удален)
                await removeEmails(tasks[0].emails);
                // alert('email complete');
                //запускаем поиск url для удаления DNS
                chrome.runtime.sendMessage({
                    type: 'findurl',
                    url: 'https://adm.tools/domains/',
                });
            } else if (status.task === 'findurl') {
                // alert('find url start');
                if (pageURL === 'https://adm.tools/domains/') {
                    try {
                        await searchTable('#content_domain');
                        //парсим домен из поддомена и передаем в функцию которая найдет ID домена и создаст URL
                        const domain = tasks[0].subdomain.match(/(?<=\.).*/)[0];
                        let url = await findDomainID(domain);
                        // alert(`URL finded: ${url}`);
                        chrome.runtime.sendMessage({ type: 'removedns', url });
                    } catch (err) {
                        console.log(err);
                        chrome.runtime.sendMessage({ type: 'stop' });
                    }
                }
            } else if (status.task === 'removedns') {
                // alert('dns start');
                await searchTable('#domain_records_list');
                //передаем поддомен в функцию для удаления DNS записей
                await removeDNSRecords(tasks[0].subdomain);
                // alert('dns complete');
                chrome.runtime.sendMessage({
                    type: 'removesite',
                    url: `https://adm.tools/hosting/account/${accountid}/virtual/`,
                });
                //логика для сайта
            } else if (status.task === 'removesite') {
                // alert('site start');
                await searchTable('#virtual_list');
                //передаем поддомен в функцию которая удалит сайты
                await removeSites(tasks[0].subdomain);
                // alert('site removed');
                console.log('Завершаю работу');
                chrome.runtime.sendMessage({ type: 'stop' });
            }
        } else {
            console.log('Задача не активна');
        }
    }

    async function removeSites(domain) {
        const sites = document.querySelectorAll('.c-site-item');
        // const storage = await getStorageData('status');
        // console.log(storage);
        if (sites.length > 0) {
            for (let site of sites) {
                let name = site.querySelector('.c-site-item__site-name');
                name = name.textContent.trim();
                if (name.includes(domain)) {
                    console.log('ищу нужный домен');
                    //Жмём удалить site

                    const btn = site.querySelector('.c-site-item__delete');
                    await btn.click();
                    await sleep(200);
                    //Ждем пока появится кнопка подтверждения удаления
                    let deleteBtn = await findElement('#delete_hosts_submit');
                    // delete_hosts_submit
                    await sleep(300);
                    console.log('click delete');
                    //Подтверждаем удаление
                    await deleteBtn.click();
                    await sleep(500);
                    //Проверяем закрылось ли модальное окно подтверждения удаления
                    // await isClosed('#confirm_modal');
                    // console.log(`site founded: ${btn}`);
                }
                console.log(storage);
            }
        } else {
            console.log('Сайты не найдены');
        }
    }

    function searchTable(selector) {
        return new Promise((resolve) => {
            let counter = 0;
            let table = document
                .querySelector(selector)
                .querySelector('.table');
            console.log(table);
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

    async function removeEmails(emails) {
        //список почт для удаления

        //Находим все кнопки для удаления почт
        let btns = document.querySelectorAll(
            '[onclick*="MailboxHandler.mailboxDelete"]'
        );

        //начинаем цикл с перебором каждой кнопки
        for (let btn of btns) {
            let email;

            email = btn
                .getAttribute('onclick')
                .match(/(?<=\,\s')\S+\@\S+(?=')/gm)[0];
            //получаем email для текущей кнопки если он есть

            if (!email) {
                //если email не найден тогда пропускаем кнопку
                console.log('continue');
                continue;
            }

            if (emails.includes(email)) {
                //Начинаем удаление
                console.log(`emails includes email: ${email}`);
                //Жмём удалить email
                await btn.click();
                await sleep(200);
                //Ждем пока появится кнопка подтверждения удаления
                let deleteBtn = await findElement('.submit-btn');
                await sleep(300);
                console.log('click delete');
                //Подтверждаем удаление
                await deleteBtn.click();
                await sleep(500);
                //Проверяем закрылось ли модальное окно подтверждения удаления
                await isClosed('#confirm_modal');
            } else {
                console.log('continue');
                continue;
            }
            console.log('sleep 300 ms');
            await sleep(300);
            console.log('awake');
        }
    }

    init();

    function findElement(selector) {
        //поиск элемента на странице
        return new Promise((resolve) => {
            let counter = 0;
            let element = document.querySelector(selector);
            // console.log(selector);
            let id = setInterval(() => {
                if (element) {
                    clearInterval(id);
                    resolve(element);
                } else {
                    console.log('Ожидаю появление элемента');
                    element = document.querySelector(selector);
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

    function isClosed(selector) {
        // #confirm_modal
        //проверяем закрылось ли модальное окно подтверждения удаления записи
        return new Promise((resolve) => {
            let isVisible = document.querySelector(selector);

            let confirmId = setInterval(() => {
                if (isVisible.classList.contains('hidden')) {
                    clearInterval(confirmId);
                    console.log('Модальное окно закрыто, можно продолжать');
                    resolve();
                } else {
                    console.log('Ожидаю закрытие модального окна');
                    isVisible = document.querySelector(selector);
                }
            });
        }, 100);
    }

    function sleep(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    //функция поиска ID домена
    async function findDomainID(domain) {
        return new Promise((resolve) => {
            let url;

            let links = document.querySelectorAll(
                '[onclick*="domain_delete_fake"]'
            );

            for (let link of links) {
                if (link.getAttribute('onclick').includes(domain)) {
                    //поиск ID домена
                    let urlID = link
                        .getAttribute('onclick')
                        .match(/(?<=\(\')\d+(?=')/gm)[0];

                    //находим id домена и загружаем страницу
                    url = `https://adm.tools/Domains/${urlID}/Manage/Records/`;
                    break;
                }
            }

            resolve(url);
        });
    }

    //Функція дістає дані з chrome.storage
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

    async function removeDNSRecords(subdomain) {
        let btns = document.querySelectorAll(
            '[onclick*="return domain_record_delete"]'
        );

        console.log(btns);

        for (let btn of btns) {
            let btnData = btn
                .getAttribute('onclick')
                .match(/(?<=')\S+(?='\))/gm)[0]
                .replaceAll(/<[^>]*>/gm, '');

            //проверяем содержит ли значение кнопки нужный поддомен, если содержит нужно нажать на кнопку и удалить эту DNS
            if (btnData.includes(subdomain)) {
                console.log('btn includes subdomain');
                await btn.click();
                console.log(btn);
                await sleep(200);
                let deleteBtn = await findElement('.submit-btn');
                await sleep(300);
                console.log('click delete');
                await deleteBtn.click();
                await sleep(500);
                await isClosed('#confirm_modal');
            } else {
                console.log('continue');
                continue;
            }

            console.log('sleep 300 ms');
            await sleep(300);
            console.log('awake');
        }
    }
};
