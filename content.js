window.onload = () => {
    async function init() {
        let table = document
            .querySelector('#boxes_list')
            .querySelector('.table');

        let id = setInterval(() => {
            if (table) {
                clearInterval(id);
                console.log(table);
                deleteEmails();
            } else {
                table = document
                    .querySelector('#boxes_list')
                    .querySelector('.table');
            }
        }, 500);

        function deleteEmails() {
            let emails = ['test@abc.cashon.website'];

            let parent = document.querySelector(
                '[data-clipboard="test@abc.cashon.website"]'
            ).parentElement.parentElement.parentElement;

            let btns = parent.querySelectorAll('.button');

            btns.forEach(async (btn) => {
                if (btn.getAttribute('onclick').includes(emails[0])) {
                    btn.click();

                    let submit = document.querySelector('.submit-btn');

                    let innerId = setInterval(() => {
                        if (submit) {
                            clearInterval(innerId);
                            console.log(submit);
                            submit.click();
                        } else {
                            submit = document.querySelector('.submit-btn');
                        }
                    }, 500);
                }
            });
        }
    }
    // let url = document.location.href;

    // console.log(url);

    // if (url.includes('domain')) {
    //     let parentBlock;

    //     alert("hello it's domain page");
    // }

    function sleep(ms) {
        return new Promise((resolve, reject) => {
            setTimeout(resolve, ms);
        });
    }

    init();
    // const btn = document.querySelector('.ActivitySettings__link');

    // console.log(btn);
    // btn.click();

    // chrome.runtime.sendMessage({
    //     type: 'start',
    // });
};
