// FastChoose — frontend (tylko SVG, ikony inline, odpowiedzi jako same ikony)
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

  // Cache na pobrane SVG (url -> string SVG)
  const svgCache = new Map();

  // Referencje do dynamicznie wstrzykiwanych elementów quizu
  let questionTextEl = null;
  let questionIconWrap = null;
  let answersContainerEl = null;
  let backBtnEl = null;

  // Pomocnicze: pobierz i zwróć element SVG (inline) z cache
  async function fetchInlineSvg(url) {
    if (!url || !url.endsWith('.svg')) return null;
    try {
      if (!svgCache.has(url)) {
        const res = await fetch(url, { cache: 'force-cache' });
        if (!res.ok) throw new Error('SVG fetch failed');
        const svgText = await res.text();
        svgCache.set(url, svgText);
      }
      const wrapper = document.createElement('div');
      wrapper.innerHTML = svgCache.get(url);
      const svgEl = wrapper.querySelector('svg');
      if (!svgEl) return null;
      return svgEl;
    } catch (e) {
      console.warn('Failed to inline SVG:', url, e);
      return null;
    }
  }

  function setBackButtonLabel() {
    if (!backBtnEl) return;
    backBtnEl.textContent =
      currentLang === 'pl' ? 'Wstecz' :
      currentLang === 'es' ? 'Atrás' : 'Back';
  }

  function renderQuizShell() {
    quizContent.innerHTML = `
      <div class="question-header">
        <div id="question-icon" class="question-icon" aria-hidden="true"></div>
        <div id="question-text" class="question-text"></div>
      </div>
      <div id="answers-container" class="answers-grid"></div>
      <button id="back-btn" style="display:none;"></button>
    `;

    questionTextEl = document.getElementById('question-text');
    questionIconWrap = document.getElementById('question-icon');
    answersContainerEl = document.getElementById('answers-container');
    backBtnEl = document.getElementById('back-btn');

    setBackButtonLabel();
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
    // Jeśli jesteśmy w quizie, odśwież skorupę (dla etykiety "Wstecz") i pytanie
    if (quizContainer && quizContainer.style.display !== 'none') {
      renderQuizShell();
      fetchQuestion(currentQuestionId, true);
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

  async function displayQuestion(data) {
    if (!questionTextEl || !answersContainerEl || !questionIconWrap) return;

    // Tekst pytania
    questionTextEl.textContent = data.question_text || '';

    // Ikona pytania (tylko SVG inline)
    questionIconWrap.innerHTML = '';
    if (data.question_icon_url && data.question_icon_url.endsWith('.svg')) {
      const svgEl = await fetchInlineSvg(data.question_icon_url);
      if (svgEl) {
        svgEl.classList.add('answer-icon'); // wykorzystaj istniejące reguły (rozmiar), jeśli masz
        // Dopasowanie do kontenera 40x40 — jeśli potrzebujesz, możesz dodać style bezpośrednio:
        svgEl.setAttribute('width', '40');
        svgEl.setAttribute('height', '40');
        svgEl.setAttribute('aria-hidden', 'true');
        questionIconWrap.appendChild(svgEl);
        questionIconWrap.style.display = 'inline-flex';
      } else {
        questionIconWrap.style.display = 'none';
      }
    } else {
      questionIconWrap.style.display = 'none';
    }

    // Odpowiedzi: wyłącznie ikony SVG (bez tekstu widocznego)
    answersContainerEl.innerHTML = '';

    // Tworzymy karty jako button, z aria-label i title = ans.answer_text
    // aby zachować dostępność i podpowiedź hover
    const answers = Array.isArray(data.answers) ? data.answers : [];
    for (const ans of answers) {
      const card = document.createElement('button');
      card.className = 'answer-card';
      card.type = 'button';
      const label = ans.answer_text || 'answer';
      card.setAttribute('aria-label', label);
      card.setAttribute('title', label);

      if (ans.icon_url && ans.icon_url.endsWith('.svg')) {
        const svgEl = await fetchInlineSvg(ans.icon_url);
        if (svgEl) {
          svgEl.classList.add('answer-icon');
          // Ustal spójny rozmiar ikon odpowiedzi (możesz dopasować do swojego CSS)
          svgEl.setAttribute('width', '28');
          svgEl.setAttribute('height', '28');
          card.appendChild(svgEl);
        }
      }
      // Brak tekstu widocznego — tylko ikona

      card.addEventListener('click', () => handleAnswer(ans));
      answersContainerEl.appendChild(card);
    }

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

  function displayResults(recommendations) {
    quizContainer.style.display = 'none';
    resultsContainer.style.display = 'flex';

    resultsWrapper.innerHTML = '';

    const title = document.createElement('div');
    title.className = 'results-title';
    title.textContent =
      currentLang === 'pl' ? 'Nasze rekomendacje' :
      currentLang === 'es' ? 'Nuestras recomendaciones' : 'Our Recommendations';
    resultsWrapper.appendChild(title);

    if (!recommendations.length) {
      const p = document.createElement('p');
      p.textContent =
        currentLang === 'pl' ? 'Brak rekomendacji dla wybranej ścieżki.' :
        'No recommendations for the selected path.';
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
    restart.textContent =
      currentLang === 'pl' ? 'Zacznij od nowa' :
      currentLang === 'es' ? 'Empezar de nuevo' : 'Restart';
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
