/* =========================================================
   CASA QD 101 — RECANTO DAS EMAS
   Main JS · UTM + WhatsApp + Lightbox + Reveal + Pixel
   ========================================================= */

(function () {
  'use strict';

  // ======================================================
  // SCROLL FIX MOBILE — força a página SEMPRE começar no topo
  // (iOS Safari e Chrome Android às vezes restauram scroll de sessões
  //  anteriores, especialmente com hero que tem margin-top negativo)
  // ======================================================
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  // Garante scroll em 0 antes da página pintar
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  // Backup: força de novo no load e depois
  window.addEventListener('DOMContentLoaded', function () {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  });
  window.addEventListener('load', function () {
    setTimeout(function () {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 0);
    // Mais um backup 100ms depois (iOS às vezes restaura scroll depois do load)
    setTimeout(function () {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 100);
  });
  // pageshow: dispara quando o iOS restaura a página do bfcache (volta de outra aba/app)
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  });

  // ======================================================
  // HERO CAPTION SYNC — muda o caption junto com o slide ativo
  // ======================================================
  const heroCaptionLabel = document.getElementById('heroCaptionLabel');
  const heroCaptionSub = document.getElementById('heroCaptionSub');
  const heroCaptions = [
    { label: 'Sala de estar', sub: 'Painel ripado + home + sofá' },
    { label: 'Jantar integrado', sub: 'Mesa + espelho + sala ao fundo' },
    { label: 'Área integrada', sub: 'Estar · jantar · cozinha americana' },
    { label: 'Cozinha americana', sub: 'Planejada + iluminação natural' },
  ];
  if (heroCaptionLabel && heroCaptionSub && heroCaptions.length) {
    let heroIdx = 0;
    setInterval(() => {
      heroIdx = (heroIdx + 1) % heroCaptions.length;
      // pequeno fade
      heroCaptionLabel.style.opacity = '0';
      heroCaptionSub.style.opacity = '0';
      setTimeout(() => {
        heroCaptionLabel.textContent = heroCaptions[heroIdx].label;
        heroCaptionSub.textContent = heroCaptions[heroIdx].sub;
        heroCaptionLabel.style.opacity = '1';
        heroCaptionSub.style.opacity = '1';
      }, 250);
    }, 6000);
    // transições suaves no caption
    heroCaptionLabel.style.transition = 'opacity .25s ease';
    heroCaptionSub.style.transition = 'opacity .25s ease';
  }


  // ======================================================
  // CONFIG — ALTERE AQUI QUANDO TIVER OS DADOS DA SARA
  // ======================================================
  const CONFIG = {
    // Número do WhatsApp da Sara (DDD + número, sem espaços, sem +, sem parênteses)
    // Exemplo de Brasília: 5561988887777
    whatsappNumber: '55619XXXXXXXX',

    // Mensagem base que aparece pré-preenchida no WhatsApp
    baseMessage:
      'Olá Sara, vi o anúncio da casa da QD 101 no Recanto das Emas. Pode me passar mais informações?',
  };

  // ======================================================
  // BUILD WHATSAPP URL
  // ======================================================
  function buildWhatsappUrl(ctaSource) {
    const params = new URLSearchParams(window.location.search);
    const source = params.get('utm_source') || 'direto';
    const medium = params.get('utm_medium') || '';
    const campaign = params.get('utm_campaign') || '';

    let message = CONFIG.baseMessage;
    const utmParts = [];
    if (source !== 'direto') utmParts.push(source);
    if (medium) utmParts.push(medium);
    if (campaign) utmParts.push(`campanha: ${campaign}`);

    if (utmParts.length) {
      message += `\n\nOrigem: ${utmParts.join(' / ')}`;
    }
    if (ctaSource) {
      message += `\n[CTA: ${ctaSource}]`;
    }

    return `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
  }

  // ======================================================
  // WIRE UP WHATSAPP BUTTONS
  // ======================================================
  const whatsappButtons = document.querySelectorAll('[data-whatsapp]');
  whatsappButtons.forEach((link) => {
    const source = link.getAttribute('data-cta-source') || 'unknown';
    link.href = buildWhatsappUrl(source);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';

    link.addEventListener('click', () => {
      // Fire Meta Pixel Lead event
      if (typeof window.fbq === 'function') {
        window.fbq('track', 'Lead', {
          content_name: document.title,
          cta_source: source,
        });
      }
    });
  });

  // ======================================================
  // TOP BAR DATE — preenche com data atual formatada
  // ======================================================
  const dateEl = document.getElementById('topbarDate');
  if (dateEl) {
    const now = new Date();
    const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
    const dia = String(now.getDate()).padStart(2, '0');
    const mes = meses[now.getMonth()];
    const ano = now.getFullYear();
    dateEl.textContent = `${dia} ${mes} ${ano}`;
  }

  // ======================================================
  // REMOVE NO-JS FALLBACK CLASS
  // ======================================================
  document.body.classList.remove('no-js');

  // ======================================================
  // REVEAL ON SCROLL (IntersectionObserver)
  // ======================================================
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
  } else {
    // Fallback sem IO: mostra tudo
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
  }

  // ======================================================
  // WHATSAPP FLOAT — só aparece após scroll
  // ======================================================
  const waFloat = document.querySelector('.wa-float');
  if (waFloat) {
    let lastScroll = 0;
    const onScroll = () => {
      const y = window.scrollY;
      if (y > 600) waFloat.classList.add('is-visible');
      else waFloat.classList.remove('is-visible');
      lastScroll = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ==============================================
  // LIGHTBOX DA GALERIA
  // ==============================================
  const lightbox = document.getElementById('lightbox');
  const lightboxContent = document.getElementById('lightboxContent');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const galleryItems = Array.from(document.querySelectorAll('#galleryGrid .gallery__item'));

  if (lightbox && galleryItems.length) {
    let currentIndex = 0;

    function renderLightbox() {
      const item = galleryItems[currentIndex];
      const fullSrc = item.getAttribute('data-full');
      const caption = item.getAttribute('data-caption') || '';
      const imgInside = item.querySelector('img');

      lightboxContent.innerHTML = '';

      if (imgInside && imgInside.src) {
        const img = document.createElement('img');
        img.src = imgInside.src;
        img.alt = caption;
        img.className = 'lightbox__img';
        lightboxContent.appendChild(img);
      } else if (fullSrc && !fullSrc.includes('foto-')) {
        // quando o usuário trocar os placeholders por <img>, cairá no bloco acima
        const img = document.createElement('img');
        img.src = fullSrc;
        img.alt = caption;
        img.className = 'lightbox__img';
        lightboxContent.appendChild(img);
      } else {
        // Placeholder: mostra a label da foto
        const ph = document.createElement('div');
        ph.className = 'lightbox__placeholder';
        const label = item.querySelector('span:last-child')?.textContent || 'Foto do imóvel';
        ph.innerHTML = `<span>Foto ${currentIndex + 1} de ${galleryItems.length}</span><strong style="color:var(--gold-light);font-family:var(--font-serif);font-size:24px;letter-spacing:0;">${label}</strong>`;
        lightboxContent.appendChild(ph);
      }

      lightboxCaption.textContent = caption;
    }

    function openLightbox(index) {
      currentIndex = index;
      renderLightbox();
      lightbox.hidden = false;
      lightbox.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('is-open');
      lightbox.hidden = true;
      document.body.style.overflow = '';
    }

    function nextLightbox() {
      currentIndex = (currentIndex + 1) % galleryItems.length;
      renderLightbox();
    }

    function prevLightbox() {
      currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
      renderLightbox();
    }

    galleryItems.forEach((item, i) => {
      item.addEventListener('click', () => openLightbox(i));
    });

    lightbox.querySelector('[data-lightbox-close]')?.addEventListener('click', closeLightbox);
    lightbox.querySelector('[data-lightbox-next]')?.addEventListener('click', nextLightbox);
    lightbox.querySelector('[data-lightbox-prev]')?.addEventListener('click', prevLightbox);

    // Click fora do conteúdo fecha
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    // Teclado
    document.addEventListener('keydown', (e) => {
      if (lightbox.hidden) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextLightbox();
      if (e.key === 'ArrowLeft') prevLightbox();
    });
  }

  // ==============================================
  // SMOOTH SCROLL OFFSET — header sticky compensa
  // ==============================================
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#' || href.length < 2) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const headerHeight = 90; // header com top:12px + altura ~60px + folga
      const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();
