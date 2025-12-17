/**
 * @typedef {Object} Slide
 * @property {string} title Título do slide
 * @property {string} text Texto descritivo do slide
 * @property {string} img Caminho da imagem
 */

/**
 * @typedef {Object} Campaign
 * @property {string} id Identificador único da campanha
 * @property {string} title Título da campanha
 * @property {string} description Descrição da campanha
 * @property {string} icon Emoji/ícone da campanha
 */

/**
 * @typedef {Object} Event
 * @property {string} id Identificador único do evento
 * @property {string} date Data do evento (YYYY-MM-DD)
 * @property {string} time Horário do evento (HH:MM)
 * @property {string} title Título do evento
 * @property {string} location Localização do evento
 * @property {string} description Descrição do evento
 */

// Dados dos slides do carrossel
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

// Dados das campanhas
const campaigns = [
  {
    id: 'camp-1',
    title: 'Campanha Outubro Vermelho',
    description: 'Aumentar os estoques regionais com doações programadas.',
    icon: '🩸'
  },
  {
    id: 'camp-2',
    title: 'Unidades Móveis',
    description: 'Agende uma visita da nossa unidade móvel à sua comunidade.',
    icon: '🚐'
  },
  {
    id: 'camp-3',
    title: 'Campanha Universitária',
    description: 'Parcerias com universidades para doações durante o semestre.',
    icon: '🏫'
  }
];

// Dados dos eventos
const events = [
  {
    id: 'evt-1',
    date: '2025-06-12',
    time: '09:00',
    title: 'Coleta na Praça Central',
    location: 'Praça Central, Centro',
    description: 'Coleta aberta a toda população — venha doar e convidar amigos.'
  },
  {
    id: 'evt-2',
    date: '2025-07-02',
    time: '14:00',
    title: 'Campanha Empresarial',
    location: 'Empresa ABC, Av. Brasil, 1234',
    description: 'Coleta exclusiva para funcionários (inscrição prévia).'
  }
];

// Controle do slideshow
let currentSlide = 0;
let slideInterval = null;

/**
 * Renderiza os slides do carrossel na página
 * Cria elementos DOM para cada slide e os adiciona ao container
 */
function renderSlides() {
  const container = document.querySelector('.slideshow');
  if (!container) return;
  container.innerHTML = '';

  slides.forEach((slideData, index) => {
    const slide = document.createElement('div');
    slide.className = 'slide' + (index === 0 ? ' active' : '');

    const img = document.createElement('img');
    img.className = 'slide-image';
    img.src = slideData.img;
    img.alt = slideData.title;

    const content = document.createElement('div');
    content.className = 'slide-content';
    content.innerHTML = `<h3>${slideData.title}</h3><p>${slideData.text}</p>`;

    slide.appendChild(img);
    slide.appendChild(content);
    container.appendChild(slide);
  });

  renderDots();
}

/**
 * Renderiza os pontos de navegação (dots) do carrossel
 * Cria um ponto clicável para cada slide
 */
function renderDots() {
  const dotsWrapper = document.querySelector('.slide-dots');
  if (!dotsWrapper) return;
  dotsWrapper.innerHTML = '';

  slides.forEach((_, index) => {
    const dot = document.createElement('span');
    dot.className = 'dot' + (index === 0 ? ' active' : '');
    dot.addEventListener('click', () => goToSlide(index));
    dotsWrapper.appendChild(dot);
  });
}

/**
 * Exibe um slide específico baseado no índice
 * @param {number} index Índice do slide a ser exibido
 */
function showSlide(index) {
  const allSlides = document.querySelectorAll('.slide');
  allSlides.forEach((element, i) => {
    element.classList.toggle('active', i === index);
  });
  const dots = document.querySelectorAll('.dot');
  dots.forEach((element, i) => element.classList.toggle('active', i === index));
  currentSlide = index;
}

/**
 * Avança para o próximo slide do carrossel
 */
function nextSlide() {
  const next = (currentSlide + 1) % slides.length;
  showSlide(next);
}

/**
 * Retorna para o slide anterior do carrossel
 */
function prevSlide() {
  const previous = (currentSlide - 1 + slides.length) % slides.length;
  showSlide(previous);
}

/**
 * Navega para um slide específico
 * Para o autoplay, navega para o slide e reinicia o autoplay
 * @param {number} index Índice do slide desejado
 */
