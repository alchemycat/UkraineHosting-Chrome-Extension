window.onload = () => {
    async function init() {
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
        return new Promise((resolve) => {
            let element = document.querySelector(selector);
            // console.log(selector);
            let id = setInterval(() => {
                if (element) {
                    clearInterval(id);
                    resolve(element);
                } else {
                    console.log('cant find element');
                    element = document.querySelector(selector);
                }
            }, 100);
        });
    }

    function isClosed(selector) {
        // #confirm_modal
        return new Promise((resolve) => {
            let isVisible = document.querySelector(selector);

            let confirmId = setInterval(() => {
                if (isVisible.classList.contains('hidden')) {
                    clearInterval(confirmId);
                    console.log('confirm closed');
                    resolve();
                } else {
                    console.log('wait while modal be closed');
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

    init();
};
