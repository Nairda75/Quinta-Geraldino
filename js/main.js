// Quinta do Geraldino — comportamentos base do site

document.addEventListener('DOMContentLoaded', () => {
  // Menu mobile
  const toggle = document.querySelector('.nav-toggle');
  const body = document.body;

  if (toggle) {
    toggle.addEventListener('click', () => {
      const isOpen = body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    document.querySelectorAll('.main-nav a').forEach(link => {
      link.addEventListener('click', () => body.classList.remove('nav-open'));
    });
  }

  // Formulário de contacto
  // NOTA: este formulário ainda não envia para nenhum email/serviço.
  // Sugestão simples (grátis) para o Netlify: adicionar o atributo
  // `data-netlify="true"` na tag <form> em contacto.html e o Netlify
  // passa a receber os envios automaticamente (ver README.md).
  const form = document.querySelector('#contact-form');
  const status = document.querySelector('#form-status');

  if (form && status) {
    form.addEventListener('submit', (event) => {
      // Se o formulário estiver configurado para o Netlify Forms,
      // deixamos o comportamento nativo do browser tratar do envio
      // e não bloqueamos com preventDefault().
      if (form.hasAttribute('data-netlify')) return;

      event.preventDefault();
      status.dataset.state = 'success';
      status.textContent = 'Obrigado pelo seu contacto. Recebemos o seu pedido e entraremos em contacto consigo brevemente.';
      form.reset();
    });
  }
});
