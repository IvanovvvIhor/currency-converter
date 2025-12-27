import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap ПЕРШИЙ
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Твої стилі (по порядку)
import '/src/variables.css'
import '/src/base.css';
import '/src/layout.css';
import '/src/components.css';
import '/src/themes.css';
import '/src/responsive.css';

import axios from 'axios';

// --- ЕЛЕМЕНТИ DOM ---
const themeBtn = document.getElementById('theme-toggle');
const body = document.body;
const inputFrom = document.getElementById('input-from');
const inputTo = document.getElementById('input-to');
const selectFrom = document.getElementById('select-from');
const selectTo = document.getElementById('select-to');
const swapBtn = document.getElementById('swap-btn');
const convertBtn = document.getElementById('convert-btn');
const historyList = document.querySelector('.history-list');
const clearHistoryBtn = document.querySelector('.history-clear-btn');
const emptyMsg = document.querySelector('.history-empty');
const alertBox = document.getElementById('api-alert');

// Елементи для Завдання 7 (Спінер і Таблиця)
const spinner = document.getElementById('loading-spinner');
const currencyTable = document.getElementById('currency-table');
const tableBody = document.getElementById('currency-table-body');

// Змінна для курсів (за замовчуванням тільки гривня)
let RATES = { UAH: 1 };

// --- 1. GET ЗАПИТ (Отримання курсів) ---
async function fetchRates() {
    try {
        // А) Стан "Завантаження"
        spinner.style.display = 'block';       // Показати спінер
        currencyTable.style.display = 'none';  // Сховати таблицю
        alertBox.style.display = 'none';       // Сховати помилки

        // Штучна затримка 0.5 сек, щоб ти побачив спінер (бо інтернет занадто швидкий)
        await new Promise(resolve => setTimeout(resolve, 500));

        // Б) Виконуємо запит
        const response = await axios.get('https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json');
        const data = response.data;

        // В) Обробка даних
        data.forEach(item => {
            RATES[item.cc] = item.rate;
        });

        // Оновлюємо дату
        if(data[0]) {
            document.querySelector('.card__date').textContent = `Курс НБУ на ${data[0].exchangedate}`;
        }

        // Оновлюємо список "Курс у банках"
        const topCurrencies = ['USD', 'EUR', 'GBP'];
        const bankList = document.getElementById('nbu-rates-list');
        bankList.innerHTML = '';

        topCurrencies.forEach(code => {
            const rate = RATES[code];
            if (rate) {
                const li = document.createElement('li');
                li.className = 'bank-list__item';
                li.innerHTML = `
                    <div class="bank-list__info"><span class="bank-list__name">${code}</span></div>
                    <div class="bank-list__rates"><span class="bank-list__rate">${rate.toFixed(2)}</span></div>
                `;
                bankList.appendChild(li);
            }
        });

        // Г) Заповнюємо Таблицю
        tableBody.innerHTML = '';
        const tableCurrencies = ['USD', 'EUR', 'GBP', 'PLN', 'CAD', 'CHF', 'JPY', 'CNY'];
        
        tableCurrencies.forEach(code => {
             const item = data.find(i => i.cc === code);
             if (item) {
                 const tr = document.createElement('tr');
                 tr.className = 'currency-table__row';
                 tr.innerHTML = `
                    <td class="currency-table__td">${item.txt}</td>
                    <td class="currency-table__td"><span class="badge">${item.cc}</span></td>
                    <td class="currency-table__td currency-table__td--right">${item.rate.toFixed(2)}</td>
                 `;
                 tableBody.appendChild(tr);
             }
        });

        // Д) Перераховуємо конвертер (якщо там вже були числа)
        calculate();

    } catch (error) {
        // Е) Стан "Помилка"
        console.error("Помилка API:", error);
        alertBox.style.display = 'block';
        alertBox.textContent = 'Не вдалося завантажити курси НБУ. Перевірте інтернет.';
        document.querySelector('.card__date').textContent = 'Помилка оновлення';
    } finally {
        // Ж) Фінал: Ховаємо спінер, показуємо таблицю
        spinner.style.display = 'none';
        
        // Показуємо таблицю тільки якщо вона не порожня
        if (tableBody.children.length > 0) {
            currencyTable.style.display = 'table';
        }
    }
}

