import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// 👇 ТУТ БУЛА ПОМИЛКА. Тепер шляхи правильні для твоєї структури:
import './variables.css';
import './base.css';
import './layout.css';
import './components.css';
import './themes.css';
import './responsive.css';

import axios from 'axios';

// --- SPLASH SCREEN LOGIC ---
const splashScreen = document.getElementById('splash-screen');

// 1. Примусово встановлюємо тему ДО показу сторінки, щоб крапка була правильного кольору
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
}

// 2. Прибираємо сплеш-скрін через 2.5 секунди (коли анімація пройде)
window.addEventListener('load', () => {
    setTimeout(() => {
        if (splashScreen) {
            splashScreen.classList.add('hidden');
            
            // Видаляємо з DOM повністю, щоб не заважав
            setTimeout(() => {
                splashScreen.remove();
            }, 500);
        }
    }, 2000); // Час має бути трохи більшим за тривалість анімації CSS (1.5s + пауза)
});

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

// Елементи спінера та таблиці
const spinner = document.getElementById('loading-spinner');
const currencyTable = document.getElementById('currency-table');
const tableBody = document.getElementById('currency-table-body');

// Змінна для курсів
let RATES = { UAH: 1 };

// --- 0. БЕЗПЕЧНА РОБОТА З LOCALSTORAGE (ЗАВДАННЯ 10) ---
// Ця функція не дасть сайту впасти, якщо дані пошкоджені
function getSafeStorage(key, defaultValue) {
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
        console.warn(`Помилка читання localStorage [${key}]:`, error);
        return defaultValue; // Повертаємо дефолт, якщо дані биті
    }
}

// --- 1. КЕШУВАННЯ СТАНУ (ЗАВДАННЯ 10) ---
// Зберігаємо те, що ввів користувач (Сума, Валюти)
function saveConverterState() {
    const state = {
        amount: inputFrom.value,
        from: selectFrom.value,
        to: selectTo.value
    };
    localStorage.setItem('converter_state', JSON.stringify(state));
}

// Відновлюємо стан при запуску
function loadConverterState() {
    const savedState = getSafeStorage('converter_state', null);
    if (savedState) {
        inputFrom.value = savedState.amount || 100;
        selectFrom.value = savedState.from || 'USD';
        selectTo.value = savedState.to || 'UAH';
    }
}

// --- 2. API ЗАПИТ ---
async function fetchRates() {
    try {
        spinner.style.display = 'block';
        currencyTable.style.display = 'none';
        
        // Штучна затримка
        await new Promise(resolve => setTimeout(resolve, 500));

        const response = await axios.get('https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json');
        const data = response.data;

        data.forEach(item => { RATES[item.cc] = item.rate; });

        if(data[0]) {
            const dateSpan = document.querySelector('.card__date');
            if(dateSpan) dateSpan.textContent = `Курс НБУ на ${data[0].exchangedate}`;
        }

        // Оновлення списку банків
        const topCurrencies = ['USD', 'EUR', 'GBP'];
        const bankList = document.getElementById('nbu-rates-list');
        if (bankList) {
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
        }

        // Оновлення таблиці
        if (tableBody) {
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
        }

        // Після завантаження курсів - відновлюємо збережені числа користувача
        loadConverterState();
        calculate();

    } catch (error) {
        console.error("Помилка API:", error);
        if(alertBox) {
            alertBox.style.display = 'block';
            alertBox.textContent = 'Не вдалося завантажити курси. Працюємо офлайн.';
        }
    } finally {
        if(spinner) spinner.style.display = 'none';
        if(currencyTable && tableBody && tableBody.children.length > 0) {
            currencyTable.style.display = 'table';
        }
    }
}

// --- 3. РОЗРАХУНОК ---
function calculate() {
    try {
        const amount = parseFloat(inputFrom.value);
        const currFrom = selectFrom.value;
        const currTo = selectTo.value;

        // Зберігаємо стан при кожній зміні
        saveConverterState();

        if (isNaN(amount)) {
            inputTo.value = '';
            inputFrom.classList.remove('is-invalid');
            return;
        }

        if (amount < 0) {
            throw new Error("Негативне число");
        }

        const rateFrom = RATES[currFrom] || 1;
        const rateTo = RATES[currTo] || 1;
        const res = (amount * rateFrom) / rateTo;
        
        inputTo.value = res.toFixed(2);
        inputFrom.classList.remove('is-invalid');

    } catch (error) {
        inputFrom.classList.add('is-invalid');
        inputTo.value = "---";
    }
}

