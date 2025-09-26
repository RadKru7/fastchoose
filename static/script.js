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
    text: "FastChoose to strona stworzona po to, byś w kilka sekund znalazł idealny smartfon dla siebie. Nasze narzędzie pozwala zaoszczędzić Twój czas — nie musisz już przeglądać setek ofert i modeli. Wystarczy odpowiedzieć na kilka prostych pytań, a my wskażemy najlepsze propozycje dopasowane do Twoich potrzeb.<br><br>Grafiki telefonów na stronie mają charakter poglądowy i mogą nie odzwierciedlać rzeczywistego wyglądu konkretnych modeli.<br><br>FastChoose jest miejscem, które łączy nowoczesność, wygodę i rzetelność. Cieszymy się, że tu jesteś — mamy nadzieję, że nasza strona spełni Twoje oczekiwania i sprawi, że poszukiwanie telefonu stanie się proste i przyjemne!"
  },
  en: {
    title: "About us",
    text: "FastChoose is a website created to help you find your perfect smartphone in just a few seconds. Our tool saves your time — no more browsing through hundreds of offers and models. Simply answer a few quick questions and we'll recommend the best options tailored to your needs.<br><br>The phone images on our website are for illustrative purposes only and may not represent the actual appearance of the models.<br><br>FastChoose combines modern solutions, convenience, and reliability. We're glad you're here — we hope our site meets your expectations and makes searching for a new phone easy and enjoyable!"
  },
  es: {
    title: "Sobre nosotros",
    text: "FastChoose es una página creada para ayudarte a encontrar tu smartphone ideal en cuestión de segundos. Nuestra herramienta ahorra tu tiempo: no necesitas revisar cientos de ofertas y modelos. Solo responde unas pocas preguntas y te mostraremos las mejores opciones adaptadas a tus necesidades.<br><br>Las imágenes de teléfonos en nuestra web son solo ilustrativas y pueden no reflejar el aspecto real de los modelos.<br><br>FastChoose combina modernidad, comodidad y confianza. ¡Nos alegra que estés aquí! Esperamos que nuestra web cumpla tus expectativas y que buscar un teléfono sea fácil y agradable."
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

// --- Funkcje renderujące O nas i Kontakt ---
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
    if (document.getElementById('quiz-section-bg')) document.getElementById('quiz-section-bg').style.display = 'none';
    if (document.getElementById('results-container')) document.getElementById('results-container').style.display = 'none';
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
    if (document.getElementById('quiz-section-bg')) document.getElementById('quiz-section-bg').style.display = 'none';
    if (document.getElementById('results-container')) document.getElementById('results-container').style.display = 'none';
    if (document.getElementById('quiz-container')) document.getElementById('quiz-container').style.display = 'none';
    const headline = document.getElementById('fastchoose-headline');
    if (headline) headline.style.display = '';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('get-started-btn');
  const langSelect = document.getElementById('lang-select');
  const mainContent = document.getElementById('main-content');
  const quizSectionBg = document.getElementById('quiz-section-bg');
  const quizContent = document.getElementById('quiz-content');
  const resultsContainer = document.getElementById('results-container');
  const resultsWrapper = document.getElementById('results-content-wrapper');
  const footerLinks = document.getElementById('footer-links');
  const logo = document.getElementById('logo');

  // Dynamiczna zmiana tekstów strony startowej
  function updateLandingTexts(lang) {
    const dict = landingDict[lang] || landingDict.pl;
    document.getElementById('big-title').textContent = dict.title;
    document.getElementById('subtitle').textContent = dict.subtitle;
    startBtn.textContent = dict.btn;
    logo.textContent = dict.logo;
  }

  // Stopka About/Contact tłumaczenia
  function renderFooterLinks(lang) {
    const dict = {
      pl: { about: "O nas", contact: "Kontakt" },
      en: { about: "About", contact: "Contact" },
      es: { about: "Acerca de", contact: "Contacto" }
    };
    lang = lang in dict ? lang : "pl";
    if (!footerLinks) return;
    footerLinks.innerHTML = `
      <a href="#" id="about-link">${dict[lang].about}</a>
      <a href="#" id="contact-link">${dict[lang].contact}</a>
    `;
    // Ponownie podpinamy eventy po aktualizacji innerHTML
    const aboutLink = document.getElementById('about-link');
    const contactLink = document.getElementById('contact-link');
    let currentLang = (langSelect && langSelect.value) ? langSelect.value : 'pl';
    if (aboutLink) aboutLink.addEventListener('click', (e) => { e.preventDefault(); showAboutPage(currentLang); });
    if (contactLink) contactLink.addEventListener('click', (e) => { e.preventDefault(); showContactPage(currentLang); });
  }

  // --- Logo kolor jak pytanie ---
  function updateLogoColor() {
    if (logo) logo.style.color = "var(--brand-dark)";
  }

  // --- Ikona języka kolor brand-dark ---
  const langIcon = document.querySelector('.lang-icon');
  function updateLangIconColor() {
    if (!langIcon) return;
    if (langIcon.tagName.toLowerCase() === 'img') return;
    langIcon.querySelectorAll('*').forEach(el => {
      el.setAttribute('stroke', getComputedStyle(document.documentElement).getPropertyValue('--brand-dark').trim() || "#4D7D80");
    });
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

  // --- Quiz obsługa ---
  let currentQuestionId = 1;
  let pathAnswers = [];
  let history = [];
  let currentLang = (langSelect && langSelect.value) ? langSelect.value : 'pl';
  let totalQuestions = 5;

  let questionTextEl = null;
  let questionIconWrap = null;
  let answersContainerEl = null;
  let backBtnEl = null;
  let quizProgressCounter = null;

  function backAriaLabel() {
    return currentLang === 'pl' ? 'Wstecz' :
           currentLang === 'es' ? 'Atrás' : 'Back';
  }

  function renderQuizShell() {
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
      backBtnEl.addEventListener('click', goBack);
    }
  }

  function startQuiz() {
    mainContent.style.display = 'none';
    resultsContainer.style.display = 'none';
    if (quizSectionBg) quizSectionBg.style.display = 'flex';
    updateFastchooseHeadline(currentLang);
    document.getElementById('quiz-container').style.display = 'flex';
    currentQuestionId = 1;
    pathAnswers = [];
    history = [];
    renderQuizShell();
    fetchQuestion(currentQuestionId, true);
  }

  function handleLanguageChange() {
    currentLang = this.value;
    updateLandingTexts(currentLang);
    renderFooterLinks(currentLang);
    updateLogoColor();
    updateLangIconColor();
    updateFastchooseHeadline(currentLang);
    if (quizSectionBg && quizSectionBg.style.display !== 'none') {
      renderQuizShell();
      fetchQuestion(currentQuestionId, true);
    }
    if (mainContent && mainContent.innerHTML.includes('id="about-page"')) {
      showAboutPage(currentLang);
    } else if (mainContent && mainContent.innerHTML.includes('id="contact-page"')) {
      showContactPage(currentLang);
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
      alert(currentLang === 'pl' ? 'Nie udało się pobrać wyników.' :
        currentLang === 'es' ? 'No se pudieron obtener los resultados.' :
        'Failed to load results.');
    });
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
    resultsContainer.style.display = 'none';
    quizContent.style.display = 'block';
  }

 // --- LIMIT 5 PYTAŃ: zmodyfikowana funkcja handleAnswer ---
  function handleAnswer(answer) {
    if (typeof answer.answer_id !== 'undefined') pathAnswers.push(answer.answer_id);
    // LIMIT PYTAŃ: jeśli mamy już 5, kończymy quiz
    if (pathAnswers.length >= 5) {
      getResults();
      return;
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
    // USUŃ nadmiarowy div, żeby nie robił luki
    const mainContent = document.getElementById('quiz-container');
    if (mainContent) {
      mainContent.remove();
    }
    quizContent.style.display = 'none';
    resultsContainer.style.display = 'flex';
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
    currentQuestionId = 1;
    pathAnswers = [];
    history = [];
    resultsContainer.style.display = 'none';
    quizContent.style.display = 'none';
    if (quizSectionBg) quizSectionBg.style.display = 'none';
    mainContent.style.display = 'flex';
    const headline = document.getElementById('fastchoose-headline');
    if (headline) headline.style.display = 'none';
  }

  // --- INIT ---
  if (startBtn) startBtn.addEventListener('click', startQuiz);
  if (langSelect) langSelect.addEventListener('change', handleLanguageChange);
  updateLandingTexts(currentLang);
  renderFooterLinks(currentLang);
  updateLogoColor();
  updateLangIconColor();
  const headline = document.getElementById('fastchoose-headline');
  if (headline) headline.style.display = 'none';

  // --- O nas/Kontakt obsługa linków (na wszelki wypadek po załadowaniu) ---
  setTimeout(() => {
    const aboutLink = document.getElementById('about-link');
    const contactLink = document.getElementById('contact-link');
    let currentLang = (langSelect && langSelect.value) ? langSelect.value : 'pl';
    if (aboutLink) aboutLink.addEventListener('click', (e) => { e.preventDefault(); showAboutPage(currentLang); });
    if (contactLink) contactLink.addEventListener('click', (e) => { e.preventDefault(); showContactPage(currentLang); });
  }, 100);
});
