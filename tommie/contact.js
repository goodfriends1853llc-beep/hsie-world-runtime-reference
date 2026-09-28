const params = new URLSearchParams(location.search);
const mode = (params.get('mode') || 'message').toLowerCase();

const modeLabel = document.getElementById('modeLabel');
const pageTitle = document.getElementById('pageTitle');
const pageCopy = document.getElementById('pageCopy');
const service = document.getElementById('service');
const requestTypeField = document.getElementById('requestTypeField');
const subjectField = document.getElementById('subjectField');
const nextField = document.getElementById('nextField');
const form = document.getElementById('requestForm');
const submitButton = document.getElementById('submitButton');

const presets = {
  founding: {
    label: 'FOUNDING BUSINESSES',
    title: 'PUT YOUR BUSINESS IN THE WORLD.',
    copy: 'Tell me what you do, how you want to be represented, and what visitors should be able to do when they reach you.',
    service: 'Founding Business / Spatial World',
    subject: 'Explore Brevard — New Founding Business Lead',
    button: 'SEND FOUNDING REQUEST'
  },
  book: {
    label: 'BOOK / REQUEST APPOINTMENT',
    title: 'START WITH THE PROBLEM.',
    copy: 'Choose what you need and tell me what you are trying to build, fix, or clarify. I will respond with the next step.',
    service: 'Custom Architecture Session',
    subject: 'Explore Brevard — New Booking Request',
    button: 'REQUEST A SESSION'
  },
  message: {
    label: 'MESSAGE / INQUIRY',
    title: 'SEND IT STRAIGHT TO ME.',
    copy: 'Business, collaboration, question, or idea — leave the details below. Your message comes directly to me by email.',
    service: 'General Inquiry',
    subject: 'Explore Brevard — New Message',
    button: 'SEND MESSAGE'
  }
};

const preset = presets[mode] || presets.message;

modeLabel.textContent = preset.label;
pageTitle.textContent = preset.title;
pageCopy.textContent = preset.copy;
service.value = preset.service;
requestTypeField.value = preset.label;
subjectField.value = preset.subject;
submitButton.textContent = preset.button;

const thanksUrl = new URL('./thanks.html', location.href);
thanksUrl.searchParams.set('mode', mode);
nextField.value = thanksUrl.href;

form.addEventListener('submit', () => {
  submitButton.disabled = true;
  submitButton.textContent = 'SENDING…';
});
