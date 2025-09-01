// Konfiguracja API
const API_BASE_URL = '/api/quiz/';

// Elementy DOM
const quizContainer = document.getElementById('quiz');
const quizContent = document.getElementById('quiz-content');
const resultsContainer = document.getElementById('results');
const recommendationsList = document.getElementById('recommendations-list');
const restartButton = document.getElementById('restart-button');
const languageSelect = document.getElementById('language-select');

// Nowe elementy DOM dla menu mobilnego
const menuToggle = document.querySelector('.menu-toggle');
const mainMenu = document.getElementById('main-menu');

// Zmienne stanu quizu
let currentQuestionId = 1;
let pathAnswers = [];
let currentLanguage = languageSelect ? languageSelect.value : 'pl';

// Teksty tłumaczeń
const translations = {
    'pl': {
        // Teksty dla strony startowej
        hero_title: "Dokonuj lepszych<br>wyborów, szybko i sprawnie.",
        hero_desc: "Przestań tracić czas na porównywanie.<br>Nasze narzędzie pomoże Ci wybrać<br>najlepszą opcję w kilka sekund.",
        hero_btn: "Rozpocznij",
        // Teksty dla quizu i wyników
        mainTitle: 'Znajdź idealny telefon',
        resultsTitle: 'Rekomendowane telefony:',
        restart: 'Rozpocznij od nowa',
        error: 'Wystąpił błąd',
        noRecommendations: 'Brak rekomendacji dla podanych odpowiedzi.',
        fetchError: 'Nie udało się połączyć z serwerem. Spróbuj ponownie później.',
        resultsFetchError: 'Nie udało się uzyskać wyników. Spróbuj ponownie.',
        buy: 'Kup w'
    },
    'en': {
        // Teksty dla strony startowej
        hero_title: "Make better<br>choices, faster.",
        hero_desc: "Stop wasting time comparing options.<br>Our tool helps you compare and choose<br>the best option in seconds.",
        hero_btn: "Get started",
        // Teksty dla quizu i wyników
        mainTitle: 'Find your perfect phone',
        resultsTitle: 'Recommended phones:',
        restart: 'Restart',
        error: 'An error occurred',
        noRecommendations: 'No recommendations for the selected answers.',
        fetchError: 'Could not connect to the server. Please try again later.',
        resultsFetchError: 'Could not get results. Please try again.',
        buy: 'Buy at'
    },
    'es': {
        // Teksty dla strony startowej
        hero_title: "Toma mejores<br>decisiones, más rápido.",
        hero_desc: "Deja de perder tiempo comparando opciones.<br>Nuestra herramienta te ayuda a comparar y elegir<br>la mejor opción en segundos.",
        hero_btn: "Empezar",
        // Teksty dla quizu i wyników
        mainTitle: 'Encuentra tu teléfono ideal',
        resultsTitle: 'Teléfonos recomendados:',
        restart: 'Reiniciar',
        error: 'Ocurrió un error',
        noRecommendations: 'No hay recomendaciones para las respuestas indicadas.',
        fetchError: 'No se pudo conectar al servidor. Inténtalo de nuevo más tarde.',
        resultsFetchError: 'No se pudieron obtener los resultados. Inténtalo de nuevo.',
        buy: 'Comprar en'
    }
};

// Funkcja do aktualizacji tekstów na stronie (UI)
function updateUILanguage(lang) {
    // Tłumaczenia dla strony startowej
    const heroTitle = document.querySelector('.hero-title');
    const heroDesc = document.querySelector('.hero-desc');
    const heroBtn = document.querySelector('.get-started-btn');
    if (heroTitle) heroTitle.innerHTML = translations[lang].hero_title;
    if (heroDesc) heroDesc.innerHTML = translations[lang].hero_desc;
    if (heroBtn) heroBtn.textContent = translations[lang].hero_btn;

    // Tłumaczenia dla sekcji quizu i wyników
    const mainTitle = document.getElementById('main-title');
    const resultsTitle = document.getElementById('results-title');
    if (mainTitle) mainTitle.textContent = translations[lang].mainTitle;
    if (resultsTitle) resultsTitle.textContent = translations[lang].resultsTitle;
    if (restartButton) restartButton.textContent = translations[lang].restart;
}

// Funkcja do pobierania pytania z API
async function getQuestion(questionId) {
    try {
        const response = await fetch(`${API_BASE_URL}question?current_question_id=${questionId}&language=${currentLanguage}`);
        const data = await response.json();

        if (response.status !== 200) {
            console.error('API Error:', data.error);
            quizContent.innerHTML = `<p class="error">${translations[currentLanguage].error}: ${data.error}</p>`;
            return;
        }

        displayQuestion(data);
    } catch (error) {
        console.error('Fetch Error:', error);
        quizContent.innerHTML = `<p
