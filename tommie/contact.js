const params = new URLSearchParams(location.search);
const mode = (params.get('mode') || 'message').toLowerCase();

const modeLabel = document.getElementById('modeLabel');
const pageTitle = document.getElementById('pageTitle');
const pageCopy = document.getElementById('pageCopy');
const service = document.getElementById('service');
const requestTypeField = document.getElementById('requestTypeField');
const subjectField = document.getElementById('subjectField');
const form = document.getElementById('requestForm');
const submitButton = document.getElementById('submitButton');

const presets = {
  founding: {
    label: 'FOUNDING BUSINESSES',
    title: 'Ask about founding access.',
    copy: 'Tell me what your business is and what you want people to be able to do when they reach you inside the spatial world. When you send this form, it is delivered to me automatically.',
    service: 'Founding Business / Spatial World',
    subject: 'Explore Brevard — New Founding Business Lead'
  },
  book: {
    label: 'BOOK / REQUEST APPOINTMENT',
    title: 'Request an appointment.',
    copy: 'Choose the service you are interested in and tell me what you need. Sending this creates a real request, but the appointment is not confirmed until I respond.',
    service: 'Custom Architecture Session',
    subject: 'Explore Brevard — New Booking Request'
  },
  message: {
    label: 'MESSAGE / INQUIRY',
    title: 'Send an inquiry.',
    copy: 'Tell me what you are working on and what kind of help you are looking for. When you send this form, it is delivered to me automatically.',
    service: 'General Inquiry',
    subject: 'Explore Brevard — New Message'
  }
};

const preset = presets[mode] || presets.message;

modeLabel.textContent = preset.label;
pageTitle.textContent = preset.title;
pageCopy.textContent = preset.copy;
service.value = preset.service;
requestTypeField.value = preset.label;
subjectField.value = preset.subject;

form.addEventListener('submit', () => {
  submitButton.disabled = true;
  submitButton.textContent = 'SENDING…';
});
