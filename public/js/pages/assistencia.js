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

/** @type {Slide[]} */
let slides = [];

/** @type {Campaign[]} */
let campaigns = [];

/** @type {Event[]} */
let events = [];

/**
 * Busca os anúncios/slides da API
 * @returns {Promise<void>}
 */
async function fetchAnnouncements() {
  try {
    const response = await fetch('/api/assistance/announcements');
    if (!response.ok) throw new Error('Erro ao buscar anúncios');
    const data = await response.json();
    slides = data.map(item => ({
      title: item.title,
      text: item.text,
      img: `/api/assistance/announcements/${item.id}/image`
    }));
  } catch (error) {
    console.error('Erro ao carregar anúncios:', error);
    slides = [];
  }
}

/**
 * Busca as campanhas da API
 * @returns {Promise<void>}
 */
async function fetchCampaigns() {
  try {
    const response = await fetch('/api/assistance/campaigns');
    if (!response.ok) throw new Error('Erro ao buscar campanhas');
    const data = await response.json();
    campaigns = data.map(item => ({
      id: `camp-${item.id}`,
      title: item.title,
      description: item.description,
      icon: item.icon
    }));
  } catch (error) {
    console.error('Erro ao carregar campanhas:', error);
    campaigns = [];
  }
}

/**
 * Busca os eventos da API
 * @returns {Promise<void>}
 */
async function fetchEvents() {
  try {
    const response = await fetch('/api/assistance/events');
    if (!response.ok) throw new Error('Erro ao buscar eventos');
    const data = await response.json();
    events = data.map(item => {
      const datetime = new Date(item.datetime);
      const date = datetime.toISOString().split('T')[0];
      const time = datetime.toTimeString().slice(0, 5);
      const addressNumber = item.number || 'S/N';
      const location = `${item.street}, ${addressNumber}, ${item.neighborhood}, ${item.city} - ${item.state}`;
      return {
        id: `evt-${item.id}`,
        date,
        time,
        title: item.title,
        location,
        description: item.description
      };
    });
  } catch (error) {
    console.error('Erro ao carregar eventos:', error);
    events = [];
  }
}

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
 * Busca os dados da API e renderiza todos os componentes
 */
async function initAssistancePage() {
  // Busca os dados da API em paralelo
  await Promise.all([
    fetchAnnouncements(),
    fetchCampaigns(),
    fetchEvents()
  ]);

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
  document.addEventListener('DOMContentLoaded', initAssistancePage);
} else {
  initAssistancePage();
}