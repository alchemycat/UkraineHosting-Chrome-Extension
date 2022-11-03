window.onload = () => {
    async function init() {
        //Константа
        const accountId = 475465;

        //Проверка статуса задачи и url
        let pageURL = window.location.href;

        //Получение статуса задачи и текущей задачи
        let { status } = await getStorageData('status');
        console.log(status);
        if (status.process) {
            if (status.task === 'email') {
                alert('email start');
                //логика для emails
                await searchTable('#boxes_list');
                await deleteEmails();
                alert('email complete');
                //запускаем поиск url для удаления DNS
                chrome.runtime.sendMessage({
                    type: 'findurl',
                    url: 'https://adm.tools/domains/',
                });
            } else if (status.task === 'findurl') {
                alert('find url start');
                if (pageURL === 'https://adm.tools/domains/') {
                    await searchTable('#content_domain');
                    let url = await findDomainID('cashon.website');
                    alert(`URL finded: ${url}`);
                    chrome.runtime.sendMessage({ type: 'removedns', url });
                }
                //логика для dns
                //Вызываем функцию поиска таблицы, далее передаем коллбэк и параметры
                // searchTable('#records_control_table').then(() => {
                //     deleteDNSRecords('abc.cashon.website');
                // });
            } else if (status.task === 'removedns') {
                alert('dns start');
                await searchTable('#domain_records_list');
                await deleteDNSRecords('abc.cashon.website');
                alert('dns complete');
                //логика для сайта
            }
        } else {
            console.log('Задача не активна');
        }
    }

    function searchTable(selector) {
        return new Promise((resolve) => {
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
                }
            }, 100);
        });
    }

    async function deleteEmails() {
        //список почт для удаления
        let emails = [
            'test1@abc.cashon.website',
            'test2@abc.cashon.website',
            'test3@abc.cashon.website',
            'test4@abc.cashon.website',
        ];

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
            let element = document.querySelector(selector);
            // console.log(selector);
            let id = setInterval(() => {
                if (element) {
                    clearInterval(id);
                    resolve(element);
                } else {
                    console.log('wait element');
                    element = document.querySelector(selector);
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
                    console.log('confirm closed');
                    resolve();
                } else {
                    console.log('wait when modal be closed');
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

    async function deleteDNSRecords(subdomain) {
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
                // await btn.click();
                console.log(btn);
                await sleep(200);
                // let deleteBtn = await findElement('.submit-btn');
                await sleep(300);
                console.log('click delete');
                // await deleteBtn.click();
                await sleep(500);
                // await isClosed('#confirm_modal');
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
