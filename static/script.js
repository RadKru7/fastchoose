// FastChoose — inline SVG z MONO-kolorem: fill/stroke ustawiane rozsądnie

// --- Multicolor headline obsługa ---
function updateFastchooseHeadline(lang) {
  const texts = {
    pl: { main: "Fastchoose - Twój idealny telefon, ", accent: "w kilka sekund!" },
    en: { main: "Fastchoose - Your ideal phone, ", accent: "in seconds!" },
    es: { main: "Fastchoose - Tu teléfono ideal, ", accent: "¡en segundos!" }
  };
  const t = texts[lang] || texts.pl;
  const headline = document.getElementById('fastchoose-headline');
  if (headline) {
    headline.style.display = '';
    headline.querySelector('.headline-main').textContent = t.main;
    headline.querySelector('.headline-accent').textContent = t.accent;
  }
}

// --- Teksty strony głównej, tłumaczenia ---
const landingDict = {
  pl: {
    title: "Wybierz idealny telefon w kilka sekund!",
    subtitle: "Odpowiedz na kilka pytań, a my dobierzemy model spełniający Twoje potrzeby.",
    btn: "Zaczynamy!",
    logo: "FastChoose"
  },
  en: {
    title: "Find your perfect phone in seconds!",
    subtitle: "Answer a few questions and we’ll recommend the right model for you.",
    btn: "Get started",
    logo: "FastChoose"
  },
  es: {
    title: "¡Encuentra tu teléfono ideal en segundos!",
    subtitle: "Responde unas preguntas y te recomendaremos el modelo perfecto.",
    btn: "¡Vamos!",
    logo: "FastChoose"
  }
};

// --- O nas i Kontakt tłumaczenia ---
const aboutDict = {
  pl: {
    title: "O nas",
    text: "FastChoose to strona stworzona po to, byś w kilka sekund znalazł idealny smartfon dla siebie. Nasze narzędzie pozwala zaoszczędzić Twój czas — nie musisz już przeglądać setek ofert i modeli. Po prostu odpowiedz na kilka pytań i gotowe!"
  },
  en: {
    title: "About us",
    text: "FastChoose is a website created to help you find your perfect smartphone in just a few seconds. Our tool saves your time — no more browsing through hundreds of offers and models. Simply answer a few questions and that’s it!"
  },
  es: {
    title: "Sobre nosotros",
    text: "FastChoose es una página creada para ayudarte a encontrar tu smartphone ideal en cuestión de segundos. Nuestra herramienta ahorra tu tiempo: no necesitas revisar cientos de ofertas y modelos. ¡Solo responde unas preguntas y listo!"
  }
};

const contactDict = {
  pl: {
    title: "Kontakt",
    text: "FastChoose<br>Email: <a href='mailto:contact@fastchoose.com'>contact@fastchoose.com</a>"
  },
  en: {
    title: "Contact",
    text: "FastChoose<br>Email: <a href='mailto:contact@fastchoose.com'>contact@fastchoose.com</a>"
  },
  es: {
    title: "Contacto",
    text: "FastChoose<br>Email: <a href='mailto:contact@fastchoose.com'>contact@fastchoose.com</a>"
  }
};

// --- Quiz obsługa historii quizu przez hash ---
// Główne zmienne quizu
let currentQuestionId = 1;
let pathAnswers = [];
let history = [];
let currentLang = "pl";
let totalQuestions = 5;

let questionTextEl = null;
let questionIconWrap = null;
let answersContainerEl = null;
let backBtnEl = null;
let quizProgressCounter = null;

// Pomocnicza: pobierz aktualny język z selecta
function getCurrentLang() {
  const langSelect = document.getElementById('lang-select');
  return (langSelect && langSelect.value) ? langSelect.value : 'pl';
}

