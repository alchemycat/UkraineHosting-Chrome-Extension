window.onload = () => {
    async function initDelete() {
        let accountId = document.getElementById('account_id');

        if (accountId) {
            accountId = accountId.value;
        }

        if (!accountId) {
            alert('account id not found');
            return;
        }

        window.location.href = `https://adm.tools/hosting/account/${id}/mail/boxes/`;

        //проверяем загрузился ли блок с почтами
        let table = document
            .querySelector('#boxes_list')
            .querySelector('.table');

        let id = setInterval(() => {
            if (table) {
                clearInterval(id);
                console.log(table);
                //если блок с почтами загрузился тогда запускаем функцию для удаления почт
                deleteEmails();
            } else {
                table = document
                    .querySelector('#boxes_list')
                    .querySelector('.table');
            }
        }, 500);

        /**
         * @param {String[]} emailsList - list of emails for delete
         *
         */

        async function deleteEmails(emailsList) {
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

                try {
                    email = btn
                        .getAttribute('onclick')
                        .match(/(?<=\,\s')\S+\@\S+(?=')/gm)[0];
                    //получаем email для текущей кнопки если он есть

                    if (!email) {
                        //если email не найден тогда пропускаем кнопку
                        console.log('continue');
                        continue;
                    }
                } catch (err) {
                    //если ошибка выводим её и переход к следующей итерации
                    console.log(err);
                    continue;
                }

                if (emails.includes(email)) {
                    console.log(`emails includes email: ${email}`);
                    await btn.click();
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
    }

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

    // init();

    function initDNS(subdomain) {
        // (?<=\.).* //regexp get domain from subdomain
        //https://adm.tools/domains/

        const domain = subdomain.match(/(?<=\.).*/gm)[0];

        console.log(domain);

        //проверяем загрузился ли блок с почтами
        let table = document
            .querySelector('#content_domain')
            .querySelector('.table');

        let id = setInterval(() => {
            if (table) {
                clearInterval(id);
                console.log(table);
                //если блок с почтами загрузился тогда запускаем функцию для удаления почт
                findDomain();
            } else {
                table = document
                    .querySelector('#content_domain')
                    .querySelector('.table');
            }
        }, 500);

        //(?<=\(\')\d+(?=') parse domain id

        function findDomain() {
            let links = document.querySelectorAll(
                '[onclick*="domain_delete_fake"]'
            );

            links.forEach((link) => {
                if (link.getAttribute('onclick').includes(domain)) {
                    //поиск ID домена
                    let urlID = link
                        .getAttribute('onclick')
                        .match(/(?<=\(\')\d+(?=')/gm)[0];

                    //находим id домена и загружаем страницу
                    window.location.href = `https://adm.tools/Domains/${urlID}/Manage/Records/`;
                    return;
                }
            });
        }

        //функция для удаления DNS записей
        async function removeDNS(subdomain) {
            let btns = document.querySelectorAll(
                '[onclick*="return domain_record_delete"]'
            );

            for (let btn of btns) {
                let btnData = btn
                    .getAttribute('onclick')
                    .match(/(?<=')\S+(?='\))/gm)[0]
                    .replaceAll(/<[^>]*>/gm, '');

                //проверяем содержит ли значение кнопки нужный поддомен, если содержит нужно нажать на кнопку и удалить эту DNS
                if (btnData.includes(subdomain)) {
                    console.log('btn includes subdomain');
                    await btn.click();
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

        // window.location.href = 'https://adm.tools/domains/';
    }

    initDNS('abc.cashon.website');
    // chrome.runtime.onMessage.addListener((request) => {
    //     console.log(request);
    // });

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

    // async function main() {
    //     const status = await getStorageData('status');
    //     console.log(status);
    // }
    // main();
};
