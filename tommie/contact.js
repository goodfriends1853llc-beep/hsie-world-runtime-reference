const params = new URLSearchParams(location.search);
const mode = (params.get('mode') || 'message').toLowerCase();
const modeLabel = document.getElementById('modeLabel');
const pageTitle = document.getElementById('pageTitle');
const pageCopy = document.getElementById('pageCopy');
const service = document.getElementById('service');
const form = document.getElementById('requestForm');
const generated = document.getElementById('generated');
const copyButton = document.getElementById('copyButton');
const shareButton = document.getElementById('shareButton');

const presets = {
  founding: {
    label: 'FOUNDING BUSINESSES',
    title: 'Ask about founding access.',
    copy: 'Tell me what your business is and what you want people to be able to do when they reach you inside the spatial world.',
    service: 'Founding Business / Spatial World'
  },
  book: {
    label: 'BOOK / REQUEST APPOINTMENT',
    title: 'Prepare a booking request.',
    copy: 'Choose the service you are interested in and tell me what you need. This prepares a request; it does not confirm an appointment.',
    service: 'Custom Architecture Session'
  },
  message: {
    label: 'MESSAGE / INQUIRY',
    title: 'Send an inquiry.',
    copy: 'Tell me what you are working on and what kind of help you are looking for.',
    service: 'General Inquiry'
  }
};

const preset = presets[mode] || presets.message;
modeLabel.textContent = preset.label;
pageTitle.textContent = preset.title;
pageCopy.textContent = preset.copy;
service.value = preset.service;

let preparedText = '';

function buildRequest() {
  const data = new FormData(form);
  return [
    'TOMMIE BELLAMY — REQUEST',
    '',
    `Type: ${preset.label}`,
    `Name: ${data.get('name') || ''}`,
    `Business / Project: ${data.get('business') || ''}`,
    `Best contact: ${data.get('contact') || ''}`,
    `Interested in: ${data.get('service') || ''}`,
    '',
    'Message:',
    data.get('message') || ''
  ].join('\n');
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  preparedText = buildRequest();
  generated.textContent = preparedText;
  generated.hidden = false;
  copyButton.hidden = false;
  shareButton.hidden = !navigator.share;
  generated.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

copyButton.addEventListener('click', async () => {
  await navigator.clipboard.writeText(preparedText);
  copyButton.textContent = 'COPIED';
  setTimeout(() => { copyButton.textContent = 'COPY REQUEST'; }, 1600);
});

shareButton.addEventListener('click', async () => {
  if (!navigator.share || !preparedText) return;
  await navigator.share({
    title: preset.label,
    text: preparedText
  });
});
