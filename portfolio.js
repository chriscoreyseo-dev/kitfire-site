'use strict';
const toggle=document.querySelector('.menu-toggle'),nav=document.querySelector('#primary-nav');
toggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open))});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){nav.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.focus()}});
const filters=[...document.querySelectorAll('[data-filter]')],cards=[...document.querySelectorAll('[data-category]')];
filters.forEach(button=>button.addEventListener('click',()=>{const selected=button.dataset.filter;let count=0;filters.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));cards.forEach(card=>{card.hidden=selected!=='all'&&card.dataset.category!==selected;if(!card.hidden)count++;else card.querySelectorAll('video').forEach(video=>video.pause())});document.getElementById('filter-count').textContent=count+' projects'}));
document.querySelectorAll('video').forEach(video=>video.addEventListener('play',()=>{document.querySelectorAll('video').forEach(other=>{if(other!==video)other.pause()})}));