// --- 2. POST ЗАПИТ (Реєстрація) ---
const registerForm = document.getElementById('register-form');
const authModal = document.getElementById('auth-modal');

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Отримуємо кнопку, щоб змінити її текст
        const btn = registerForm.querySelector('.auth-btn');
        const originalText = btn.textContent;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Імітація валідації (ти можеш додати свої функції сюди)
        if (password.length < 6) {
            alert('Пароль занадто короткий!');
            return;
        }

        try {
            // Стан "Завантаження"
            btn.disabled = true;
            btn.textContent = 'Обробка...';

            // Реальний POST запит на тестовий сервер
            const response = await axios.post('https://jsonplaceholder.typicode.com/posts', {
                email: email,
                password: password,
                userId: 1
            });

            console.log('Відповідь сервера:', response.data);
            alert(`Успішно! Ваш ID: ${response.data.id} (Тестовий сервер)`);
            
            // Закриваємо модалку
            authModal.classList.remove('show');
            registerForm.reset();

        } catch (error) {
            console.error(error);
            alert('Помилка з\'єднання з сервером');
        } finally {
            // Повертаємо кнопку
            btn.disabled = false;
            btn.textContent = originalText;
        }
    });
}

// --- ТЕМА (DARK/LIGHT) ---
const sunIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path></svg>`;
const moonIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;

function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        body.classList.add('light-theme');
        themeBtn.innerHTML = moonIcon;
    } else {
        themeBtn.innerHTML = sunIcon;
    }
}

themeBtn.addEventListener('click', () => {
    body.classList.toggle('light-theme');
    const isLight = body.classList.contains('light-theme');
    themeBtn.innerHTML = isLight ? moonIcon : sunIcon;
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
});

// --- КОНВЕРТЕР ---
function calculate() {
    const amount = parseFloat(inputFrom.value);
    const currFrom = selectFrom.value;
    const currTo = selectTo.value;

    if (isNaN(amount)) {
        inputTo.value = '';
        return;
    }

    const rateFrom = RATES[currFrom] || 1;
    const rateTo = RATES[currTo] || 1;

    const res = (amount * rateFrom) / rateTo;
    inputTo.value = res.toFixed(2);
}

inputFrom.addEventListener('input', calculate);
selectFrom.addEventListener('change', calculate);
selectTo.addEventListener('change', calculate);

swapBtn.addEventListener('click', () => {
    const tempCurr = selectFrom.value;
    selectFrom.value = selectTo.value;
    selectTo.value = tempCurr;
    calculate();
});

convertBtn.addEventListener('click', () => {
    const amount = parseFloat(inputFrom.value);
    if (isNaN(amount) || amount <= 0) return;

    const operation = {
        amount: amount,
        from: selectFrom.value,
        to: selectTo.value,
        result: inputTo.value,
        date: new Date()
    };

    renderHistoryItem(operation);

    const history = JSON.parse(localStorage.getItem('history')) || [];
    history.push(operation);
    if (history.length > 10) history.shift();
    localStorage.setItem('history', JSON.stringify(history));
});

// --- ІСТОРІЯ ---
function renderHistoryItem(item) {
    const li = document.createElement('li');
    li.className = 'history-item';
    const date = new Date(item.date).toLocaleDateString('uk-UA', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });

    li.innerHTML = `
        <div class="history-item__icon-wrapper">
             <svg class="history-item__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
        </div>
        <div class="history-item__info">
            <div class="history-item__operation">${item.amount} ${item.from} → ${item.to}</div>
            <div class="history-item__date">${date}</div>
        </div>
        <div class="history-item__value">${item.result} ${item.to}</div>
    `;
    historyList.prepend(li);
    if(emptyMsg) emptyMsg.style.display = 'none';
}

function loadHistory() {
    const history = JSON.parse(localStorage.getItem('history')) || [];
    historyList.innerHTML = '';
    if (history.length === 0 && emptyMsg) {
        emptyMsg.style.display = 'block';
    } else {
        history.forEach(renderHistoryItem);
    }
}

clearHistoryBtn.addEventListener('click', () => {
    localStorage.removeItem('history');
    historyList.innerHTML = '';
    if(emptyMsg) emptyMsg.style.display = 'block';
});

// --- МОДАЛКА І СКРОЛ ---
const modal = document.getElementById('auth-modal');
const openModalBtn = document.getElementById('open-modal-btn');
const closeModalSpan = document.querySelector('.modal__close');

if(openModalBtn && modal) {
    openModalBtn.addEventListener('click', () => modal.classList.add('show'));
    closeModalSpan.addEventListener('click', () => modal.classList.remove('show'));
    window.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('show'); });
}

const scrollTopBtn = document.getElementById('scroll-top-btn');
if(scrollTopBtn) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) scrollTopBtn.classList.add('show');
        else scrollTopBtn.classList.remove('show');
    });
    scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// --- ЗАПУСК ---
initTheme();
loadHistory();
fetchRates(); // Основна функція із Завдання 7