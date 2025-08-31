// Konfiguracja API
const API_BASE_URL = 'http://radek77.pythonanywhere.com/api/quiz/';

// Elementy DOM
const quizContainer = document.getElementById('quiz');
const resultsContainer = document.getElementById('results');
const recommendationsList = document.getElementById('recommendations-list');
const restartButton = document.getElementById('restart-button');
const languageSelect = document.getElementById('language-select');
const mainTitle = document.getElementById('main-title');
const resultsTitle = document.getElementById('results-title');

// Zmienne stanu quizu
let currentQuestionId = 1;
let pathAnswers = [];
let currentLanguage = languageSelect ? languageSelect.value : 'pl';

// Teksty tłumaczeń (możesz rozszerzać, jeśli chcesz tłumaczyć więcej UI)
const translations = {
    'pl': {
        mainTitle: 'Znajdź idealny telefon',
        resultsTitle: 'Rekomendowane telefony:',
        restart: 'Rozpocznij od nowa',
        error: 'Wystąpił błąd',
        noRecommendations: 'Brak rekomendacji dla podanych odpowiedzi.',
        fetchError: 'Nie udało się połączyć z serwerem. Spróbuj ponownie później.',
        resultsFetchError: 'Nie udało się uzyskać wyników. Spróbuj ponownie.'
    },
    'en': {
        mainTitle: 'Find your perfect phone',
        resultsTitle: 'Recommended phones:',
        restart: 'Restart',
        error: 'An error occurred',
        noRecommendations: 'No recommendations for the selected answers.',
        fetchError: 'Could not connect to the server. Please try again later.',
        resultsFetchError: 'Could not get results. Please try again.'
    },
    'es': {
        mainTitle: 'Encuentra tu teléfono ideal',
        resultsTitle: 'Teléfonos recomendados:',
        restart: 'Reiniciar',
        error: 'Ocurrió un error',
        noRecommendations: 'No hay recomendaciones para las respuestas indicadas.',
        fetchError: 'No se pudo conectar al servidor. Inténtalo de nuevo más tarde.',
        resultsFetchError: 'No se pudieron obtener los resultados. Inténtalo de nuevo.'
    }
};

// Funkcja do ustawiania tłumaczeń UI
function setTranslations(lang) {
    if (mainTitle) mainTitle.textContent = translations[lang].mainTitle;
    if (resultsTitle) resultsTitle.textContent = translations[lang].resultsTitle;
    if (restartButton) restartButton.textContent = translations[lang].restart;
}

// Funkcja do pobierania pytania z API
async function getQuestion(questionId, language = currentLanguage) {
    try {
        const response = await fetch(`${API_BASE_URL}question?current_question_id=${questionId}&language=${language}`);
        const data = await response.json();

        if (response.status !== 200) {
            console.error('API Error:', data.error);
            quizContainer.innerHTML = `<p class="error">${translations[language].error}: ${data.error}</p>`;
            return;
        }

        displayQuestion(data, language);
    } catch (error) {
        console.error('Fetch Error:', error);
        quizContainer.innerHTML = `<p class="error">${translations[language].fetchError}</p>`;
    }
}

// Funkcja do wyświetlania pytania
function displayQuestion(questionData, language = currentLanguage) {
    quizContainer.innerHTML = ''; // Wyczyść poprzednie pytanie
    resultsContainer.classList.add('hidden');

    const questionText = document.createElement('p');
    questionText.className = 'question-text';
    questionText.textContent = questionData.question_text;
    quizContainer.appendChild(questionText);

    const answersDiv = document.createElement('div');
    questionData.answers.forEach(answer => {
        const button = document.createElement('button');
        button.className = 'answer-button';
        button.textContent = answer.answer_text;
        button.onclick = () => handleAnswer(answer.answer_id, answer.next_question_id);
        answersDiv.appendChild(button);
    });
    quizContainer.appendChild(answersDiv);
}

// Funkcja do obsługi odpowiedzi
async function handleAnswer(answerId, nextQuestionId) {
    pathAnswers.push(answerId);

    if (nextQuestionId === null) {
        // Ostatnie pytanie, wyślij wyniki do API
        await getResults(currentLanguage);
    } else {
        // Przejdź do następnego pytania
        currentQuestionId = nextQuestionId;
        await getQuestion(currentQuestionId, currentLanguage);
    }
}

// Funkcja do pobierania rekomendacji z API
async function getResults(language = currentLanguage) {
    try {
        const response = await fetch(`${API_BASE_URL}result`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                pathAnswers: pathAnswers,
                language: language
            })
        });

        const data = await response.json();

        if (response.status !== 200) {
            console.error('API Error:', data.error);
            quizContainer.innerHTML = `<p class="error">${translations[language].error}: ${data.error}</p>`;
            return;
        }

        displayResults(data.recommendations, language);
    } catch (error) {
        console.error('Fetch Error:', error);
        quizContainer.innerHTML = `<p class="error">${translations[language].resultsFetchError}</p>`;
    }
}

// Funkcja do wyświetlania wyników
function displayResults(recommendations, language = currentLanguage) {
    quizContainer.classList.add('hidden');
    resultsContainer.classList.remove('hidden');
    recommendationsList.innerHTML = '';

    if (recommendations.length === 0) {
        recommendationsList.innerHTML = `<li>${translations[language].noRecommendations}</li>`;
        return;
    }

    recommendations.forEach(product => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${product.product_name}</strong>`;
        
        if (product.links && product.links.length > 0) {
            const linksDiv = document.createElement('div');
            linksDiv.style.marginTop = '10px';
            product.links.forEach(link => {
                const a = document.createElement('a');
                a.href = link.link_url;
                a.textContent = `${language === 'pl' ? 'Kup w' : (language === 'es' ? 'Comprar en' : 'Buy at')} ${link.store_name}`;
                a.target = '_blank';
                a.style.marginRight = '10px';
                linksDiv.appendChild(a);
            });
            li.appendChild(linksDiv);
        }
        
        recommendationsList.appendChild(li);
    });
}

// Funkcja do resetowania quizu
restartButton.onclick = () => {
    currentQuestionId = 1;
    pathAnswers = [];
    quizContainer.classList.remove('hidden');
    resultsContainer.classList.add('hidden');
    getQuestion(currentQuestionId, currentLanguage);
};

// Obsługa zmiany języka
if (languageSelect) {
    languageSelect.addEventListener('change', () => {
        currentLanguage = languageSelect.value;
        setTranslations(currentLanguage);
        currentQuestionId = 1;
        pathAnswers = [];
        quizContainer.classList.remove('hidden');
        resultsContainer.classList.add('hidden');
        getQuestion(currentQuestionId, currentLanguage);
    });
}

// Ustawienie tłumaczeń UI na początku
setTranslations(currentLanguage);

// Rozpocznij quiz
getQuestion(currentQuestionId, currentLanguage);