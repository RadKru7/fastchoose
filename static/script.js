document.addEventListener('DOMContentLoaded', function () {
    const startBtn = document.getElementById('get-started-btn');
    const langSelect = document.getElementById('lang-select');
    const startPage = document.getElementById('start-page');
    const quizContainer = document.getElementById('quiz-container');
    const questionText = document.getElementById('question-text');
    const questionIcon = document.getElementById('question-icon');
    const answersContainer = document.getElementById('answers-container');
    const resultsContainer = document.getElementById('results-container');
    const backBtn = document.getElementById('back-btn');

    let currentQuestionId = 1;
    let userAnswers = {};
    let history = [];
    let currentLang = 'pl';

    if (startBtn) {
        startBtn.addEventListener('click', function() {
            startPage.style.display = 'none';
            quizContainer.style.display = 'block';
            loadLanguage(currentLang, () => fetchQuestion(currentQuestionId));
        });
    }

    if (langSelect) {
        langSelect.addEventListener('change', function() {
            currentLang = this.value;
            if (quizContainer.style.display === 'block') {
                loadLanguage(currentLang, () => fetchQuestion(currentQuestionId));
            }
        });
    }

    if (backBtn) {
        backBtn.addEventListener('click', function() {
            if (history.length > 0) {
                const lastState = history.pop();
                currentQuestionId = lastState.questionId;
                userAnswers = lastState.answers;
                fetchQuestion(currentQuestionId, true);
            }
        });
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

    function fetchQuestion(questionId, isBack = false) {
        if (!isBack) {
            history.push({ questionId: currentQuestionId, answers: { ...userAnswers } });
        }

        fetch(`/question/${questionId}?lang=${currentLang}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.error) {
                    console.error('Error fetching question:', data.error);
                    if (data.error === "Question not found") {
                        getResults();
                    }
                } else {
                    displayQuestion(data);
                }
            })
            .catch(error => {
                console.error('There has been a problem with your fetch operation:', error);
                getResults();
            });
    }

    function displayQuestion(data) {
        questionText.textContent = data.question_text;
        
        if (data.icon_url) {
            questionIcon.src = data.icon_url;
            questionIcon.style.display = 'inline';
        } else {
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

            if (answer.icon_url) {
                const iconContainer = document.createElement('div');
                iconContainer.className = 'icon-container';

                fetch(answer.icon_url)
                    .then(response => response.text())
                    .then(svgText => {
                        iconContainer.innerHTML = svgText;
                        if (iconContainer.querySelector('svg')) {
                            iconContainer.querySelector('svg').classList.add('answer-icon');
                        }
                    });
                
                answerContent.appendChild(iconContainer);
            }

            answerBtn.appendChild(answerContent);
            answerBtn.addEventListener('click', () => selectAnswer(answer.answer_id, data.question_id, answer.next_question_id));
            answersContainer.appendChild(answerBtn);
        });

        backBtn.style.display = history.length > 1 ? 'block' : 'none';
        quizContainer.style.display = 'block';
        resultsContainer.style.display = 'none';
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
        fetch('/results', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ answers: userAnswers, lang: currentLang })
        })
        .then(response => response.json())
        .then(data => {
            displayResults(data.recommendations);
        })
        .catch(error => console.error('Error getting results:', error));
    }

    function displayResults(recommendations) {
        quizContainer.style.display = 'none';
        resultsContainer.innerHTML = `<h2>${window.translations.recommendations_title || 'Our Recommendations For You'}:</h2>`;
        
        if (recommendations && recommendations.length > 0) {
            const resultsList = document.createElement('ul');
            recommendations.forEach(rec => {
                const listItem = document.createElement('li');
                
                let linksHTML = '';
                if (rec.links) {
                    for (const [store, url] of Object.entries(rec.links)) {
                        linksHTML += `<a href="${url}" target="_blank">${store}</a>`;
                    }
                }

                listItem.innerHTML = `
                    <img src="${rec.image_url || 'static/images/default.jpg'}" alt="${rec.product_name}" class="product-image">
                    <div class="product-details">
                        <h3>${rec.product_name}</h3>
                        <div class="product-links">${linksHTML}</div>
                    </div>
                `;
                resultsList.appendChild(listItem);
            });
            resultsContainer.appendChild(resultsList);
        } else {
            resultsContainer.innerHTML += `<p>${window.translations.no_recommendations || 'No specific recommendations found based on your answers.'}</p>`;
        }

        resultsContainer.style.display = 'block';
    }

    if (startPage) {
        loadLanguage(currentLang);
    }
});
