document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('main-content');
    const quizContainer = document.getElementById('quiz-container');
    const resultsContainer = document.getElementById('results-container');
    const quizContent = document.getElementById('quiz-content');
    const resultsContentWrapper = document.getElementById('results-content-wrapper');

    const startBtn = document.getElementById('get-started-btn');
    const langSelect = document.getElementById('lang-select');

    let currentQuestionId = 1;
    let pathAnswers = [];
    let language = langSelect.value || 'pl';

    const translations = {
        pl: {
            welcomeTitle: "Wybierz szybciej, żyj wygodniej!",
            welcomeSubtitle: "FastChoose pomaga podejmować decyzje, wybierać szybko i trafnie!<br>Aktywuj poniższy przycisk i rozpocznij serię pytań.",
            startButton: "Rozpocznij",
            aboutLink: "O nas",
            contactLink: "Kontakt",
            footerText: "&copy; 2025 FastChoose. Wszelkie prawa zastrzeżone.",
            resultsTitle: "Oto Twoje rekomendacje:",
            restartButton: "Rozpocznij od nowa",
            noResults: "Niestety, nie znaleziono pasujących rekomendacji. Spróbuj ponownie z innymi odpowiedziami.",
            fetchError: "Wystąpił błąd podczas pobierania danych. Spróbuj ponownie później.",
            buyButton: "Kup w"
        },
        en: {
            welcomeTitle: "Choose faster, live more comfortably!",
            welcomeSubtitle: "FastChoose helps you make decisions, choose quickly and accurately!<br>Activate the button below and start a series of questions.",
            startButton: "Get Started",
            aboutLink: "About",
            contactLink: "Contact",
            footerText: "&copy; 2025 FastChoose. All rights reserved.",
            resultsTitle: "Here are your recommendations:",
            restartButton: "Start over",
            noResults: "Unfortunately, no matching recommendations were found. Please try again with different answers.",
            fetchError: "An error occurred while fetching data. Please try again later.",
            buyButton: "Buy at"
        },
        es: {
            welcomeTitle: "¡Elige más rápido, vive más cómodamente!",
            welcomeSubtitle: "¡FastChoose te ayuda a tomar decisiones, a elegir de forma rápida y precisa!<br>Activa el botón de abajo y comienza una serie de preguntas.",
            startButton: "Empezar",
            aboutLink: "Sobre nosotros",
            contactLink: "Contacto",
            footerText: "&copy; 2025 FastChoose. Todos los derechos reservados.",
            resultsTitle: "Aquí están tus recomendaciones:",
            restartButton: "Empezar de nuevo",
            noResults: "Lamentablemente, no se encontraron recomendaciones. Por favor, inténtalo de nuevo con otras respuestas.",
            fetchError: "Ocurrió un error al obtener los datos. Por favor, inténtalo de nuevo más tarde.",
            buyButton: "Comprar en"
        }
    };
    
    function updateUIText(lang) {
        document.querySelector('.big-title').innerHTML = translations[lang].welcomeTitle;
        document.querySelector('.subtitle').innerHTML = translations[lang].welcomeSubtitle;
        document.getElementById('get-started-btn').textContent = translations[lang].startButton;
        document.querySelector('.footer-links a[href="/about"]').textContent = translations[lang].aboutLink;
        document.querySelector('.footer-links a[href="/contact"]').textContent = translations[lang].contactLink;
        const footer = document.querySelector('footer');
        const footerLinks = footer.querySelector('.footer-links').outerHTML;
        footer.innerHTML = footerLinks + translations[lang].footerText;
    }

    langSelect.addEventListener('change', (e) => {
        language = e.target.value;
        updateUIText(language);
    });
    
    startBtn.addEventListener('click', () => {
        mainContent.style.display = 'none';
        quizContainer.style.display = 'flex';
        resultsContainer.style.display = 'none';
        pathAnswers = [];
        currentQuestionId = 1;
        fetchQuestion(currentQuestionId);
    });

    function fetchQuestion(questionId) {
        if (!questionId) {
            console.error('Invalid question ID:', questionId);
            return;
        }

        fetch(`/api/quiz/question?current_question_id=${questionId}&language=${language}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    quizContent.innerHTML = `<p>${translations[language].fetchError}</p>`;
                } else {
                    displayQuestion(data);
                }
            })
            .catch(error => {
                console.error('Fetch Error:', error);
                quizContent.innerHTML = `<p>${translations[language].fetchError}</p>`;
            });
    }

    function displayQuestion(data) {
        quizContent.innerHTML = '';
        
        const questionHeader = document.createElement('div');
        questionHeader.className = 'question-header';

        if (data.question_icon_url) {
            const icon = document.createElement('img');
            icon.src = data.question_icon_url;
            icon.className = 'question-icon';
            icon.alt = 'Question Icon';
            questionHeader.appendChild(icon);
        }

        const questionText = document.createElement('h3');
        questionText.className = 'question-text';
        questionText.textContent = data.question_text;
        questionHeader.appendChild(questionText);
        
        quizContent.appendChild(questionHeader);

        data.answers.forEach(answer => {
            const button = document.createElement('button');
            button.className = 'answer-btn';
            button.dataset.answerId = answer.answer_id;
            button.dataset.nextId = answer.next_question_id;

            const answerContent = document.createElement('div');
            answerContent.className = 'answer-content';
            
            // 1. Dodaj tekst jako pierwszy
            const text = document.createElement('span');
            text.className = 'answer-text';
            text.textContent = answer.answer_text;
            answerContent.appendChild(text);

            // 2. Dodaj ikonę jako drugą (teraz jako <img>)
            if (answer.icon_url) {
                const icon = document.createElement('img');
                icon.src = answer.icon_url;
                icon.className = 'answer-icon';
                icon.alt = ''; // Alt text jest pusty, bo ikona jest dekoracyjna
                answerContent.appendChild(icon);
            }

            button.appendChild(answerContent);
            quizContent.appendChild(button);
        });
    }
    
    function getResults() {
        fetch('/api/quiz/result', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pathAnswers: pathAnswers, language: language }),
        })
        .then(response => response.json())
        .then(data => {
            quizContainer.style.display = 'none';
            resultsContainer.style.display = 'flex';
            displayResults(data);
        })
        .catch(error => {
            console.error('Fetch Error:', error);
            resultsContentWrapper.innerHTML = `<p>${translations[language].fetchError}</p>`;
        });
    }

    function displayResults(data) {
        resultsContentWrapper.innerHTML = '';

        const title = document.createElement('h2');
        title.className = 'results-title';
        title.textContent = translations[language].resultsTitle;
        resultsContentWrapper.appendChild(title);

        if (data.recommendations && data.recommendations.length > 0) {
            const grid = document.createElement('div');
            grid.className = 'recommendations-grid';

            data.recommendations.forEach(rec => {
                const card = document.createElement('div');
                card.className = 'recommendation-card';

                const image = document.createElement('img');
                image.src = rec.image_url;
                image.alt = rec.product_name;
                image.className = 'recommendation-image';

                const name = document.createElement('h3');
                name.className = 'recommendation-name';
                name.textContent = rec.product_name;
                
                const linksContainer = document.createElement('div');
                linksContainer.className = 'store-links-container';

                rec.links.forEach(link => {
                    const storeLink = document.createElement('a');
                    storeLink.href = link.link_url;
                    storeLink.textContent = `${translations[language].buyButton} ${link.store_name}`;
                    storeLink.className = 'store-link';
                    storeLink.target = '_blank';
                    linksContainer.appendChild(storeLink);
                });

                card.appendChild(image);
                card.appendChild(name);
                card.appendChild(linksContainer);
                grid.appendChild(card);
            });
            resultsContentWrapper.appendChild(grid);
        } else {
            const noResultsText = document.createElement('p');
            noResultsText.textContent = translations[language].noResults;
            resultsContentWrapper.appendChild(noResultsText);
        }

        const restartButton = document.createElement('button');
        restartButton.className = 'restart-btn';
        restartButton.textContent = translations[language].restartButton;
        restartButton.addEventListener('click', () => {
            location.reload();
        });
        resultsContentWrapper.appendChild(restartButton);
    }
    
    quizContent.addEventListener('click', (e) => {
        const button = e.target.closest('.answer-btn');
        if (button) {
            handleAnswer(button);
        }
    });

    function handleAnswer(button) {
        const answerId = parseInt(button.dataset.answerId, 10);
        const nextQuestionId = button.dataset.nextId;

        pathAnswers.push(answerId);

        if (nextQuestionId && nextQuestionId !== '') {
            currentQuestionId = parseInt(nextQuestionId, 10);
            fetchQuestion(currentQuestionId);
        } else {
            getResults();
        }
    }
    
    updateUIText(language);
});
