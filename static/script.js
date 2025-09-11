document.addEventListener('DOMContentLoaded', function () {
    // --- Elementy strony ---
    const startBtn = document.getElementById('get-started-btn');
    const langSelect = document.getElementById('lang-select');
    
    // Elementy specyficzne dla strony quizu - mogą być null na stronie startowej
    const quizContainer = document.getElementById('quiz-container');
    const questionText = document.getElementById('question-text');
    const questionIcon = document.getElementById('question-icon');
    const answersContainer = document.getElementById('answers-container');
    const resultsContainer = document.getElementById('results-container');
    const backBtn = document.getElementById('back-btn');
    const quizContent = document.getElementById('quiz-content');

    // --- Stan aplikacji ---
    let currentQuestionId = 1;
    let userAnswers = {};
    let history = [];
    let currentLang = 'pl';

    // --- Inicjalizacja ---
    function init() {
        // Logika dla przycisku "Rozpocznij" - jeśli istnieje, przekierowuje do quizu
        if (startBtn) {
            startBtn.addEventListener('click', function() {
                window.location.href = '/quiz'; // Kluczowa zmiana: po prostu przekieruj
            });
        }

        // Logika dla strony quizu - jeśli na niej jesteśmy
        if (quizContainer) {
            if (langSelect) {
                langSelect.addEventListener('change', handleLangChange);
            }
            if (backBtn) {
                backBtn.addEventListener('click', goBack);
            }
            // Rozpocznij wczytywanie pierwszego pytania
            loadLanguage(currentLang, () => fetchQuestion(currentQuestionId));
        }
        
        // Logika dla strony startowej - jeśli na niej jesteśmy
        if (!quizContainer && langSelect) {
             loadLanguage(currentLang);
        }
    }

    // --- Logika biznesowa ---
    function handleLangChange() {
        currentLang = this.value;
        if (quizContainer.style.display !== 'none') {
            loadLanguage(currentLang, () => fetchQuestion(currentQuestionId, true));
        }
    }

    function goBack() {
        if (history.length > 0) {
            const lastState = history.pop();
            currentQuestionId = lastState.questionId;
            userAnswers = lastState.answers;
            fetchQuestion(currentQuestionId, true);
        }
    }

    function loadLanguage(lang, callback) {
        fetch(`/lang/${lang}`)
            .then(response => response.json())
            .then(data => {
                window.translations = data;
                if (callback) callback();
            })
            .catch(error => console.error('Error loading language file:', error));
    }

    function fetchQuestion(questionId, isNavigating = false) {
        if (!isNavigating) {
            history.push({ questionId: currentQuestionId, answers: { ...userAnswers } });
        }

        if (quizContent) quizContent.classList.add('fade-out');

        setTimeout(() => {
            fetch(`/question/${questionId}?lang=${currentLang}`)
                .then(response => response.ok ? response.json() : Promise.reject(response))
                .then(data => {
                    if (data.error) {
                        console.error('Error fetching question:', data.error);
                        if (data.error === "Question not found") getResults();
                    } else {
                        displayQuestion(data);
                    }
                })
                .catch(() => getResults());
        }, 300);
    }

    function selectAnswer(answerId, questionId, nextQuestionId) {
        userAnswers[questionId] = answerId;
        
        if (nextQuestionId && nextQuestionId !== 'null' && nextQuestionId !== '') {
            currentQuestionId = parseInt(nextQuestionId, 10);
            fetchQuestion(currentQuestionId);
        } else {
            getResults();
        }
    }

    function getResults() {
        if (quizContent) quizContent.classList.add('fade-out');
        setTimeout(() => {
            fetch('/results', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers: userAnswers, lang: currentLang })
            })
            .then(response => response.json())
            .then(data => displayResults(data.recommendations))
            .catch(error => console.error('Error getting results:', error));
        }, 300);
    }

    // --- Renderowanie widoków ---
    function displayQuestion(data) {
        if (!questionText || !answersContainer) return;

        questionText.textContent = data.question_text;
        
        if (data.icon_url && questionIcon) {
            questionIcon.src = data.icon_url;
            questionIcon.style.display = 'inline';
        } else if (questionIcon) {
            questionIcon.style.display = 'none';
        }

        answersContainer.innerHTML = '';
        data.answers.forEach(answer => {
            const answerBtn = document.createElement('button');
            answerBtn.className = 'answer-btn';
            
            const answerContent = document.createElement('div');
            answerContent.className = 'answer-content';

            const answerText = document.createElement('span');
            answerText.className = 'answer-text';
            answerText.textContent = answer.answer_text;
            answerContent.appendChild(answerText);

            if (answer.icon_url && answer.icon_url.endsWith('.svg')) {
                const iconContainer = document.createElement('div');
                iconContainer.className = 'icon-container';

                fetch(answer.icon_url)
                    .then(response => response.text())
                    .then(svgText => {
                        iconContainer.innerHTML = svgText;
                        const svgElement = iconContainer.querySelector('svg');
                        if (svgElement) svgElement.classList.add('answer-icon');
                    });
                
                answerContent.appendChild(iconContainer);
            }

            answerBtn.appendChild(answerContent);
            answerBtn.addEventListener('click', () => selectAnswer(answer.answer_id, data.question_id, answer.next_question_id));
            answersContainer.appendChild(answerBtn);
        });

        if(backBtn) backBtn.style.display = history.length > 1 ? 'block' : 'none';
        if(quizContainer) quizContainer.style.display = 'block';
        if(resultsContainer) resultsContainer.style.display = 'none';
        if(quizContent) quizContent.classList.remove('fade-out');
    }

    function displayResults(recommendations) {
        if (!quizContainer || !resultsContainer) return;
        quizContainer.style.display = 'none';
        resultsContainer.innerHTML = '';

        const title = document.createElement('h2');
        title.textContent = window.translations?.recommendations_title || 'Our Recommendations';
        resultsContainer.appendChild(title);
        
        if (recommendations && recommendations.length > 0) {
            const resultsList = document.createElement('ul');
            recommendations.forEach(rec => {
                const listItem = document.createElement('li');
                let linksHTML = Object.entries(rec.links || {}).map(([store, url]) => 
                    `<a href="${url}" target="_blank" class="product-link">${store}</a>`
                ).join('');

                listItem.innerHTML = `
                    <img src="${rec.image_url || 'static/images/default.jpg'}" alt="${rec.product_name}" class="product-image">
                    <div class="product-details">
                        <h3>${rec.product_name}</h3>
                        <div class="product-links">${linksHTML}</div>
                    </div>`;
                resultsList.appendChild(listItem);
            });
            resultsContainer.appendChild(resultsList);
        } else {
            const noResultsText = document.createElement('p');
            noResultsText.textContent = window.translations?.no_recommendations || 'No recommendations found.';
            resultsContainer.appendChild(noResultsText);
        }

        resultsContainer.style.display = 'block';
        resultsContainer.classList.remove('fade-out');
    }

    // --- Uruchomienie aplikacji ---
    init();
});
