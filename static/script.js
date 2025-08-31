// Konfiguracja API (zmieniona na ścieżkę względną)
const API_BASE_URL = '/api/quiz/';

// Elementy DOM
const quizContainer = document.getElementById('quiz');
const resultsContainer = document.getElementById('results');
const recommendationsList = document.getElementById('recommendations-list');
const restartButton = document.getElementById('restart-button');

// Zmienne stanu quizu
let currentQuestionId = 1;
let pathAnswers = [];

// Funkcja do pobierania pytania z API
async function getQuestion(questionId, language = 'pl') {
    try {
        const response = await fetch(`${API_BASE_URL}question?current_question_id=${questionId}&language=${language}`);
        const data = await response.json();

        if (response.status !== 200) {
            console.error('API Error:', data.error);
            quizContainer.innerHTML = `<p class="error">Wystąpił błąd: ${data.error}</p>`;
            return;
        }

        displayQuestion(data);
    } catch (error) {
        console.error('Fetch Error:', error);
        quizContainer.innerHTML = '<p class="error">Nie udało się połączyć z serwerem. Spróbuj ponownie później.</p>';
    }
}

// Funkcja do wyświetlania pytania
function displayQuestion(questionData) {
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
        await getResults();
    } else {
        // Przejdź do następnego pytania
        currentQuestionId = nextQuestionId;
        await getQuestion(currentQuestionId);
    }
}

// Funkcja do pobierania rekomendacji z API
async function getResults() {
    try {
        const response = await fetch(`${API_BASE_URL}result`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                pathAnswers: pathAnswers,
                language: 'pl'
            })
        });

        const data = await response.json();

        if (response.status !== 200) {
            console.error('API Error:', data.error);
            quizContainer.innerHTML = `<p class="error">Wystąpił błąd: ${data.error}</p>`;
            return;
        }

        displayResults(data.recommendations);
    } catch (error) {
        console.error('Fetch Error:', error);
        quizContainer.innerHTML = '<p class="error">Nie udało się uzyskać wyników. Spróbuj ponownie.</p>';
    }
}

// Funkcja do wyświetlania wyników
function displayResults(recommendations) {
    quizContainer.classList.add('hidden');
    resultsContainer.classList.remove('hidden');
    recommendationsList.innerHTML = '';

    if (recommendations.length === 0) {
        recommendationsList.innerHTML = '<li>Brak rekomendacji dla podanych odpowiedzi.</li>';
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
                a.textContent = `Kup w ${link.store_name}`;
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
    getQuestion(currentQuestionId);
};

// Rozpocznij quiz
getQuestion(currentQuestionId);
