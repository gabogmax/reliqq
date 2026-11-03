(() => {
  const toggle = document.querySelector('.menu-toggle');
  const overlay = document.querySelector('.menu-overlay');
  const label = document.querySelector('.menu-label');
  let lastFocus = null;
  function menu(open) {
    document.body.classList.toggle('menu-open', open);
    toggle?.setAttribute('aria-expanded', String(open));
    overlay?.setAttribute('aria-hidden', String(!open));
    if(label) label.textContent = open ? 'FECHAR' : 'MENU';
    if(open) { lastFocus = document.activeElement; overlay?.querySelector('a')?.focus(); }
    else if(lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }
  toggle?.addEventListener('click', () => menu(!document.body.classList.contains('menu-open')));
  overlay?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu(false)));
  document.addEventListener('keydown', e => {
    if(e.key === 'Escape' && document.body.classList.contains('menu-open')) menu(false);
    if(e.key === 'Tab' && document.body.classList.contains('menu-open')) {
      const items = [toggle,...overlay.querySelectorAll('a')];
      const i = items.indexOf(document.activeElement);
      if(e.shiftKey && i === 0) {e.preventDefault();items.at(-1).focus();}
      else if(!e.shiftKey && i === items.length-1) {e.preventDefault();items[0].focus();}
    }
  });
  const reveals = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if(entry.isIntersecting) {entry.target.classList.add('visible');observer.unobserve(entry.target);}
    }), {threshold:.08,rootMargin:'0px 0px -30px 0px'});
    reveals.forEach(el => observer.observe(el));
  } else reveals.forEach(el => el.classList.add('visible'));
  const progress = document.querySelector('.page-progress');
  let ticking = false;
  const update = () => {
    if(progress) {const max = document.documentElement.scrollHeight-innerHeight;progress.style.width = `${max>0 ? scrollY/max*100 : 0}%`;}
    ticking = false;
  };
  window.addEventListener('scroll', () => {if(!ticking){requestAnimationFrame(update);ticking=true;}}, {passive:true});
  window.addEventListener('resize', update);
  update();
})();