function goToSlide(index) {
  stopAutoSlide();
  showSlide(index);
  startAutoSlide();
}

/**
 * Inicia a reprodução automática dos slides
 * Avança automaticamente a cada 5 segundos
 */
function startAutoSlide() {
  if (slideInterval) clearInterval(slideInterval);
  slideInterval = setInterval(nextSlide, 5000);
}

/**
 * Para a reprodução automática dos slides
 */
function stopAutoSlide() {
  if (slideInterval) clearInterval(slideInterval);
  slideInterval = null;
}

/**
 * Renderiza os cards de campanhas na página
 * Cria elementos DOM para cada campanha e adiciona event listeners aos botões
 */
function renderCampaigns() {
  const container = document.querySelector('.campaigns-grid');
  if (!container) return;
  container.innerHTML = '';

  campaigns.forEach(campaign => {
    const card = document.createElement('div');
    card.className = 'campaign-card';
    card.innerHTML = `
      <div class="campaign-icon">${campaign.icon}</div>
      <div class="campaign-body">
        <h3>${campaign.title}</h3>
        <p>${campaign.description}</p>
        <button class="campaign-btn" data-id="${campaign.id}">Ver Mais</button>
      </div>
    `;

    container.appendChild(card);
  });

  // Adiciona handlers para abrir modals ao clicar nos botões
  container.querySelectorAll('.campaign-btn').forEach(button => {
    button.addEventListener('click', (event) => {
      const id = event.currentTarget.dataset.id;
      const item = campaigns.find(campaign => campaign.id === id);
      openModal(item.title, `<p>${item.description}</p>`);
    });
  });
}

/**
 * Renderiza os cards de eventos na página
 * Cria elementos DOM para cada evento e adiciona event listeners aos botões
 */
function renderEvents() {
  const container = document.querySelector('.events-grid');
  if (!container) return;
  container.innerHTML = '';

  events.forEach(event => {
    const card = document.createElement('div');
    card.className = 'event-card';
    card.innerHTML = `
      <div class="event-header">
        <div class="event-date">${event.date}</div>
        <div class="event-time">${event.time}</div>
      </div>
      <div class="event-body">
        <h3>${event.title}</h3>
        <div class="event-location">📍 ${event.location}</div>
        <p>${event.description}</p>
        <button class="event-btn" data-id="${event.id}">Ver Mais</button>
      </div>
    `;

    container.appendChild(card);
  });

  // Adiciona handlers para abrir modals ao clicar nos botões
  container.querySelectorAll('.event-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      const item = events.find(event => event.id === id);
      openModal(item.title, `<p><strong>Data:</strong> ${item.date} ${item.time}</p><p>${item.description}</p><p><strong>Local:</strong> ${item.location}</p>`);
    });
  });
}

/**
 * Abre um modal com título e conteúdo personalizados
 * @param {string} title Título do modal
 * @param {string} bodyHtml Conteúdo HTML do corpo do modal
 */
function openModal(title, bodyHtml) {
  const modal = document.querySelector('.modal');
  if (!modal) return;
  modal.classList.add('active');
  modal.querySelector('#modal-title').textContent = title;
  modal.querySelector('#modal-body').innerHTML = bodyHtml;
}

/**
 * Fecha o modal ativo
 */
function closeModal() {
  const modal = document.querySelector('.modal');
  if (!modal) return;
  modal.classList.remove('active');
}

/**
 * Configura os event listeners para o modal
 * Permite fechar o modal pelo botão X ou clicando fora dele
 */
function attachModalHandlers() {
  const modal = document.querySelector('.modal');
  if (!modal) return;
  modal.querySelector('.modal-close').addEventListener('click', closeModal);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });
}

/**
 * Inicializa a página de assistência
 * Renderiza todos os componentes e configura event listeners
 */
function initAssistenciaPage() {
  renderSlides();
  renderCampaigns();
  renderEvents();
  attachModalHandlers();
  startAutoSlide();

  // Configura botões de navegação do carrossel
  const nextButton = document.querySelector('.next');
  const prevButton = document.querySelector('.prev');
  if (nextButton) nextButton.addEventListener('click', () => { stopAutoSlide(); nextSlide(); startAutoSlide(); });
  if (prevButton) prevButton.addEventListener('click', () => { stopAutoSlide(); prevSlide(); startAutoSlide(); });
}

// Inicializa a página quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAssistenciaPage);
} else {
  initAssistenciaPage();
}