function renderQuizShell() {
  const quizContent = document.getElementById('quiz-content');
  quizContent.innerHTML = `
    <div class="quiz-progress-counter" id="quiz-progress-counter" style="display:none;">1/5</div>
    <div class="question-header">
      <div id="question-icon" class="question-icon" aria-hidden="true"></div>
      <div id="question-text" class="question-text"></div>
    </div>
    <div id="answers-container" class="answers-grid"></div>
    <div class="back-row">
      <button id="back-btn" class="back-icon-btn" style="display:none;" aria-label=""></button>
    </div>
  `;
  questionTextEl = document.getElementById('question-text');
  questionIconWrap = document.getElementById('question-icon');
  answersContainerEl = document.getElementById('answers-container');
  backBtnEl = document.getElementById('back-btn');
  quizProgressCounter = document.getElementById('quiz-progress-counter');

  if (backBtnEl) {
    backBtnEl.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M15 18l-6-6 6-6" />
      </svg>
      <span class="sr-only">${backAriaLabel()}</span>
    `;
    backBtnEl.setAttribute('aria-label', backAriaLabel());
    backBtnEl.addEventListener('click', function() {
      window.history.back(); // Poprzedni hash = poprzednie pytanie
    });
  }
}

function backAriaLabel() {
  return currentLang === 'pl' ? 'Wstecz' :
         currentLang === 'es' ? 'Atrás' : 'Back';
}

function startQuiz() {
  currentQuestionId = 1;
  pathAnswers = [];
  history = [];
  currentLang = getCurrentLang();
  renderQuizShell();
  setQuizHash(currentQuestionId);
  showQuizSection();
  // fetchQuestion(currentQuestionId, true); // USUNIĘTE: nie fetchuj tutaj, hashchange to zrobi
}

function setQuizHash(qId) {
  window.location.hash = "#quiz-" + qId;
}

function handleAnswer(answer) {
  if (typeof answer.answer_id !== 'undefined') pathAnswers.push(answer.answer_id);
  // LIMIT PYTAŃ: jeśli mamy już 5, kończymy quiz
  if (pathAnswers.length >= 5) {
    window.location.hash = "#results";
    getResults();
    return;
  }
  const nextId = answer.next_question_id;
  if (nextId === '' || nextId === null || typeof nextId === 'undefined') {
    window.location.hash = "#results";
    getResults();
  } else {
    currentQuestionId = parseInt(nextId, 10);
    setQuizHash(currentQuestionId);  // zmiana hasha wywoła event hashchange → showQuizQuestionById()
    // NIE fetchuj bezpośrednio pytania tutaj!
  }
}

function fetchQuestion(questionId, noHistoryPush = false) {
  if (!noHistoryPush) history.push(currentQuestionId);
  fetch(`/api/quiz/question?current_question_id=${encodeURIComponent(questionId)}&language=${encodeURIComponent(currentLang)}`)
    .then(r => r.ok ? r.json() : Promise.reject(r))
    .then(d => displayQuestion(d))
    .catch(err => {
      console.error('Error fetching question:', err);
      alert(currentLang === 'pl' ? 'Nie udało się pobrać pytania.' :
        currentLang === 'es' ? 'No se pudo cargar la pregunta.' :
        'Failed to load question.');
    });
}

async function displayQuestion(data) {
  if (!questionTextEl || !answersContainerEl || !questionIconWrap || !backBtnEl) return;
  let qIndex = data.question_number || (history.length + 1);
  let qTotal = data.total_questions || totalQuestions;
  totalQuestions = qTotal;
  if (quizProgressCounter) {
    quizProgressCounter.textContent = `${qIndex}/${qTotal}`;
    quizProgressCounter.style.display = "block";
  }
  questionTextEl.textContent = data.question_text || '';
  questionIconWrap.innerHTML = '';
  if (data.question_icon_url && data.question_icon_url.endsWith('.svg')) {
    const svgQ = await fetchInlineSvg(data.question_icon_url);
    if (svgQ) {
      normalizeSvg(svgQ);
      questionIconWrap.appendChild(svgQ);
      questionIconWrap.style.display = 'inline-flex';
    } else {
      questionIconWrap.style.display = 'none';
    }
  } else {
    questionIconWrap.style.display = 'none';
  }
  answersContainerEl.innerHTML = '';
  const answers = Array.isArray(data.answers) ? data.answers : [];
  for (const ans of answers) {
    const card = document.createElement('button');
    card.className = 'answer-card';
    card.type = 'button';
    const label = ans.answer_text || 'answer';
    card.setAttribute('aria-label', label);
    card.setAttribute('title', label);
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
    const title = document.createElement('div');
    title.className = 'answer-title';
    title.textContent = label;
    card.appendChild(title);
    card.addEventListener('click', () => handleAnswer(ans));
    answersContainerEl.appendChild(card);
  }
  backBtnEl.style.display = history.length > 0 ? 'inline-flex' : 'none';
  backBtnEl.setAttribute('aria-label', backAriaLabel());
  document.getElementById('results-container').style.display = 'none';
  document.getElementById('quiz-content').style.display = 'block';
  if (document.getElementById('quiz-container')) document.getElementById('quiz-container').style.display = 'flex';
}

function showQuizQuestionById(id) {
  // nie resetujemy historii! tylko wyświetl pytanie
  currentQuestionId = id;
  renderQuizShell();
  showQuizSection();
  fetchQuestion(currentQuestionId, true);
}

function showQuizSection() {
  document.getElementById('main-content').style.display = 'none';
  document.getElementById('quiz-section-bg').style.display = 'flex';
  document.getElementById('quiz-content').style.display = 'flex';
  document.getElementById('results-container').style.display = 'none';
  if (document.getElementById('quiz-container')) document.getElementById('quiz-container').style.display = 'flex';
  const headline = document.getElementById('fastchoose-headline');
  if (headline) headline.style.display = '';
  updateFastchooseHeadline(currentLang);
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
    alert(currentLang === 'pl' ? 'Nie udało się pobrać wyników.' :
      currentLang === 'es' ? 'No se pudieron obtener los resultados.' :
      'Failed to load results.');
  });
}

function displayResults(recommendations) {
  document.getElementById('main-content').style.display = 'none';
  document.getElementById('quiz-section-bg').style.display = 'flex';
  document.getElementById('quiz-content').style.display = 'none';
  if (document.getElementById('quiz-container')) document.getElementById('quiz-container').style.display = 'none';
  const resultsContainer = document.getElementById('results-container');
  resultsContainer.style.display = 'flex';
  const resultsWrapper = document.getElementById('results-content-wrapper');
  resultsWrapper.innerHTML = '';
  updateFastchooseHeadline(currentLang);
  const dict = {
    pl: 'Nasze rekomendacje',
    en: 'Our Recommendations',
    es: 'Nuestras recomendaciones'
  };
  const title = document.createElement('div');
  title.className = 'results-title';
  title.textContent = dict[currentLang] || dict.pl;
  resultsWrapper.appendChild(title);
  if (!recommendations.length) {
    const p = document.createElement('p');
    p.textContent = currentLang === 'pl' ? 'Brak rekomendacji dla wybranej ścieżki.' :
      currentLang === 'es' ? 'No hay recomendaciones para el camino seleccionado.' :
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
  const dictBtn = {
    pl: 'Zacznij od nowa',
    en: 'Restart',
    es: 'Empezar de nuevo'
  };
  const restart = document.createElement('button');
  restart.className = 'restart-btn';
  restart.textContent = dictBtn[currentLang] || dictBtn.pl;
  restart.addEventListener('click', resetApp);
  resultsWrapper.appendChild(restart);
}

function resetApp() {
  window.location.hash = "#home";
  currentQuestionId = 1;
  pathAnswers = [];
  history = [];
  document.getElementById('results-container').style.display = 'none';
  document.getElementById('quiz-content').style.display = 'none';
  document.getElementById('quiz-section-bg').style.display = 'none';
  if (document.getElementById('quiz-container')) document.getElementById('quiz-container').style.display = 'flex';
  document.getElementById('main-content').style.display = 'flex';
  const headline = document.getElementById('fastchoose-headline');
  if (headline) headline.style.display = 'none';
}

// --- SVG cache i obsługa ---
const svgCache = new Map();
async function fetchInlineSvg(url) {
  if (!url || !url.endsWith('.svg')) return null;
  try {
    if (!svgCache.has(url)) {
      const res = await fetch(url, { cache: 'force-cache' });
      if (!res.ok) throw new Error(`Failed to fetch ${url}`);
      const text = await res.text();
      svgCache.set(url, text);
    }
    const wrap = document.createElement('div');
    wrap.innerHTML = svgCache.get(url);
    return wrap.querySelector('svg');
  } catch (e) {
    console.warn('SVG inline error:', url, e);
    return null;
  }
}
function normalizeSvg(svgEl) {
  if (!svgEl) return;
  svgEl.removeAttribute('width');
  svgEl.removeAttribute('height');
  svgEl.style.color = 'inherit';
  const nodes = svgEl.querySelectorAll('*');
  nodes.forEach(n => {
    const tag = n.tagName.toLowerCase();
    const style = n.getAttribute('style') || '';
    if (style) {
      const cleaned = style
        .replace(/fill\s*:\s*[^;]+;?/gi, '')
        .replace(/stroke\s*:\s*[^;]+;?/gi, '')
        .replace(/color\s*:\s*[^;]+;?/gi, '');
      if (cleaned.trim()) n.setAttribute('style', cleaned);
      else n.removeAttribute('style');
    }
    if (n.hasAttribute('color')) n.removeAttribute('color');
    const hadStroke = n.hasAttribute('stroke');
    const hadFill = n.hasAttribute('fill');
    const fillVal = (n.getAttribute('fill') || '').trim().toLowerCase();
    if (tag === 'text') {
      n.setAttribute('fill', 'currentColor');
      n.removeAttribute('stroke');
      return;
    }
    if (hadStroke) n.setAttribute('stroke', 'currentColor');
    if (hadFill) {
      if (fillVal !== 'none') {
        n.setAttribute('fill', 'currentColor');
      }
    } else if (hadStroke) {
      n.setAttribute('fill', 'none');
    }
  });
}

// --- O nas/Kontakt ---
function showAboutPage(lang) {
  const dict = aboutDict[lang] || aboutDict.pl;
  const container = document.getElementById('main-content');
  if (container) {
    container.innerHTML = `
      <section id="about-page">
        <h1>${dict.title}</h1>
        <div>${dict.text}</div>
      </section>
    `;
    container.style.display = 'flex';
    document.getElementById('quiz-section-bg').style.display = 'none';
    document.getElementById('results-container').style.display = 'none';
    document.getElementById('quiz-content').style.display = 'none';
    if (document.getElementById('quiz-container')) document.getElementById('quiz-container').style.display = 'none';
    const headline = document.getElementById('fastchoose-headline');
    if (headline) headline.style.display = '';
  }
}
function showContactPage(lang) {
  const dict = contactDict[lang] || contactDict.pl;
  const container = document.getElementById('main-content');
  if (container) {
    container.innerHTML = `
      <section id="contact-page">
        <h1>${dict.title}</h1>
        <div>${dict.text}</div>
      </section>
    `;
    container.style.display = 'flex';
    document.getElementById('quiz-section-bg').style.display = 'none';
    document.getElementById('results-container').style.display = 'none';
    document.getElementById('quiz-content').style.display = 'none';
    if (document.getElementById('quiz-container')) document.getElementById('quiz-container').style.display = 'none';
    const headline = document.getElementById('fastchoose-headline');
    if (headline) headline.style.display = '';
  }
}

// --- Landing texts, footer ---
function updateLandingTexts(lang) {
  const dict = landingDict[lang] || landingDict.pl;
  document.getElementById('big-title').textContent = dict.title;
  document.getElementById('subtitle').textContent = dict.subtitle;
  document.getElementById('get-started-btn').textContent = dict.btn;
  document.getElementById('logo').textContent = dict.logo;
}
function renderFooterLinks(lang) {
  const dict = {
    pl: { about: "O nas", contact: "Kontakt" },
    en: { about: "About", contact: "Contact" },
    es: { about: "Acerca de", contact: "Contacto" }
  };
  lang = lang in dict ? lang : "pl";
  const footerLinks = document.getElementById('footer-links');
  if (!footerLinks) return;
  footerLinks.innerHTML = `
    <a href="#about" id="about-link">${dict[lang].about}</a>
    <a href="#contact" id="contact-link">${dict[lang].contact}</a>
  `;
}

// --- Cookie consent wielojęzyczny ---
function getCookieContent(lang) {
  const dict = {
    pl: {
      message: "Ta strona korzysta z plików cookies w celach statystycznych. Możesz zapoznać się z polityką prywatności przechodząc do niej przez link w stopce strony.",
      dismiss: "OK"
    },
    en: {
      message: "This site uses cookies for statistical purposes. You can read our privacy policy by following the link in the footer of the site.",
      dismiss: "OK"
    },
    es: {
      message: "Este sitio utiliza cookies con fines estadísticos. Puedes consultar la política de privacidad utilizando el enlace en el pie de página del sitio.",
      dismiss: "OK"
    }
  };
  return dict[lang] || dict.en;
}

function showCookieConsentBar(lang) {
  if (window.cookieconsent) {
    window.cookieconsent.initialise({
      "palette": {
        "popup": { "background": "#000" },
        "button": { "background": "#f1d600" }
      },
      "content": getCookieContent(lang)
    });
  }
}

// Obsługa inicjalizacji po wybraniu języka (i tylko raz)
let cookieBannerInitialized = false;
function initCookieConsentOnce(lang) {
  if (!cookieBannerInitialized && window.cookieconsent) {
    showCookieConsentBar(lang);
    cookieBannerInitialized = true;
  }
}

// --- Hash routing logika ---
function showViewByHash() {
  const hash = window.location.hash;
  currentLang = getCurrentLang();
  if (hash.startsWith("#quiz-")) {
    const qid = parseInt(hash.replace("#quiz-", ""), 10);
    if (!isNaN(qid)) showQuizQuestionById(qid);
    return;
  }
  if (hash === "#results") {
    displayResults([]);
    return;
  }
  if (hash === "#about") {
    showAboutPage(currentLang);
    return;
  }
  if (hash === "#contact") {
    showContactPage(currentLang);
    return;
  }
  // domyślnie home
  document.getElementById('main-content').style.display = 'flex';
  document.getElementById('quiz-section-bg').style.display = 'none';
  document.getElementById('results-container').style.display = 'none';
  if (document.getElementById('quiz-container')) document.getElementById('quiz-container').style.display = 'flex';
  const headline = document.getElementById('fastchoose-headline');
  if (headline) headline.style.display = 'none';
}

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
  // Inicjalizacja języka
  currentLang = getCurrentLang();
  updateLandingTexts(currentLang);
  renderFooterLinks(currentLang);
  const headline = document.getElementById('fastchoose-headline');
  if (headline) headline.style.display = 'none';

  // Przycisk start quizu
  document.getElementById('get-started-btn').addEventListener('click', startQuiz);

  // Zmiana języka
  document.getElementById('lang-select').addEventListener('change', function() {
    currentLang = this.value;
    updateLandingTexts(currentLang);
    renderFooterLinks(currentLang);
    updateFastchooseHeadline(currentLang);

    // --- Cookie consent: odśwież na nowy język ---
    const cc = document.querySelector('.cc-window');
    if (cc) cc.parentNode.removeChild(cc);
    showCookieConsentBar(currentLang);
  });

  // Routing
  window.addEventListener("hashchange", showViewByHash);
  showViewByHash();

  // --- Cookie consent init ---
  window.addEventListener("load", function() {
    let lang = getCurrentLang();
    initCookieConsentOnce(lang);
  });
});
