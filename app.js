'use strict';
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#primary-nav');
function closeMenu() { navigation.classList.remove('open'); menuButton.setAttribute('aria-expanded', 'false'); }
menuButton.addEventListener('click', () => { const open = navigation.classList.toggle('open'); menuButton.setAttribute('aria-expanded', String(open)); });
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && navigation.classList.contains('open')) { closeMenu(); menuButton.focus(); } });

const examples = {
  questions: {person:'A CUSTOMER, AFTER HOURS', question:'“Do you install equipment in existing gyms, or just new builds?”', worker:'YOUR WEBSITE ASSISTANT', answer:'“We do both. Tell me a little about your space and I can help you get the right person involved.”', outcome:'Question answered. Next conversation started.'},
  followup: {person:'A QUOTE THAT NEEDS A FOLLOW-UP', question:'You sent the estimate. Then the rest of the day happened.', worker:'YOUR FOLLOW-UP WORKER · SAMPLE DRAFT', answer:'“Hi Alex, just checking in on the estimate we sent over. Any questions I can help with before you decide?”', outcome:'Follow-up drafted. Ready for review.'},
  reviews: {person:'A NEW GOOGLE REVIEW', question:'“The team showed up on time and left everything spotless. Would recommend.”', worker:'YOUR REVIEW WORKER · SAMPLE DRAFT', answer:'“Thank you for taking the time to share this. We’re glad the crew took good care of your space—it means a lot.”', outcome:'A thoughtful response, ready to approve.'}
};
document.querySelectorAll('[data-example]').forEach(button => button.addEventListener('click', () => {
  const example = examples[button.dataset.example];
  document.querySelectorAll('[data-example]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
  Object.entries(example).forEach(([key,value]) => { document.getElementById('example-' + key).textContent = value; });
}));

const form = document.getElementById('intake-form');
const isLiveOrigin = ['https://kitfire.ai', 'https://www.kitfire.ai'].includes(window.location.origin);
if (!isLiveOrigin) {
  const note = document.createElement('p');
  note.className = 'preview-note';
  note.append('Design preview. To send an inquiry, ');
  const link = document.createElement('a'); link.href = 'https://kitfire.ai/#start'; link.textContent = 'use the live audit form';
  note.append(link, '. Information entered here is not sent.');
  form.prepend(note);
  form.querySelector('.send').textContent = 'Preview my audit request';
}
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const button = form.querySelector('.send');
  if (button.disabled) return;
  const error = document.getElementById('form-error');
  if (!isLiveOrigin) { error.textContent = 'This is a design preview. No request has been sent. Use the live audit form linked above to contact KitFire.'; error.hidden = false; return; }
  const originalLabel = button.innerHTML;
  const data = new FormData(form);
  const payload = { name:String(data.get('name') || '').trim(), business:String(data.get('business') || '').trim(), email:String(data.get('email') || '').trim(), website:String(data.get('website') || '').trim(), needs:data.getAll('needs').join(', '), about:String(data.get('about') || '').trim() };
  for (const key of ['name','business']) { if (!payload[key]) { form.elements.namedItem(key).setCustomValidity('Please fill in this field.'); form.elements.namedItem(key).reportValidity(); return; } }
  error.hidden = true;
  button.disabled = true;
  button.textContent = 'Sending your request…';
  form.setAttribute('aria-busy', 'true');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(form.action, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload), signal:controller.signal });
    if (!response.ok) throw new Error('Request failed');
    form.hidden = true;
    const success = document.getElementById('form-success'); success.hidden = false; success.focus();
  } catch {
    error.hidden = false;
    button.disabled = false;
    button.innerHTML = originalLabel;
  } finally { clearTimeout(timeout); form.removeAttribute('aria-busy'); }
});
form.querySelectorAll('input').forEach(input => input.addEventListener('input', () => input.setCustomValidity('')));
