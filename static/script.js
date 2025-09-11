document.addEventListener('DOMContentLoaded', function () {
  // Elementy z index.html
  const startBtn = document.getElementById('get-started-btn');
  const langSelect = document.getElementById('lang-select');

  const mainContent = document.getElementById('main-content');
  const quizContainer = document.getElementById('quiz-container');
  const quizContent = document.getElementById('quiz-content');

  const resultsContainer = document.getElementById('results-container');
  const resultsWrapper = document.getElementById('results-content-wrapper');

  // Stan
  let currentQuestionId = 1;
  let pathAnswers = [];
  let history = [];
  let currentLang = (langSelect && langSelect.value) ? langSelect.value : 'pl';

  // Referencje do dynamicznie wstrzykiwanych elementów quizu
  let questionTextEl = null;
  let questionIconEl = null;
  let answersContainerEl = null;
  let backBtnEl = null;

  function renderQuizShell() {
    quizContent.innerHTML = `
      <div class="question-header">
        <img id="question-icon" class="question-icon" alt="" style="display:none;">
        <div id="question-text" class="question-text"></div>
      </div>
      <div id="answers-container" class="answers-grid"></div>
      <button id="back-btn" style="display:none;">${currentLang === 'pl' ? 'Wstecz' : (currentLang === 'es' ? 'Atrás' : 'Back')}</button>
    `;

    questionTextEl = document.getElementById('question-text');
    questionIconEl = document.getElementById('question-icon');
    answersContainerEl = document.getElementById('answers-container');
    backBtnEl = document.getElementById('back-btn');

    if (backBtnEl) backBtnEl.addEventListener('click', goBack);
  }

  function startQuiz() {
    mainContent.style.display = 'none';
    resultsContainer.style.display = 'none';
    quizContainer.style.display = 'flex';

    currentQuestionId = 1;
    pathAnswers = [];
    history = [];

    renderQuizShell();
    fetchQuestion(currentQuestionId, true);
  }

  function handleLanguageChange() {
    currentLang = this.value;
    if (quizContainer && quizContainer.style.display !== 'none' && questionTextEl) {
      fetchQuestion(currentQuestionId, true);
    }
  }

  function fetchQuestion(questionId, noHistoryPush = false) {
    if (!noHistoryPush) {
      history.push(currentQuestionId);
    }

    fetch(`/api/quiz/question?current_question_id=${encodeURIComponent(questionId)}&language=${encodeURIComponent(currentLang)}`)
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => displayQuestion(data))
      .catch(err => {
        console.error('Error fetching question:', err);
        showError(currentLang === 'pl' ? 'Nie udało się pobrać pytania.' : 'Failed to load question.');
      });
  }

  function displayQuestion(data) {
    if (!questionTextEl || !answersContainerEl) return;

    // Tekst pytania
    questionTextEl.textContent = data.question_text || '';

    // Ikona pytania
    if (data.question_icon_url) {
      questionIconEl.src = data.question_icon_url;
      questionIconEl.style.display = 'inline';
    } else {
      questionIconEl.style.display = 'none';
    }

    // Odpowiedzi w postaci kart
    answersContainerEl.innerHTML = '';

    (data.answers || []).forEach(ans => {
      const card = document.createElement('button');
      card.className = 'answer-card';
      card.type = 'button';
      card.setAttribute('aria-label', ans.answer_text || 'answer');

      // Ikona
      if (ans.icon_url) {
        const img = document.createElement('img');
        img.className = 'answer-icon';
        img.src = ans.icon_url;
        img.alt = '';
        card.appendChild(img);
      }

      // Tekst
      const title = document.createElement('div');
      title.className = 'answer-title';
      title.textContent = ans.answer_text || '';
      card.appendChild(title);

      card.addEventListener('click', () => handleAnswer(ans));
      answersContainerEl.appendChild(card);
    });

    if (backBtnEl) backBtnEl.style.display = history.length > 0 ? 'block' : 'none';

    resultsContainer.style.display = 'none';
    quizContainer.style.display = 'flex';
  }

  function handleAnswer(answer) {
    if (typeof answer.answer_id !== 'undefined') {
      pathAnswers.push(answer.answer_id);
    }

    const nextId = answer.next_question_id;
    if (nextId === '' || nextId === null || typeof nextId === 'undefined') {
      getResults();
    } else {
      currentQuestionId = parseInt(nextId, 10);
      fetchQuestion(currentQuestionId, false);
    }
  }

  function goBack() {
    if (history.length > 0) {
      const prevId = history.pop();
      if (pathAnswers.length > 0) pathAnswers.pop();
      currentQuestionId = prevId;
      fetchQuestion(currentQuestionId, true);
    }
  }

  function getResults() {
    fetch('/api/quiz/result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pathAnswers, language: currentLang })
    })
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => displayResults(data.recommendations || []))
      .catch(err => {
        console.error('Error getting results:', err);
        showError(currentLang === 'pl' ? 'Nie udało się pobrać wyników.' : 'Failed to load results.');
      });
  }

  function displayResults(recommendations) {
    quizContainer.style.display = 'none';
    resultsContainer.style.display = 'flex';

    resultsWrapper.innerHTML = '';

    const title = document.createElement('div');
    title.className = 'results-title';
    title.textContent = currentLang === 'pl'
      ? 'Nasze rekomendacje'
      : (currentLang === 'es' ? 'Nuestras recomendaciones' : 'Our Recommendations');
    resultsWrapper.appendChild(title);

    if (!recommendations.length) {
      const p = document.createElement('p');
      p.textContent = currentLang === 'pl'
        ? 'Brak rekomendacji dla wybranej ścieżki.'
        : 'No recommendations for the selected path.';
      resultsWrapper.appendChild(p);
    } else {
      const grid = document.createElement('div');
      grid.className = 'recommendations-grid';

      recommendations.forEach(rec => {
        const card = document.createElement('div');
        card.className = 'recommendation-card';

        const img = document.createElement('img');
        img.className = 'recommendation-image';
        img.src = rec.image_url || '';
        img.alt = rec.product_name || '';
        card.appendChild(img);

        const name = document.createElement('div');
        name.className = 'recommendation-name';
        name.textContent = rec.product_name || '';
        card.appendChild(name);

        const linksWrap = document.createElement('div');
        linksWrap.className = 'store-links-container';

        (rec.links || []).forEach(link => {
          const a = document.createElement('a');
          a.className = 'store-link';
          a.href = link.link_url || '#';
          a.target = '_blank';
          a.rel = 'noopener';
          a.textContent = link.store_name || 'Store';
          linksWrap.appendChild(a);
        });

        card.appendChild(linksWrap);
        grid.appendChild(card);
      });

      resultsWrapper.appendChild(grid);
    }

    const restart = document.createElement('button');
    restart.className = 'restart-btn';
    restart.textContent = currentLang === 'pl' ? 'Zacznij od nowa' : (currentLang === 'es' ? 'Empezar de nuevo' : 'Restart');
    restart.addEventListener('click', resetApp);
    resultsWrapper.appendChild(restart);
  }

  function resetApp() {
    currentQuestionId = 1;
    pathAnswers = [];
    history = [];

    resultsContainer.style.display = 'none';
    quizContainer.style.display = 'none';
    mainContent.style.display = 'flex';
  }

  function showError(msg) {
    alert(msg);
  }

  if (startBtn) startBtn.addEventListener('click', startQuiz);
  if (langSelect) langSelect.addEventListener('change', handleLanguageChange);
});
