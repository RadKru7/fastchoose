// Konfiguracja API
const API_BASE_URL = '/api/quiz/';

// Elementy DOM
// Zmienne te są inicjalizowane na górze, ale ich wartości będą ustawione
// dopiero w bloku DOMContentLoaded, aby upewnić się, że elementy istnieją.
let quizContainer;
let quizContent;
let resultsContainer;
let recommendationsList;
let restartButton;
let languageSelect;
let heroSection;
let mainContent; // Dodana zmienna dla głównej zawartości

// Nowe elementy DOM dla menu mobilnego
let menuToggle;
let mainMenu;

// Zmienne stanu quizu
let currentQuestionId = 1;
let pathAnswers = [];
let currentLanguage = 'pl'; // Domyślny język, zostanie zaktualizowany po załadowaniu

// Teksty tłumaczeń
const translations = {
    'pl': {
        // Teksty dla strony startowej
        hero_title: "Dokonuj lepszych<br>wyborów, szybko i sprawnie.",
        hero_desc: "Przestań tracić czas na porównywanie.<br>Nasze narzędzie pomoże Ci wybrać<br>najlepszą opcję w kilka sekund.",
        hero_btn: "Rozpocznij",
        bigTitle: "Wybierz szybciej, żyj wygodniej!",
        subtitle: "FastChoose pomaga podejmować decyzje, wybierać szybko i trafnie!<br>Aktywuj poniższy przycisk i rozpocznij serię pytań.",
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
        bigTitle: "Choose faster, live better!",
        subtitle: "FastChoose helps you make decisions, choose quickly and accurately!<br>Activate the button below and start a series of questions.",
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
        bigTitle: "¡Elige más rápido, vive mejor!",
        subtitle: "¡FastChoose te ayuda a tomar decisiones, a elegir de forma rápida y precisa!<br>Activa el botón de abajo y comienza una serie de preguntas.",
        // Teksty dla quizu i wyników
        mainTitle: 'Encuentra tu teléfono ideal',
        resultsTitle: 'Teléfonos recomendados:',
        restart: 'Reiniciar',
        error: 'Ocurrió un error',
        noRecommendations: 'No hay recomendaciones para las respuestas indicane.',
        fetchError: 'No se pudo conectar al servidor. Inténtalo de nuevo más tarde.',
        resultsFetchError: 'No se pudieron obtener los resultados. Inténtalo de nuevo.',
        buy: 'Comprar en'
    }
};

// Funkcja do aktualizacji tekstów na stronie (UI)
function updateUILanguage(lang) {
    const heroBtn = document.getElementById('get-started-btn');
    if (heroBtn) heroBtn.textContent = translations[lang].hero_btn;

    // Aktualizacja tekstów .big-title i .subtitle
    const bigTitle = document.querySelector('.big-title');
    const subtitle = document.querySelector('.subtitle');
    if (bigTitle) bigTitle.innerHTML = translations[lang].bigTitle;
    if (subtitle) subtitle.innerHTML = translations[lang].subtitle;

    const resultsTitle = document.getElementById('results-title');
    if (resultsTitle) resultsTitle.textContent = translations[lang].resultsTitle;
    if (restartButton) restartButton.textContent = translations[lang].restart;
}

// Funkcja do pobierania pytania z API
async function getQuestion(questionId) {
    console.log(`[DEBUG] Wywołano getQuestion z ID: ${questionId}`);
    try {
        const response = await fetch(`${API_BASE_URL}question?current_question_id=${questionId}&language=${currentLanguage}`);
        const data = await response.json();
        console.log('[DEBUG] Otrzymano dane z API:', data); // Zobaczmy, co dokładnie zwraca API

        if (response.status !== 200 || !data || !data.answers) {
            console.error('[DEBUG] Błąd API lub nieprawidłowe dane:', data);
            quizContent.innerHTML = `<p class="error">${translations[currentLanguage].error}: ${data?.error || 'Nieprawidłowe dane z serwera.'}</p>`;
            return;
        }

        displayQuestion(data);
    } catch (error) {
        console.error('[DEBUG] Błąd w getQuestion (fetch):', error);
        quizContent.innerHTML = `<p class="error">${translations[currentLanguage].fetchError}</p>`;
    }
}

// Funkcja do wyświetlania pytania
function displayQuestion(question) {
    console.log('[DEBUG] Wywołano displayQuestion z danymi:', question);
    console.log('[DEBUG] Element quizContent przed zmianą:', quizContent); // Sprawdźmy, czy element istnieje

    quizContent.innerHTML = `
        <div class="question-card">
            <h2 class="question-text">${question.question_text}</h2>
            <div class="options-container">
                ${question.answers.map(option => `
                    <button class="answer-btn" data-next-id="${option.next_question_id}" data-answer-id="${option.answer_id}">
                        ${option.answer_text}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
    console.log('[DEBUG] quizContent.innerHTML został ustawiony.');
    addOptionListeners();
}

