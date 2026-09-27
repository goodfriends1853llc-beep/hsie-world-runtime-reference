const menuButton = document.getElementById('menuButton');
const siteNav = document.getElementById('siteNav');

menuButton?.addEventListener('click', () => {
  const open = siteNav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});

siteNav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    siteNav.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.dataset.visible = 'true';
  });
}, { threshold: 0.08 });

document.querySelectorAll('.project,.service-card,.method-grid>div').forEach((el) => observer.observe(el));