// Слухачі подій для калькулятора
inputFrom.addEventListener('input', calculate);
selectFrom.addEventListener('change', calculate);
selectTo.addEventListener('change', calculate);

swapBtn.addEventListener('click', () => {
    const tempCurr = selectFrom.value;
    selectFrom.value = selectTo.value;
    selectTo.value = tempCurr;
    calculate();
});

// --- 4. ІСТОРІЯ (З LocalStorage) ---
const ITEMS_PER_PAGE = 5;
let currentPage = 1;
const prevBtn = document.getElementById('prev-page');
const nextBtn = document.getElementById('next-page');
const pageIndicator = document.getElementById('page-indicator');

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
    historyList.appendChild(li);
}

function loadHistory() {
    // Використовуємо безпечну функцію
    const history = getSafeStorage('history', []);
    
    historyList.innerHTML = '';

    if (history.length === 0) {
        if(emptyMsg) emptyMsg.style.display = 'block';
        if(pageIndicator) pageIndicator.textContent = '0 з 0';
        if(prevBtn) prevBtn.disabled = true;
        if(nextBtn) nextBtn.disabled = true;
        return;
    }
    if(emptyMsg) emptyMsg.style.display = 'none';

    const reversedHistory = [...history].reverse(); 
    const totalPages = Math.ceil(reversedHistory.length / ITEMS_PER_PAGE);
    
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const itemsToShow = reversedHistory.slice(startIndex, endIndex);

    itemsToShow.forEach(renderHistoryItem);

    if(pageIndicator) pageIndicator.textContent = `Стор. ${currentPage} з ${totalPages}`;
    if(prevBtn) prevBtn.disabled = currentPage === 1;
    if(nextBtn) nextBtn.disabled = currentPage === totalPages;
}

if(prevBtn) prevBtn.addEventListener('click', () => { if(currentPage > 1) { currentPage--; loadHistory(); } });
if(nextBtn) nextBtn.addEventListener('click', () => { 
    const h = getSafeStorage('history', []);
    if(currentPage < Math.ceil(h.length/ITEMS_PER_PAGE)) { currentPage++; loadHistory(); } 
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

    const history = getSafeStorage('history', []);
    history.push(operation);
    if (history.length > 50) history.shift();
    
    localStorage.setItem('history', JSON.stringify(history));
    
    currentPage = 1;
    loadHistory();
});

clearHistoryBtn.addEventListener('click', () => {
    if(confirm('Очистити історію?')) {
        localStorage.removeItem('history');
        currentPage = 1;
        loadHistory();
    }
});

// --- 5. ТЕМА ---
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

// --- 6. МОДАЛКА (POST) ---
const registerForm = document.getElementById('register-form');
const modal = document.getElementById('auth-modal');
const openModalBtn = document.getElementById('open-modal-btn');
const closeModalSpan = document.querySelector('.modal__close');

if(openModalBtn && modal) {
    openModalBtn.addEventListener('click', () => modal.classList.add('show'));
    closeModalSpan.addEventListener('click', () => modal.classList.remove('show'));
    window.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('show'); });
}

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = registerForm.querySelector('.auth-btn');
        const originalText = btn.textContent;
        
        try {
            btn.disabled = true;
            btn.textContent = 'Обробка...';
            // POST Request
            await axios.post('https://jsonplaceholder.typicode.com/posts', {
                email: document.getElementById('email').value
            });
            alert('Реєстрація успішна!');
            modal.classList.remove('show');
            registerForm.reset();
        } catch (e) {
            alert('Помилка сервера');
        } finally {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    });
}

// --- ЗАПУСК ---
initTheme();
loadHistory();
fetchRates(); // В кінці викликає loadConverterState()
const scrollTopBtn = document.getElementById('scroll-top-btn');
if(scrollTopBtn) {
    window.addEventListener('scroll', () => {
        if(window.scrollY > 300) scrollTopBtn.classList.add('show');
        else scrollTopBtn.classList.remove('show');
    });
    scrollTopBtn.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));
}