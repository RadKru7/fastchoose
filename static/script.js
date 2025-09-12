// FastChoose — SVG inline, pełna kontrola rozmiarów/kolorów w CSS
document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('get-started-btn');
  const langSelect = document.getElementById('lang-select');

  const mainContent = document.getElementById('main-content');
  const quizContainer = document.getElementById('quiz-container');
  const quizContent = document.getElementById('quiz-content');

  const resultsContainer = document.getElementById('results-container');
  const resultsWrapper = document.getElementById('results-content-wrapper');

  // State
  let currentQuestionId = 1;
  let pathAnswers = [];
  let history = [];
  let currentLang = (langSelect && langSelect.value) ? langSelect.value : 'pl';

  // Cache for fetched SVGs
  const svgCache = new Map();

  // Refs populated per-screen
  let questionTextEl = null;
  let questionIconWrap = null;
  let answersContainerEl = null;
  let backBtnEl = null;

  // Fetch SVG as inline element (cache-enabled)
  async function fetchInlineSvg(url) {
    if (!url || !url.endsWith('.svg')) return null;
    try {
      if (!svgCache.has(url)) {
        const res = await fetch(url, { cache: 'force-cache' });
        if (!res.ok) throw new Error(`Failed to fetch ${url}`);
        const text = await res.text();
        svgCache.set(url, text);
      }
      const wrapper = document.createElement('div');
      wrapper.innerHTML = svgCache.get(url);
      const svg = wrapper.querySelector('svg');
      return svg || null;
    } catch (e) {
      console.warn('SVG inline error:', url, e);
      return null;
    }
  }

  // Make SVG follow currentColor and CSS sizing
  function normalizeSvg(svgEl) {
    if (!svgEl) return;

    // Remove inline styles for fill/stroke
    const nodes = svgEl.querySelectorAll('*');
    nodes.forEach(n => {
      // Clean style attribute
      const style = n.getAttribute('style') || '';
      if (style) {
        const cleaned = style
          .replace(/fill\s*:\s*[^;]+;?/gi, '')
          .replace(/stroke\s*:\s*[^;]+;?/gi, '');
        if (cleaned.trim()) n.setAttribute('style', cleaned);
        else n.removeAttribute('style');
      }
      // Normalize attributes (preserve fill='none')
      if (n.hasAttribute('fill')) {
        const v = (n.getAttribute('fill') || '').toLowerCase();
        if (v !== 'none') n.setAttribute('fill', 'currentColor');
      }
      if (n.hasAttribute('stroke')) {
        const v = (n.getAttribute('stroke') || '').toLowerCase();
        if (v !== 'none') n.setAttribute('stroke', 'currentColor');
      }
      // Optional: cleanup color attributes not needed
      if (n.hasAttribute('color')) n.removeAttribute('color');
    });

    // Remove hard width/height to allow CSS control
    svgEl.removeAttribute('width');
    svgEl.removeAttribute('height');
    // Inherit color from parent
    svgEl.style.color = 'inherit';
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
    .then(r => r.ok ? r.json() : Promise.reject(r))
    .then(d => displayResults(d.recommendations || []))
    .catch(err => {
      console.error('Error getting results:', err);
      showError(currentLang === 'pl' ? 'Nie udało się pobrać wyników.' : 'Failed to load results.');
    });
  }

  function fetchQuestion(questionId, noHistoryPush = false) {
    if (!noHistoryPush) history.push(currentQuestionId);

    fetch(`/api/quiz/question?current_question_id=${encodeURIComponent(questionId)}&language=${encodeURIComponent(currentLang)}`)
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then(d => displayQuestion(d))
      .catch(err => {
        console.error('Error fetching question:', err);
        showError(currentLang === 'pl' ? 'Nie udało się pobrać pytania.' : 'Failed to load question.');
      });
  }

  async function displayQuestion(data) {
    if (!questionTextEl || !answersContainerEl || !questionIconWrap) return;

    // Question text
    questionTextEl.textContent = data.question_text || '';

    // Question icon (inline SVG, CSS-sized)
    questionIconWrap.innerHTML = '';
    if (data.question_icon_url && data.question_icon_url.endsWith('.svg')) {
      const svgQ = await fetchInlineSvg(data.question_icon_url);
      if (svgQ) {
        normalizeSvg(svgQ);
        // Wrap in a container that has size via CSS
        const holder = document.createElement('div');
        holder.className = 'answer-icon'; // reuse sizing; or you can style .question-icon svg via CSS
        holder.appendChild(svgQ);
        questionIconWrap.appendChild(holder);
        questionIconWrap.style.display = 'inline-flex';
      } else {
        questionIconWrap.style.display = 'none';
      }
    } else {
      questionIconWrap.style.display = 'none';
    }

    // Answers: icon + visible label
    answersContainerEl.innerHTML = '';
    const answers = Array.isArray(data.answers) ? data.answers : [];
    for (const ans of answers) {
      const card = document.createElement('button');
      card.className = 'answer-card';
      card.type = 'button';
      const label = ans.answer_text || 'answer';
      card.setAttribute('aria-label', label);
      card.setAttribute('title', label);

      // Icon (inline SVG)
      const iconWrap = document.createElement('div');
      iconWrap.className = 'answer-icon';

      if (ans.icon_url && ans.icon_url.endsWith('.svg')) {
        const svg = await fetchInlineSvg(ans.icon_url);
        if (svg) {
          normalizeSvg(svg);
          iconWrap.appendChild(svg);
        }
      }
      card.appendChild(iconWrap);

      // Label
      const title = document.createElement('div');
      title.className = 'answer-title';
      title.textContent = label;
      card.appendChild(title);

      card.addEventListener('click', () => handleAnswer(ans));
      answersContainerEl.appendChild(card);
    }

    if (backBtnEl) backBtnEl.style.display = history.length > 0 ? 'block' : 'none';

    resultsContainer.style.display = 'none';
    quizContainer.style.display = 'flex';
  }

  function handleAnswer(answer) {
    if (typeof answer.answer_id !== 'undefined') pathAnswers.push(answer.answer_id);

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

  function showError(msg) { alert(msg); }

  if (startBtn) startBtn.addEventListener('click', startQuiz);
  if (langSelect) langSelect.addEventListener('change', handleLanguageChange);
});
