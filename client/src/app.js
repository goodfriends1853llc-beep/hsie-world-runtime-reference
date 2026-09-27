import { ReferenceDataStore } from './data-store.js?v=20260927-3';
import { TopologyResolver } from './topology-resolver.js?v=20260927-3';
import { InteractionExecutor } from './interaction-executor.js?v=20260927-3';
import { PannellumRendererAdapter } from './pannellum-adapter.js?v=20260927-3';
import { resolveAssetUrl } from './config.js?v=20260927-3';

const $ = (id) => document.getElementById(id);
const entryOverlay = $('entryOverlay');
const enableMotionButton = $('enableMotion');
const useTouchButton = $('useTouch');
const motionToggle = $('motionToggle');
const entryStatus = $('entryStatus');
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

function showToast(message) {
  toast.textContent = message;
  toast.hidden = false;
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => { toast.hidden = true; }, 2600);
}

function closeModal() {
  modal.hidden = true;
  modalBody.replaceChildren();
  modalActions.replaceChildren();
}

function navigate(target) {
  currentLocation = { placeRef: target.placeRef, spaceRef: target.spaceRef };
  const representation = store.representationFor(currentLocation.placeRef, currentLocation.spaceRef);
  renderer.transitionRepresentation(representation.representation_id);
  closeModal();
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

async function requestMotionLook() {
  entryStatus.textContent = 'Requesting motion access…';
  try {
    if (typeof window.DeviceOrientationEvent !== 'undefined' &&
        typeof window.DeviceOrientationEvent.requestPermission === 'function') {
      const result = await window.DeviceOrientationEvent.requestPermission();
      if (result !== 'granted') {
        entryStatus.textContent = 'Motion permission was not granted. Touch controls are still available.';
        return false;
      }
    }

    renderer.startOrientation();
    await new Promise((resolve) => window.setTimeout(resolve, 120));
    const active = renderer.isOrientationActive();
    entryStatus.textContent = active
      ? 'Motion look enabled.'
      : 'Motion data was not detected. Touch controls remain available.';
    return active;
  } catch (error) {
    console.error('Motion permission error:', error);
    entryStatus.textContent = 'Motion look could not start. Touch controls remain available.';
    return false;
  }
}

function setEntryComplete(mode) {
  entryOverlay.hidden = true;
  motionToggle.hidden = false;
  motionToggle.textContent = mode === 'motion' ? 'Motion: ON' : 'Motion: OFF';
}

enableMotionButton.addEventListener('click', async () => {
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
    motionToggle.textContent = 'Motion: OFF';
    showToast('Touch look enabled.');
  } else {
    const active = await requestMotionLook();
    motionToggle.textContent = active ? 'Motion: ON' : 'Motion: OFF';
    showToast(active ? 'Motion look enabled.' : 'Using touch look.');
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
      onError: (message) => {
        console.error('Pannellum error:', message);
        showToast('Viewer error. Please reload and try again.');
      }
    });

    renderer.initialize([...store.representations.values()], firstRepresentation.representation_id);
    entryStatus.textContent = 'Ready.';
  } catch (error) {
    console.error(error);
    entryStatus.textContent = 'Explore Brevard could not load. Please refresh and try again.';
    enableMotionButton.disabled = true;
    useTouchButton.disabled = true;
  }
}

boot();
