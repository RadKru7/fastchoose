// Konfiguracja API
const API_BASE_URL = '/api/quiz/';

// Elementy DOM
let quizContainer, quizContent, resultsContainer, recommendationsList, restartButton, languageSelect, heroSection, mainContent, getStartedBtn;

// Zmienne stanu quizu
let currentQuestionId = 1;
let pathAnswers = [];
let currentLanguage = 'pl';

// Po załadowaniu DOM
document.addEventListener('DOMContentLoaded', () => {
    quizContainer = document.getElementById('quiz-container');
    quizContent = document.getElementById('quiz-content');
    resultsContainer = document.getElementById('results-container');
    recommendationsList = document.getElementById('recommendations-list');
    restartButton = document.getElementById('restart-btn');
    languageSelect = document.getElementById('lang-select');
    heroSection = document.getElementById('hero-section');
    mainContent = document.getElementById('main-content');
    getStartedBtn = document.getElementById('get-started-btn');

    // Obsługa przycisku Rozpocznij
    if(getStartedBtn) {
        getStartedBtn.addEventListener('click', startQuiz);
    }

    // Obsługa restartu quizu
    if(restartButton) {
        restartButton.addEventListener('click', restartQuiz);
    }

    // Obsługa zmiany języka
    if(languageSelect) {
        languageSelect.addEventListener('change', (e) => {
            currentLanguage = languageSelect.value;
            restartQuiz();
        });
    }
});

// Start quizu
function startQuiz() {
    if(heroSection) heroSection.style.display = 'none';
    if(mainContent) mainContent.style.display = 'none';
    if(quizContainer) quizContainer.style.display = 'block';
    if(resultsContainer) resultsContainer.style.display = 'none';

    currentQuestionId = 1;
    pathAnswers = [];
    loadQuestion(currentQuestionId);
}

// Restart quizu
function restartQuiz() {
    if(heroSection) heroSection.style.display = 'flex';
    if(mainContent) mainContent.style.display = 'block';
    if(quizContainer) quizContainer.style.display = 'none';
    if(resultsContainer) resultsContainer.style.display = 'none';
}

// Wczytaj pytanie z API
function loadQuestion(questionId) {
    fetch(`/api/quiz/question?current_question_id=${questionId}&language=${currentLanguage}`)
    .then(res => res.json())
    .then(data => {
        if(data.error) {
            quizContent.innerHTML = '<div style="color:red">' + data.error + '</div>';
            return;
        }
        renderQuestion(data);
    }).catch(() => {
        quizContent.innerHTML = '<div style="color:red">Błąd połączenia z serwerem.</div>';
    });
}

function renderQuestion(data) {
    let html = `<div class="quiz-question"><h3>${data.question_text}</h3></div>`;
    data.answers.forEach(answer => {
        html += `<button class="answer-btn" data-id="${answer.answer_id}" data-next="${answer.next_question_id}">${answer.answer_text}</button>`;
    });
    quizContent.innerHTML = html;
    document.querySelectorAll('.answer-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const answerId = parseInt(btn.dataset.id);
            const nextId = btn.dataset.next ? parseInt(btn.dataset.next) : null;
            pathAnswers.push(answerId);
            if(nextId) {
                currentQuestionId = nextId;
                loadQuestion(currentQuestionId);
            } else {
                showResults();
            }
        });
    });
}

// Pobierz wyniki z API
function showResults() {
    fetch('/api/quiz/result', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ pathAnswers, language: currentLanguage })
    })
    .then(res => res.json())
    .then(data => {
        quizContainer.style.display = 'none';
        resultsContainer.style.display = 'block';
        if(data.error) {
            document.getElementById('results-content').innerHTML = '<div style="color:red">' + data.error + '</div>';
            recommendationsList.innerHTML = '';
            return;
        }
        if(data.recommendations.length === 0) {
            document.getElementById('results-content').innerHTML = '<div>Brak rekomendacji dla podanych odpowiedzi.</div>';
            recommendationsList.innerHTML = '';
            return;
        }
        document.getElementById('results-content').innerHTML = '<div>Rekomendowane telefony:</div>';
        recommendationsList.innerHTML = data.recommendations.map(rec => {
            return `<li><b>${rec.product_name}</b><ul>$${
                rec.links.map(link => `<li><a href="${link.link_url}" target="_blank">${link.store_name}</a></li>`).join('')
            }</ul></li>`;
        }).join('');
    }).catch(() => {
        quizContainer.style.display = 'none';
        resultsContainer.style.display = 'block';
        document.getElementById('results-content').innerHTML = '<div style="color:red">Błąd pobierania wyników.</div>';
        recommendationsList.innerHTML = '';
    });
}