
(function(){
  const burger=document.getElementById('burger'),nav=document.getElementById('nav');
  burger?.addEventListener('click',()=>nav.classList.toggle('open'));
  const toggle=document.getElementById('theme-toggle'),saved=localStorage.getItem('theme');
  if(saved)document.documentElement.setAttribute('data-theme',saved);
  toggle?.addEventListener('click',()=>{const cur=document.documentElement.getAttribute('data-theme')||'dark';const next=cur==='dark'?'light':'dark';document.documentElement.setAttribute('data-theme',next);localStorage.setItem('theme',next);});
  const toTop=document.querySelector('.to-top');window.addEventListener('scroll',()=>{if(window.scrollY>500)toTop?.classList.add('show');else toTop?.classList.remove('show');});toTop?.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
  const ro=new IntersectionObserver((es)=>{for(const e of es) if(e.isIntersecting) e.target.classList.add('show');},{threshold:.12});document.querySelectorAll('.reveal').forEach(el=>ro.observe(el));
  const nl=document.getElementById('nl-form');nl?.addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(nl);const list=JSON.parse(localStorage.getItem('cosprysma_nl')||'[]');list.push({email:fd.get('email'),created_at:new Date().toISOString()});localStorage.setItem('cosprysma_nl',JSON.stringify(list));nl.reset();alert('Assinatura registrada (demo).');});
  const recent=document.getElementById('recent-photos');if(recent){fetch('data/gallery.json').then(r=>r.json()).then(items=>{recent.innerHTML=items.slice(0,12).map(it=>`<img src="${it.src}" alt="${it.alt}" loading="lazy">`).join('');}).catch(()=>{});}
  const contactForm=document.getElementById('contact-form');if(contactForm){contactForm.addEventListener('submit',e=>{e.preventDefault();const data=Object.fromEntries(new FormData(contactForm).entries());const key='cosprysma_contact';const list=JSON.parse(localStorage.getItem(key)||'[]');list.push({...data,created_at:new Date().toISOString()});localStorage.setItem(key,JSON.stringify(list));document.getElementById('contact-success').hidden=false;contactForm.reset();});}
  if('serviceWorker'in navigator){navigator.serviceWorker.register('service-worker.js').catch(()=>{});}
})();
