import { ReferenceDataStore } from './data-store.js?v=20260927-6';
import { TopologyResolver } from './topology-resolver.js?v=20260927-6';
import { InteractionExecutor } from './interaction-executor.js?v=20260927-6';
import { PannellumRendererAdapter } from './pannellum-adapter.js?v=20260927-6';
import { resolveAssetUrl } from './config.js?v=20260927-6';

const $ = (id) => document.getElementById(id);
const entryOverlay = $('entryOverlay');
const enableMotionButton = $('enableMotion');
const useTouchButton = $('useTouch');
const motionToggle = $('motionToggle');
const entryStatus = $('entryStatus');
const transitionOverlay = $('transitionOverlay');
const transitionKicker = $('transitionKicker');
const transitionTitle = $('transitionTitle');
const transitionSub = $('transitionSub');
const modal = $('modal');
const modalType = $('modalType');
const modalTitle = $('modalTitle');
const modalBody = $('modalBody');
const modalActions = $('modalActions');
const closeModalButton = $('closeModal');
const toast = $('toast');

let store;
let renderer;
let interactionExecutor;
let currentLocation;
let transitionStartedAt = 0;
let entryHintShown = false;

const PLACE_TRANSITIONS = {
  'place:hsa-arrival-hub': {
    kicker: 'HOME BASE',
    title: 'TOMMIE’S HUB',
    sub: 'Back where the world begins.'
  },
  'place:explore-brevard-main-street': {
    kicker: 'EXPLORE BREVARD',
    title: 'MAIN STREET',
    sub: 'The first corridor.'
  },
  'place:lagoon-nights': {
    kicker: 'OFF MAIN STREET',
    title: 'LAGOON NIGHTS',
    sub: 'Moonrise on the water.'
  }
};

function showToast(message) {
  toast.textContent = message;
  toast.hidden = false;
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => { toast.hidden = true; }, 2500);
}

function closeModal() {
  modal.hidden = true;
  modalBody.replaceChildren();
  modalActions.replaceChildren();
}

function showTransition(placeRef) {
  const copy = PLACE_TRANSITIONS[placeRef] || {
    kicker: 'EXPLORE BREVARD',
    title: store.place(placeRef).display_name,
    sub: ''
  };

  transitionKicker.textContent = copy.kicker;
  transitionTitle.textContent = copy.title;
  transitionSub.textContent = copy.sub;
  transitionOverlay.hidden = false;
  transitionStartedAt = performance.now();

  requestAnimationFrame(() => {
    requestAnimationFrame(() => transitionOverlay.classList.add('is-visible'));
  });
}

function hideTransition() {
  if (transitionOverlay.hidden) return;

  const minimumHold = 650;
  const elapsed = performance.now() - transitionStartedAt;
  const wait = Math.max(0, minimumHold - elapsed);

  window.setTimeout(() => {
    transitionOverlay.classList.remove('is-visible');
    window.setTimeout(() => {
      transitionOverlay.hidden = true;
    }, 290);
  }, wait);
}

function navigate(target) {
  closeModal();
  showTransition(target.placeRef);
  currentLocation = { placeRef: target.placeRef, spaceRef: target.spaceRef };
  const representation = store.representationFor(currentLocation.placeRef, currentLocation.spaceRef);
  renderer.transitionRepresentation(representation.representation_id);
}

function showAbout(business) {
  modalType.textContent = 'ABOUT';
  modalTitle.textContent = business.public_profile.about_title || business.display_name;
  modalBody.replaceChildren();
  modalActions.replaceChildren();

  const p = document.createElement('p');
  p.textContent = business.public_profile.about_body || business.public_profile.purpose || '';
  modalBody.appendChild(p);
  modal.hidden = false;
}

function showServices(business) {
  modalType.textContent = 'SERVICES';
  modalTitle.textContent = business.public_profile.services_title || `${business.display_name} Services`;
  modalBody.replaceChildren();
  modalActions.replaceChildren();

  const list = document.createElement('ul');
  for (const service of business.services) {
    const li = document.createElement('li');
    li.textContent = service.name;
    list.appendChild(li);
  }
  modalBody.appendChild(list);

  const bookingRef = business.services.find((service) => service.booking_action_ref)?.booking_action_ref;
  if (bookingRef) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'action-button';
    const bookingAction = store.externalAction(bookingRef);
    button.textContent = bookingAction.label || 'BOOK / CONTACT';
    button.addEventListener('click', () => openExternal(bookingAction));
    modalActions.appendChild(button);
  }

  modal.hidden = false;
}