// Funkcja do pobierania wyników z API
async function getResults() {
    try {
        const response = await fetch(`${API_BASE_URL}result`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                pathAnswers: pathAnswers,
                language: currentLanguage
            })
        });
        const data = await response.json();

        if (response.status !== 200) {
            console.error('API Error:', data.error);
            recommendationsList.innerHTML = `<li class="error">${translations[currentLanguage].resultsFetchError}</li>`;
            return;
        }

        displayResults(data.recommendations);
    } catch (error) {
        console.error('Fetch Error:', error);
        recommendationsList.innerHTML = `<li class="error">${translations[currentLanguage].resultsFetchError}</li>`;
    }
}

// Funkcja do wyświetlania rekomendacji
function displayResults(recommendations) {
    quizContainer.style.display = 'none';
    resultsContainer.style.display = 'block';
    
    const resultsContent = document.getElementById('results-content');
    resultsContent.innerHTML = `<h2 id="results-title">${translations[currentLanguage].resultsTitle}</h2>`;

    recommendationsList.innerHTML = '';

    if (!recommendations || recommendations.length === 0) {
        recommendationsList.innerHTML = `<li class="no-recommendations">${translations[currentLanguage].noRecommendations}</li>`;
        return;
    }

    recommendations.forEach(phone => {
        const li = document.createElement('li');
        li.classList.add('phone-card');
        li.innerHTML = `
            <div class="phone-details">
                <h3 class="phone-name">${phone.product_name}</h3>
                <div class="phone-buy-links">
                    ${phone.links.map(link => `
                        <a href="${link.link_url}" target="_blank" class="buy-link">${translations[currentLanguage].buy} ${link.store_name}</a>
                    `).join('')}
                </div>
            </div>
        `;
        recommendationsList.appendChild(li);
    });
}

// Funkcja do obsługi kliknięcia odpowiedzi
function handleAnswer(nextQuestionId, answerId) {
    pathAnswers.push(parseInt(answerId, 10)); // Upewnij się, że ID jest liczbą
    if (nextQuestionId && nextQuestionId !== "None") {
        currentQuestionId = nextQuestionId;
        getQuestion(currentQuestionId);
    } else {
        getResults();
    }
}

// Funkcja do dodawania słuchaczy zdarzeń do przycisków odpowiedzi
function addOptionListeners() {
    document.querySelectorAll('.answer-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const nextId = e.target.dataset.nextId;
            const answerId = e.target.dataset.answerId;
            handleAnswer(nextId, answerId);
        });
    });
}

// Funkcja do restartowania quizu
function restartQuiz() {
    currentQuestionId = 1;
    pathAnswers = [];
    resultsContainer.style.display = 'none';
    heroSection.style.display = 'flex';
    mainContent.style.display = 'block';
    quizContainer.style.display = 'none';
    getQuestion(currentQuestionId);
}

// Cała logika aplikacji, która wymaga załadowania DOM, jest tutaj
document.addEventListener('DOMContentLoaded', () => {
    // Inicjalizacja elementów DOM po załadowaniu strony
    heroSection = document.getElementById('hero-section');
    mainContent = document.getElementById('main-content');
    quizContainer = document.getElementById('quiz-container');
    quizContent = document.getElementById('quiz-content');
    resultsContainer = document.getElementById('results-container');
    recommendationsList = document.getElementById('recommendations-list');
    restartButton = document.getElementById('restart-btn');
    languageSelect = document.getElementById('lang-select');
    const getStartedBtn = document.getElementById('get-started-btn');
    
    // Upewnij się, że elementy istnieją przed dodaniem słuchaczy
    if (quizContainer) {
        quizContainer.style.display = 'none';
    }
    if (resultsContainer) {
        resultsContainer.style.display = 'none';
    }

    // Dodanie słuchaczy zdarzeń po załadowaniu DOM
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('[DEBUG] Kliknięto "Rozpocznij"');
            if (heroSection) {
                heroSection.style.display = 'none';
            }
            if (mainContent) {
                mainContent.style.display = 'none';
            }
            if (quizContainer) {
                quizContainer.style.display = 'block';
                console.log('[DEBUG] Kontener quizu został wyświetlony.');
            }
            getQuestion(currentQuestionId);
        });
    }

    if (restartButton) {
        restartButton.addEventListener('click', restartQuiz);
    }

    if (languageSelect) {
        currentLanguage = languageSelect.value;
        languageSelect.addEventListener('change', (e) => {
            currentLanguage = e.target.value;
            updateUILanguage(currentLanguage);
            // Nie restartujemy quizu przy zmianie języka, tylko aktualizujemy teksty
        });
    }

    // Uruchomienie początkowej konfiguracji języka
    updateUILanguage(currentLanguage);
});
