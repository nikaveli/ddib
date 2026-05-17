/* =========================================================
   DDIB — Shared animation + interaction engine (GSAP)
   Required: gsap, ScrollTrigger, SplitType
   ========================================================= */

(function(){
  if(!window.gsap){ console.warn('GSAP not loaded'); return; }
  gsap.registerPlugin(ScrollTrigger);

  /* ------- Cursor (frost trail) ------- */
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if(dot && ring){
    let mx=window.innerWidth/2, my=window.innerHeight/2, rx=mx, ry=my;
    window.addEventListener('pointermove', e=>{ mx=e.clientX; my=e.clientY;
      gsap.to(dot,{x:mx,y:my,duration:0.06,ease:'power2.out'});
    });
    gsap.ticker.add(()=>{
      rx += (mx-rx)*0.12;
      ry += (my-ry)*0.12;
      ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
    });
    document.querySelectorAll('a, button, .tile, .btn, .nav-cta').forEach(el=>{
      el.addEventListener('pointerenter', ()=> ring.classList.add('hover'));
      el.addEventListener('pointerleave', ()=> ring.classList.remove('hover'));
    });
  }

  /* ------- Nav scrolled state + mobile toggle ------- */
  const nav = document.querySelector('.nav');
  if(nav){
    ScrollTrigger.create({
      start: 'top -40',
      end: 'max',
      onUpdate: self => nav.classList.toggle('scrolled', self.scroll() > 40)
    });
    const toggle = document.getElementById('navToggle');
    if(toggle){
      toggle.addEventListener('click', ()=> nav.classList.toggle('open'));
      nav.querySelectorAll('.nav-mobile a').forEach(a=>{
        a.addEventListener('click', ()=> nav.classList.remove('open'));
      });
    }
  }

  /* ------- Hero wordmark — split blast ------- */
  document.querySelectorAll('[data-split="chars"]').forEach(el=>{
    const split = new SplitType(el, { types: 'chars' });
    gsap.set(el, { visibility: 'visible' });
    gsap.from(split.chars, {
      yPercent: 110,
      rotate: 8,
      opacity: 0,
      duration: 1.0,
      ease: 'expo.out',
      stagger: 0.045,
      delay: 0.15
    });
  });

  /* ------- Lines (kicker, sub copy) ------- */
  document.querySelectorAll('[data-split="lines"]').forEach(el=>{
    const split = new SplitType(el, { types: 'lines' });
    split.lines.forEach(l => {
      const wrap = document.createElement('span');
      wrap.className = 'split-line';
      l.parentNode.insertBefore(wrap, l);
      wrap.appendChild(l);
    });
    gsap.set(el, { visibility: 'visible' });
    gsap.from(split.lines, {
      yPercent: 110,
      duration: 0.9,
      ease: 'expo.out',
      stagger: 0.08,
      delay: 0.35
    });
  });

  /* ------- Generic fade-up on scroll ------- */
  gsap.utils.toArray('[data-anim="fade-up"]').forEach(el=>{
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' },
      y: 60,
      opacity: 0,
      duration: 1.0,
      ease: 'expo.out'
    });
  });

  /* ------- Reveal big headings character by character ------- */
  gsap.utils.toArray('[data-anim="head-chars"]').forEach(el=>{
    const split = new SplitType(el, { types: 'chars,words' });
    gsap.set(el, { visibility: 'visible' });
    gsap.from(split.chars, {
      scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' },
      yPercent: 110,
      rotate: 6,
      opacity: 0,
      duration: 0.8,
      ease: 'expo.out',
      stagger: 0.025
    });
  });

  /* ------- Stagger children on reveal ------- */
  gsap.utils.toArray('[data-anim="stagger"]').forEach(parent=>{
    const kids = parent.children;
    gsap.from(kids, {
      scrollTrigger: { trigger: parent, start: 'top 85%', toggleActions: 'play none none reverse' },
      y: 50,
      opacity: 0,
      duration: 0.9,
      ease: 'expo.out',
      stagger: 0.09
    });
  });

  /* ------- Marquee infinite ------- */
  gsap.utils.toArray('.marquee-track').forEach(track=>{
    // Duplicate content for seamless loop
    const inner = track.innerHTML;
    track.innerHTML = inner + inner;
    const width = track.scrollWidth / 2;
    gsap.to(track, {
      x: -width,
      duration: 32,
      ease: 'none',
      repeat: -1
    });
  });

  /* ------- Parallax elements ------- */
  gsap.utils.toArray('[data-parallax]').forEach(el=>{
    const speed = parseFloat(el.dataset.parallax) || 0.3;
    gsap.to(el, {
      yPercent: -speed * 100,
      ease: 'none',
      scrollTrigger: { trigger: el.closest('section') || el, start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });

  /* ------- Counter animations ------- */
  gsap.utils.toArray('[data-count]').forEach(el=>{
    const end = parseFloat(el.dataset.count);
    const decimals = (el.dataset.count.split('.')[1]||'').length;
    const obj = { v: 0 };
    gsap.to(obj, {
      v: end,
      duration: 2.0,
      ease: 'expo.out',
      onUpdate: ()=> el.textContent = obj.v.toFixed(decimals),
      scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' }
    });
  });

  /* ------- Magnetic buttons ------- */
  document.querySelectorAll('[data-magnetic]').forEach(btn=>{
    const strength = 0.35;
    btn.addEventListener('pointermove', e=>{
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width/2)) * strength;
      const y = (e.clientY - (r.top + r.height/2)) * strength;
      gsap.to(btn, { x, y, duration: 0.4, ease: 'power3.out' });
    });
    btn.addEventListener('pointerleave', ()=> gsap.to(btn,{ x:0, y:0, duration: 0.6, ease: 'elastic.out(1,0.4)' }));
  });

  /* ------- Particle / snow drift ------- */
  document.querySelectorAll('.particles').forEach(layer=>{
    const count = parseInt(layer.dataset.particles || '24', 10);
    for(let i=0;i<count;i++){
      const p = document.createElement('span');
      p.className = 'particle';
      const size = Math.random()*4 + 1;
      p.style.width = size+'px';
      p.style.height = size+'px';
      p.style.left = (Math.random()*100)+'%';
      p.style.top = (Math.random()*100)+'%';
      p.style.opacity = 0.2 + Math.random()*0.6;
      layer.appendChild(p);
      gsap.to(p, {
        y: '+=' + (60 + Math.random()*120),
        x: '+=' + ((Math.random()-0.5)*60),
        duration: 6 + Math.random()*8,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: -Math.random()*8
      });
    }
  });

  /* ------- Tile hover lift ------- */
  document.querySelectorAll('.tile-hover').forEach(t=>{
    t.addEventListener('pointerenter', ()=> gsap.to(t,{ y:-6, duration: 0.4, ease:'power3.out' }));
    t.addEventListener('pointerleave', ()=> gsap.to(t,{ y:0, duration: 0.5, ease:'power3.out' }));
  });

  /* ------- Refresh after fonts load ------- */
  if(document.fonts && document.fonts.ready){
    document.fonts.ready.then(()=> ScrollTrigger.refresh());
  }

})();