function openExternal(action) {
  showToast(`Opening ${action.label || 'destination'}…`);
  const opened = window.open(action.destination, '_blank', 'noopener,noreferrer');
  if (!opened) window.location.assign(action.destination);
}

function syncMotionToggle(active) {
  motionToggle.dataset.active = active ? 'true' : 'false';
  motionToggle.setAttribute('aria-pressed', active ? 'true' : 'false');
  motionToggle.setAttribute('aria-label', active ? 'Turn motion look off' : 'Turn motion look on');
  motionToggle.title = active ? 'Motion look is on' : 'Motion look is off';
}

async function requestMotionLook() {
  entryStatus.textContent = 'Requesting motion access…';

  try {
    if (typeof window.DeviceOrientationEvent !== 'undefined' &&
        typeof window.DeviceOrientationEvent.requestPermission === 'function') {
      const result = await window.DeviceOrientationEvent.requestPermission();
      if (result !== 'granted') {
        entryStatus.textContent = 'Motion was not enabled. Touch still works.';
        return false;
      }
    }

    renderer.startOrientation();
    await new Promise((resolve) => window.setTimeout(resolve, 140));

    const active = renderer.isOrientationActive();
    entryStatus.textContent = active ? 'Motion ready.' : 'Touch mode is ready.';
    return active;
  } catch (error) {
    console.error('Motion permission error:', error);
    entryStatus.textContent = 'Touch mode is ready.';
    return false;
  }
}

function preloadPublicScenes() {
  const ids = [
    'representation:explore-brevard-main-street-360-v1',
    'representation:lagoon-nights-360-v1'
  ];

  for (const id of ids) {
    const representation = store.representations.get(id);
    if (!representation) continue;
    const img = new Image();
    img.decoding = 'async';
    img.src = resolveAssetUrl(representation.asset_ref);
  }
}

function setEntryComplete(mode) {
  const active = mode === 'motion';
  syncMotionToggle(active);
  motionToggle.hidden = false;

  entryOverlay.classList.add('is-leaving');
  window.setTimeout(() => {
    entryOverlay.hidden = true;
  }, 360);

  window.setTimeout(preloadPublicScenes, 450);

  if (!entryHintShown) {
    entryHintShown = true;
    window.setTimeout(() => {
      showToast('Tap the glowing icons to move through the world.');
    }, 700);
  }
}

enableMotionButton.addEventListener('click', async () => {
  enableMotionButton.disabled = true;
  useTouchButton.disabled = true;
  const active = await requestMotionLook();
  setEntryComplete(active ? 'motion' : 'touch');
});

useTouchButton.addEventListener('click', () => {
  if (renderer?.isOrientationActive()) renderer.stopOrientation();
  setEntryComplete('touch');
});

motionToggle.addEventListener('click', async () => {
  if (!renderer) return;

  if (renderer.isOrientationActive()) {
    renderer.stopOrientation();
    syncMotionToggle(false);
    showToast('Touch look is on.');
  } else {
    const active = await requestMotionLook();
    syncMotionToggle(active);
    showToast(active ? 'Motion look is on.' : 'Touch look is on.');
  }
});

closeModalButton.addEventListener('click', closeModal);
modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeModal(); });

async function boot() {
  try {
    store = await new ReferenceDataStore().load();

    const firstPlaceRef = store.world.root_place_refs[0];
    currentLocation = { placeRef: firstPlaceRef, spaceRef: null };
    const firstRepresentation = store.representationFor(firstPlaceRef, null);

    const topology = new TopologyResolver(store);
    interactionExecutor = new InteractionExecutor({
      store,
      topology,
      navigate,
      showAbout,
      showServices,
      openExternal
    });

    renderer = new PannellumRendererAdapter({
      containerId: 'panorama',
      resolveAssetUrl,
      onInteraction: (anchor) => interactionExecutor.execute(anchor, currentLocation),
      onSceneChange: () => closeModal(),
      onSceneLoad: hideTransition,
      onError: (message) => {
        console.error('Pannellum error:', message);
        hideTransition();
        showToast('The scene did not load. Please try again.');
      }
    });

    renderer.initialize([...store.representations.values()], firstRepresentation.representation_id);
    entryStatus.textContent = 'Choose how you want to enter.';
    enableMotionButton.disabled = false;
    useTouchButton.disabled = false;
  } catch (error) {
    console.error(error);
    entryStatus.textContent = 'Explore Brevard could not load. Refresh and try again.';
    enableMotionButton.disabled = true;
    useTouchButton.disabled = true;
  }
}

boot();
