/* Data (placeholder) */
const slides = [
  {
    title: 'Doe sangue, salve vidas',
    text: 'Campanhas regulares em diversas unidades — veja como participar.',
    img: 'images/img1.jpg'
  },
  {
    title: 'Junte sua equipe',
    text: 'Empresas, escolas e clubes podem organizar coletas para doação.' ,
    img: 'images/img3.jpg'
  },
  {
    title: 'Voluntariado',
    text: 'Participe como voluntário e aprenda a ajudar nos eventos locais.',
    img: 'images/img2.jpg'
  }
];

const campaigns = [
  {
    id: 'camp-1',
    title: 'Campanha Outubro Vermelho',
    desc: 'Aumentar os estoques regionais com doações programadas.',
    icon: '🩸'
  },
  {
    id: 'camp-2',
    title: 'Unidades Móveis',
    desc: 'Agende uma visita da nossa unidade móvel à sua comunidade.',
    icon: '🚐'
  },
  {
    id: 'camp-3',
    title: 'Campanha Universitária',
    desc: 'Parcerias com universidades para doações durante o semestre.',
    icon: '🏫'
  }
];

const events = [
  {
    id: 'evt-1',
    date: '2025-06-12',
    time: '09:00',
    title: 'Coleta na Praça Central',
    location: 'Praça Central, Centro',
    desc: 'Coleta aberta a toda população — venha doar e convidar amigos.'
  },
  {
    id: 'evt-2',
    date: '2025-07-02',
    time: '14:00',
    title: 'Campanha Empresarial',
    location: 'Empresa ABC, Av. Brasil, 1234',
    desc: 'Coleta exclusiva para funcionários (inscrição prévia).'
  }
];

/* Slideshow logic */
let currentSlide = 0;
let slideInterval = null;

function renderSlides() {
  const container = document.querySelector('.slideshow');
  if (!container) return;
  container.innerHTML = '';

  slides.forEach((s, idx) => {
    const slide = document.createElement('div');
    slide.className = 'slide' + (idx === 0 ? ' active' : '');

    const img = document.createElement('img');
    img.className = 'slide-image';
    img.src = s.img;
    img.alt = s.title;

    const content = document.createElement('div');
    content.className = 'slide-content';
    content.innerHTML = `<h3>${s.title}</h3><p>${s.text}</p>`;

    slide.appendChild(img);
    slide.appendChild(content);
    container.appendChild(slide);
  });

  renderDots();
}

function renderDots() {
  const dotsWrap = document.querySelector('.slide-dots');
  if (!dotsWrap) return;
  dotsWrap.innerHTML = '';

  slides.forEach((_, idx) => {
    const d = document.createElement('span');
    d.className = 'dot' + (idx === 0 ? ' active' : '');
    d.addEventListener('click', () => goToSlide(idx));
    dotsWrap.appendChild(d);
  });
}

function showSlide(index) {
  const all = document.querySelectorAll('.slide');
  all.forEach((el, i) => {
    el.classList.toggle('active', i === index);
  });
  const dots = document.querySelectorAll('.dot');
  dots.forEach((el, i) => el.classList.toggle('active', i === index));
  currentSlide = index;
}

function nextSlide() {
  const next = (currentSlide + 1) % slides.length;
  showSlide(next);
}

function prevSlide() {
  const prev = (currentSlide - 1 + slides.length) % slides.length;
  showSlide(prev);
}

function goToSlide(idx) {
  stopAutoSlide();
  showSlide(idx);
  startAutoSlide();
}

function startAutoSlide() {
  if (slideInterval) clearInterval(slideInterval);
  slideInterval = setInterval(nextSlide, 5000);
}

function stopAutoSlide() {
  if (slideInterval) clearInterval(slideInterval);
  slideInterval = null;
}

/* Campaigns render */
function renderCampaigns() {
  const wrap = document.querySelector('.campaigns-grid');
  if (!wrap) return;
  wrap.innerHTML = '';

  campaigns.forEach(c => {
    const card = document.createElement('div');
    card.className = 'campaign-card';
    card.innerHTML = `
      <div class="campaign-icon">${c.icon}</div>
      <div class="campaign-body">
        <h3>${c.title}</h3>
        <p>${c.desc}</p>
        <button class="campaign-btn" data-id="${c.id}">Ver Mais</button>
      </div>
    `;

    wrap.appendChild(card);
  });

  // attach modal handlers
  wrap.querySelectorAll('.campaign-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      const item = campaigns.find(x => x.id === id);
      openModal(item.title, `<p>${item.desc}</p>`);
    });
  });
}

/* Events render */
function renderEvents() {
  const wrap = document.querySelector('.events-grid');
  if (!wrap) return;
  wrap.innerHTML = '';

  events.forEach(ev => {
    const card = document.createElement('div');
    card.className = 'event-card';
    card.innerHTML = `
      <div class="event-header">
        <div class="event-date">${ev.date}</div>
        <div class="event-time">${ev.time}</div>
      </div>
      <div class="event-body">
        <h3>${ev.title}</h3>
        <div class="event-location">📍 ${ev.location}</div>
        <p>${ev.desc}</p>
        <button class="event-btn" data-id="${ev.id}">Ver Mais</button>
      </div>
    `;

    wrap.appendChild(card);
  });

  wrap.querySelectorAll('.event-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      const item = events.find(x => x.id === id);
      openModal(item.title, `<p><strong>Data:</strong> ${item.date} ${item.time}</p><p>${item.desc}</p><p><strong>Local:</strong> ${item.location}</p>`);
    });
  });
}

/* Modal */
function openModal(title, bodyHtml) {
  const modal = document.querySelector('.modal');
  if (!modal) return;
  modal.classList.add('active');
  modal.querySelector('#modal-title').textContent = title;
  modal.querySelector('#modal-body').innerHTML = bodyHtml;
}

function closeModal() {
  const modal = document.querySelector('.modal');
  if (!modal) return;
  modal.classList.remove('active');
}

function attachModalHandlers() {
  const modal = document.querySelector('.modal');
  if (!modal) return;
  modal.querySelector('.modal-close').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}

/* Wire everything */
function initAssistenciaPage() {
  renderSlides();
  renderCampaigns();
  renderEvents();
  attachModalHandlers();
  startAutoSlide();

  // next/prev
  const next = document.querySelector('.next');
  const prev = document.querySelector('.prev');
  if (next) next.addEventListener('click', () => { stopAutoSlide(); nextSlide(); startAutoSlide(); });
  if (prev) prev.addEventListener('click', () => { stopAutoSlide(); prevSlide(); startAutoSlide(); });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAssistenciaPage);
} else {
  initAssistenciaPage();
}