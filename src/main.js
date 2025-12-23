import './style.css'

// 1. Отримуємо елементи
const themeBtn = document.getElementById('theme-toggle');
const body = document.body;

// Іконки (SVG код)
const sunIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path></svg>`;
const moonIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;

// 2. Функція перевірки теми при завантаженні
function initTheme() {
    // Чи є збережена тема в LocalStorage?
    const savedTheme = localStorage.getItem('theme');

    // Якщо 'light' - вмикаємо світлу
    if (savedTheme === 'light') {
        body.classList.add('light-theme');
        themeBtn.innerHTML = moonIcon; // Показуємо місяць (щоб перемкнути назад на темну)
    } else {
        themeBtn.innerHTML = sunIcon; // За замовчуванням сонце
    }
}

// 3. Обробник кліку
themeBtn.addEventListener('click', () => {
    // Перемикаємо клас
    body.classList.toggle('light-theme');

    // Перевіряємо, яка тема стала активною
    const isLight = body.classList.contains('light-theme');

    // Оновлюємо іконку
    themeBtn.innerHTML = isLight ? moonIcon : sunIcon;

    // Зберігаємо в пам'ять (Ключ 'theme', Значення 'light' або 'dark')
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
});

// Запускаємо при старті
initTheme();