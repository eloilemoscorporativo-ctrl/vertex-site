(function () {
  'use strict';

  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var WHATS = '5598996023487';

  document.getElementById('ano').textContent = new Date().getFullYear();

  /* Cabeçalho ganha fundo quando o topo do hero sai da tela */
  var header = document.getElementById('header');
  var sentinel = document.getElementById('sentinel');
  if ('IntersectionObserver' in window && sentinel) {
    new IntersectionObserver(function (e) {
      header.classList.toggle('is-solid', !e[0].isIntersecting);
    }).observe(sentinel);
  } else {
    header.classList.add('is-solid');
  }

  /* Campo facetado do hero: o padrão original da marca vem no HTML.
     Ao passar o cursor, a faceta acende em laranja e apaga devagar. */
  var field = document.getElementById('field');
  var hero = document.querySelector('.hero');
  if (field && finePointer && !reduce) {
    field.addEventListener('pointerover', function (e) {
      var p = e.target;
      if (p.tagName !== 'polygon') return;
      p.classList.add('hot');
      setTimeout(function () { p.classList.remove('hot'); }, 70);
    });
  }

  /* Troca o V vetorial pelo metálico quando a montagem termina */
  var vm = document.querySelector('.vmark');
  if (vm) setTimeout(function () { vm.classList.add('is-ready'); }, reduce ? 0 : 2300);

  /* Inclinação do símbolo e leitura de coordenadas acompanham o cursor */
  var heroV = document.getElementById('heroV');
  var coords = document.getElementById('coords');
  var vmark = heroV && heroV.querySelector('.vmark');
  var LAT = -2.530731, LON = -44.306278;
  if (hero && vmark && finePointer && !reduce) {
    var raf = 0, px = 0, py = 0;
    hero.addEventListener('pointermove', function (e) {
      var b = hero.getBoundingClientRect();
      px = (e.clientX - b.left) / b.width * 2 - 1;
      py = (e.clientY - b.top) / b.height * 2 - 1;
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        vmark.style.setProperty('--px', px.toFixed(3));
        vmark.style.setProperty('--py', py.toFixed(3));
        coords.textContent = (LAT - py * .0021).toFixed(6) + ', ' + (LON + px * .0034).toFixed(6);
      });
    });
    hero.addEventListener('pointerleave', function () {
      vmark.style.setProperty('--px', 0);
      vmark.style.setProperty('--py', 0);
      coords.textContent = LAT.toFixed(6) + ', ' + LON.toFixed(6);
    });
  }

  /* Serviços: índice + painel */
  var items = Array.prototype.slice.call(document.querySelectorAll('.svc-item'));
  var img = document.getElementById('svcImg');
  var nEl = document.getElementById('svcN');
  var tEl = document.getElementById('svcTitle');
  var dEl = document.getElementById('svcDesc');
  var desktop = matchMedia('(min-width: 961px)');
  var current = items[0];

  function activate(item, fromClick) {
    if (!item) return;
    if (item === current) {
      // no celular, tocar de novo fecha o item
      if (fromClick && !desktop.matches) {
        item.classList.toggle('is-active');
        item.querySelector('button').setAttribute('aria-expanded', item.classList.contains('is-active'));
      }
      return;
    }
    current.classList.remove('is-active');
    current.querySelector('button').setAttribute('aria-expanded', 'false');
    item.classList.add('is-active');
    item.querySelector('button').setAttribute('aria-expanded', 'true');
    current = item;

    nEl.textContent = item.querySelector('.svc-n').textContent;
    tEl.textContent = item.querySelector('.svc-name').textContent;
    dEl.textContent = item.querySelector('.svc-desc').textContent;

    var src = item.getAttribute('data-img');
    if (img.getAttribute('src') !== src) {
      img.classList.add('swap');
      setTimeout(function () {
        img.src = src;
        img.alt = item.getAttribute('data-alt');
        if (img.complete) img.classList.remove('swap');
        else img.onload = function () { img.classList.remove('swap'); };
      }, reduce ? 0 : 220);
    } else {
      img.alt = item.getAttribute('data-alt');
    }
  }

  items.forEach(function (item) {
    var btn = item.querySelector('button');
    btn.addEventListener('click', function () { activate(item, true); });
    btn.addEventListener('focus', function () { if (desktop.matches) activate(item); });
    item.addEventListener('pointerenter', function (e) {
      if (desktop.matches && e.pointerType === 'mouse') activate(item);
    });
  });

  /* Pré-carrega as fotos do painel depois que a página abre */
  addEventListener('load', function () {
    var seen = {};
    items.forEach(function (it) {
      var s = it.getAttribute('data-img');
      if (!seen[s]) { seen[s] = 1; new Image().src = s; }
    });
  });

  /* Linha do tempo acende conforme cada etapa entra na tela */
  var timeline = document.getElementById('timeline');
  var steps = Array.prototype.slice.call(document.querySelectorAll('.tl-step'));
  if ('IntersectionObserver' in window && timeline && !reduce) {
    timeline.style.setProperty('--progress', 0);
    var ioT = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) e.target.classList.add('is-on'); });
      var on = steps.filter(function (s) { return s.classList.contains('is-on'); }).length;
      timeline.style.setProperty('--progress', (on - 1) / (steps.length - 1));
    }, { rootMargin: '0px 0px -45% 0px' });
    steps.forEach(function (s) { ioT.observe(s); });
  } else {
    steps.forEach(function (s) { s.classList.add('is-on'); });
  }

  /* Revelação ao rolar */
  if ('IntersectionObserver' in window && !reduce) {
    document.documentElement.classList.add('js');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        io.unobserve(e.target);
      });
    }, { threshold: .15, rootMargin: '0px 0px -6% 0px' });
    document.querySelectorAll('.rv').forEach(function (el) { io.observe(el); });
  }

  /* Formulário: monta a mensagem e abre o WhatsApp */
  var form = document.getElementById('form');
  if (form) {
    var nome = document.getElementById('f-nome');
    var errNome = document.getElementById('e-nome');
    nome.addEventListener('input', function () {
      if (nome.value.trim()) { nome.removeAttribute('aria-invalid'); errNome.hidden = true; }
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var n = nome.value.trim();
      if (!n) {
        nome.setAttribute('aria-invalid', 'true');
        errNome.hidden = false;
        nome.focus();
        return;
      }
      var s = document.getElementById('f-servico').value;
      var m = document.getElementById('f-msg').value.trim();
      var txt = 'Olá! Sou ' + n + ' e vim pelo site da Vertex Engenharia.\nServiço: ' + s + (m ? '\n' + m : '');
      window.open('https://wa.me/' + WHATS + '?text=' + encodeURIComponent(txt), '_blank', 'noopener');
    });
  }
})();
