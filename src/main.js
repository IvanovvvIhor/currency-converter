import './style.css'

// Елементи
const themeBtn = document.getElementById('theme-toggle');
const body = document.body;
const inputFrom = document.getElementById('input-from');
const inputTo = document.getElementById('input-to');
const selectFrom = document.getElementById('select-from');
const selectTo = document.getElementById('select-to');
const swapBtn = document.getElementById('swap-btn');
const convertBtn = document.getElementById('convert-btn'); // Наша нова кнопка
const historyList = document.querySelector('.history-list');
const clearHistoryBtn = document.querySelector('.history-clear-btn');
const emptyMsg = document.querySelector('.history-empty');

// Курси валют (відносно гривні)
const RATES = {
    UAH: 1,
    USD: 41.50,
    EUR: 45.20,
    GBP: 52.80,
    PLN: 10.45
};

// --- ТЕМА ---
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

    const res = (amount * RATES[currFrom]) / RATES[currTo];
    inputTo.value = res.toFixed(2);
}

// Події для розрахунку
inputFrom.addEventListener('input', calculate);
selectFrom.addEventListener('change', calculate);
selectTo.addEventListener('change', calculate);

// Кнопка Swap (міняє місцями)
swapBtn.addEventListener('click', () => {
    const tempCurr = selectFrom.value;
    selectFrom.value = selectTo.value;
    selectTo.value = tempCurr;
    calculate();
});

// --- ІСТОРІЯ ---

function renderItem(item) {
    const li = document.createElement('li');
    li.className = 'history-item';
    
    // Дата
    const date = new Date(item.date).toLocaleDateString('uk-UA', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });

    li.innerHTML = `
        <div class="history-item__icon-wrapper">
            <svg class="history-item__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                 <path d="M12 5v14M5 12l7 7 7-7"/>
            </svg>
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
        history.forEach(renderItem);
    }
}

// КЛІК ПО НОВІЙ КНОПЦІ
convertBtn.addEventListener('click', () => {
    const amount = parseFloat(inputFrom.value);
    if (isNaN(amount) || amount <= 0) return;

    // Створюємо об'єкт операції
    const operation = {
        amount: amount,
        from: selectFrom.value,
        to: selectTo.value,
        result: inputTo.value,
        date: new Date()
    };

    // 1. Додаємо в список на екрані
    renderItem(operation);

    // 2. Зберігаємо в пам'ять
    const history = JSON.parse(localStorage.getItem('history')) || [];
    history.push(operation);
    
    // Зберігаємо тільки останні 10
    if (history.length > 10) history.shift();
    
    localStorage.setItem('history', JSON.stringify(history));
});

clearHistoryBtn.addEventListener('click', () => {
    localStorage.removeItem('history');
    historyList.innerHTML = '';
    if(emptyMsg) emptyMsg.style.display = 'block';
});

// Старт
initTheme();
loadHistory();
calculate();



const modal = document.getElementById('auth-modal');
const openModalBtn = document.getElementById('open-modal-btn');
const closeModalSpan = document.querySelector('.modal__close');
const registerForm = document.getElementById('register-form');

const emailInput = document.getElementById('email');
const passInput = document.getElementById('password');
const confirmInput = document.getElementById('confirm-password');

// 1. Відкриття/Закриття модалки
openModalBtn.addEventListener('click', () => {
    modal.classList.add('show');
});

closeModalSpan.addEventListener('click', () => {
    modal.classList.remove('show');
});

// Закрити при кліку за межами вікна
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('show');
    }
});

// 2. Універсальна функція показу помилки
function showError(input, message) {
    const errorSpan = document.getElementById(input.id + '-error');
    input.classList.add('error');
    input.classList.remove('success');
    errorSpan.textContent = message;
}

function showSuccess(input) {
    const errorSpan = document.getElementById(input.id + '-error');
    input.classList.remove('error');
    input.classList.add('success');
    errorSpan.textContent = ''; // Очистити текст помилки
}

// 3. Валідація Email
function validateEmail() {
    // Простий RegEx для email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (emailInput.value.trim() === '') {
        showError(emailInput, 'Email обов’язковий');
        return false;
    } else if (!emailPattern.test(emailInput.value)) {
        showError(emailInput, 'Введіть коректний email (напр. user@mail.com)');
        return false;
    } else {
        showSuccess(emailInput);
        return true;
    }
}

// 4. Валідація Пароля
function validatePassword() {
    if (passInput.value.length < 6) {
        showError(passInput, 'Пароль має бути не менше 6 символів');
        return false;
    } else {
        showSuccess(passInput);
        return true;
    }
}

// 5. Валідація Підтвердження (збіг паролів)
function validateConfirm() {
    if (confirmInput.value !== passInput.value) {
        showError(confirmInput, 'Паролі не співпадають');
        return false;
    } else if (confirmInput.value === '') {
        showError(confirmInput, 'Підтвердіть пароль');
        return false;
    } else {
        showSuccess(confirmInput);
        return true;
    }
}

// 6. Слухачі подій (Real-time валідація)
emailInput.addEventListener('input', validateEmail);
passInput.addEventListener('input', () => {
    validatePassword();
    // Якщо ми змінюємо основний пароль, треба перевірити і підтвердження
    if (confirmInput.value !== '') validateConfirm();
});
confirmInput.addEventListener('input', validateConfirm);

// 7. Відправка форми
registerForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Зупиняємо перезавантаження сторінки

    // Фінальна перевірка всіх полів
    const isEmailValid = validateEmail();
    const isPassValid = validatePassword();
    const isConfirmValid = validateConfirm();

    if (isEmailValid && isPassValid && isConfirmValid) {
        // Тут буде код відправки на сервер (в майбутньому)
        alert('Реєстрація успішна! Ласкаво просимо.');
        modal.classList.remove('show');
        registerForm.reset(); // Очистити форму
        
        // Прибираємо зелені рамки
        [emailInput, passInput, confirmInput].forEach(input => input.classList.remove('success'));
    }
});