/* RELIQQ Motion System — progressive enhancement, no external JS libraries */
(() => {
  'use strict';
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fine = window.matchMedia('(pointer:fine)');
  const mobile = window.matchMedia('(max-width: 760px)');
  const motionOn = () => !reduce.matches;
  const $ = (s, el=document) => el.querySelector(s);
  const $$ = (s, el=document) => [...el.querySelectorAll(s)];
  root.classList.add('motion-ready');

  // Full-screen cinematic wipe on internal navigation; no JS navigation dependency.
  const wipe = document.createElement('div');
  wipe.className = 'page-wipe';
  wipe.setAttribute('aria-hidden','true');
  wipe.innerHTML = '<div class="wipe-word">RELIQQ<span>®</span></div><span class="wipe-caption">A HISTÓRIA CONTINUA</span>';
  document.body.append(wipe);
  requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add('page-entered')));
  window.addEventListener('pageshow', () => document.body.classList.remove('page-leaving'));
  $$('a[href]').forEach(a => {
    a.addEventListener('click', event => {
      if (!motionOn() || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || a.hasAttribute('download') || a.target === '_blank') return;
      const dest = new URL(a.href, location.href);
      if (dest.origin !== location.origin || !/\.html$/i.test(dest.pathname) || (dest.pathname === location.pathname && !!dest.hash)) return;
      event.preventDefault();
      document.body.classList.add('page-leaving');
      window.setTimeout(() => location.assign(dest.href), 580);
    });
  });

  // Animated introduction lines, staggered but accessible: no duplicate text nodes.
  const words = $$('.hero-title, .inner-hero h1, .statement, .collection-heading h2, .manifesto-inner h2, .story-content h2, .collection-info h3, .footer-cta');
  words.forEach((el, idx) => {
    el.classList.add('motion-heading');
    el.style.setProperty('--heading-delay', `${Math.min(idx * 0.025, .22)}s`);
  });
  $$('.eyebrow, .tiny-index, .hero-kicker, .hero-visual-caption').forEach(el => el.classList.add('motion-meta'));
  $$('.collection-image, .story-media, .story-media img, .editorial-photo, .about-image').forEach(el => {
    if (!el.matches('img')) el.classList.add('motion-frame');
  });

  // Motion reveal: sections, cards and headings use timed sequential entrance.
  const revealList = $$('.motion-heading, .motion-meta, .motion-frame, .value-row, .collection-feature, .editorial-photo, .footer-top');
  if ('IntersectionObserver' in window && motionOn()) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('motion-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold:.11, rootMargin:'0px 0px -15px 0px' });
    revealList.forEach(el => observer.observe(el));
  } else revealList.forEach(el => el.classList.add('motion-visible'));

  // Fine pointer, responsive custom cursor (not visible on touch, reduced motion or keyboard focus).
  if (fine.matches && motionOn()) {
    const cursor = document.createElement('div');
    cursor.className = 'reliq-cursor';
    cursor.innerHTML = '<span class="cursor-label">VER</span>';
    cursor.setAttribute('aria-hidden','true');
    document.body.append(cursor);
    let x = -100, y = -100, cx = -100, cy = -100, hover = false;
    document.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      x = e.clientX; y = e.clientY;
      cursor.classList.add('is-on');
    }, {passive:true});
    document.addEventListener('pointerleave', () => cursor.classList.remove('is-on'));
    $$('a,button').forEach(el => {
      el.addEventListener('mouseenter', () => {
        hover = true;
        cursor.classList.add('is-hover');
        const actionable = el.matches('.collection-feature,.editorial-photo a,.archive-card');
        cursor.classList.toggle('is-preview', actionable);
        $('.cursor-label',cursor).textContent = actionable ? 'ABRIR ↗' : 'VER';
      });
      el.addEventListener('mouseleave', () => { hover = false; cursor.classList.remove('is-hover','is-preview'); });
    });
    function tickCursor() {
      cx += (x-cx) * .18; cy += (y-cy) * .18;
      cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%,-50%)`;
      requestAnimationFrame(tickCursor);
    }
    tickCursor();
  }

  // Physics-light magnetic buttons, constrained to desktop.
  if (fine.matches && motionOn()) {
    $$('.round-arrow, .pill-link, .menu-toggle, .text-link').forEach(el => {
      el.classList.add('magnetic');
      el.addEventListener('pointermove', e => {
        const b = el.getBoundingClientRect();
        const mx = (e.clientX-b.left-b.width/2) * .16;
        const my = (e.clientY-b.top-b.height/2) * .16;
        el.style.setProperty('--mx',`${mx}px`);
        el.style.setProperty('--my',`${my}px`);
      });
      el.addEventListener('pointerleave', () => {
        el.style.setProperty('--mx','0px'); el.style.setProperty('--my','0px');
      });
    });
  }

  // Horizontal cinematic lookbook: buttons, drag, keyboard, free scrolling.
  const track = $('.archive-track');
  if (track) {
    const prev = $('.archive-prev');
    const next = $('.archive-next');
    const position = $('.archive-current');
    let dragging = false, pointerStart=0, scrollStart=0, moved=false;
    const cards = $$('.archive-card',track);
    const move = dir => track.scrollBy({left:dir * Math.max(280, track.clientWidth * .66),behavior:motionOn()?'smooth':'auto'});
    prev?.addEventListener('click',()=>move(-1));
    next?.addEventListener('click',()=>move(1));
    const updateIndex = () => {
      const idx = cards.reduce((best,card,i) => Math.abs(card.offsetLeft-track.scrollLeft) < Math.abs(cards[best].offsetLeft-track.scrollLeft) ? i : best,0);
      if(position) position.textContent = String(idx+1).padStart(2,'0');
      prev?.toggleAttribute('disabled',track.scrollLeft < 12);
      next?.toggleAttribute('disabled',track.scrollLeft + track.clientWidth >= track.scrollWidth-12);
    };
    track.addEventListener('scroll',updateIndex,{passive:true});
    track.addEventListener('pointerdown',e => { if(e.pointerType!=='mouse' || e.button!==0) return; dragging=true; moved=false;pointerStart=e.clientX;scrollStart=track.scrollLeft; });
    window.addEventListener('pointermove',e=> { if(!dragging)return; const dx=e.clientX-pointerStart; if(Math.abs(dx)>6) {moved=true; track.classList.add('is-dragging');track.scrollLeft=scrollStart-dx;} });
    window.addEventListener('pointerup',()=>{dragging=false;track.classList.remove('is-dragging');});
    track.addEventListener('click',e=>{if(moved){e.preventDefault();moved=false;}},true);
    updateIndex();
  }

  // Scroll layers, 3d media and elegant header changes. raf-throttled.
  const parallax = $$('[data-parallax], .collection-image img, .story-media img, .editorial-photo img, .about-image img');
  const header = $('.site-header');
  const scrollIndicator = $('.motion-scroll-indicator');
  let scheduled = false;
  function renderScroll() {
    scheduled = false;
    const vh = innerHeight;
    if (motionOn()) {
      parallax.forEach((el,idx) => {
        const box = el.getBoundingClientRect();
        if(box.bottom < -200 || box.top > vh+200) return;
        const depth = parseFloat(el.dataset.parallax || (el.closest('.editorial-photo') ? '.035' : '.025'));
        const offset = Math.max(-70,Math.min(70, (box.top + box.height/2 - vh/2) * depth));
        el.style.setProperty('--scroll-shift',`${offset.toFixed(2)}px`);
      });
    }
    header?.classList.toggle('is-scrolled', scrollY > 36);
    scrollIndicator?.classList.toggle('is-gone',scrollY > 120);
  }
  window.addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(renderScroll)}},{passive:true});
  window.addEventListener('resize',renderScroll,{passive:true});
  renderScroll();

  // Hover image follow — subtle depth without moving the entire layout.
  if(fine.matches && motionOn()) {
    $$('.collection-image,.editorial-photo,.story-media,.archive-card').forEach(frame=>{
      frame.addEventListener('pointermove',e=>{
        const b=frame.getBoundingClientRect();
        frame.style.setProperty('--tilt-x',`${((e.clientX-b.left)/b.width-.5)*1.8}deg`);
        frame.style.setProperty('--tilt-y',`${((e.clientY-b.top)/b.height-.5)*-1.8}deg`);
      });
      frame.addEventListener('pointerleave',()=>{
        frame.style.setProperty('--tilt-x','0deg');frame.style.setProperty('--tilt-y','0deg');
      });
    });
  }

  // Fixed small label adapts to major sections and gives sense of place.
  const secLabel = $('.motion-section-label');
  if(secLabel && 'IntersectionObserver' in window) {
    const sections=$$('main > section');
    const io = new IntersectionObserver(entries=>{
      entries.forEach(entry=>{if(entry.isIntersecting){
        const name=entry.target.dataset.motionName || entry.target.querySelector('.eyebrow')?.textContent || 'RELIQQ';
        secLabel.textContent = name.toUpperCase().slice(0,45);
      }});
    },{rootMargin:'-36% 0px -48% 0px'});
    sections.forEach(s=>io.observe(s));
  }
})();
