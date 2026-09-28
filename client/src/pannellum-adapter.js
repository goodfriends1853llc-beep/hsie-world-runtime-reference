const ICONS = {
  MOVE: '➜',
  ABOUT: 'ⓘ',
  SERVICES: '≡',
  FOUNDING: '★',
  BOOK: '↗',
  MESSAGE: '✉',
  LINK: '↗'
};

function iconForAnchor(anchor) {
  const label = (anchor.label || '').toLowerCase();

  if (anchor.interaction_kind === 'MOVE' && label.includes('back')) return '↩';
  if (label.includes('lagoon') || label.includes('moonlit')) return '☾';
  if (label.includes('about')) return 'ⓘ';
  if (label.includes('founding') || label.includes('business directory')) return '★';
  if (label.includes('book') || label.includes('appointment')) return '↗';
  if (label.includes('message') || label.includes('contact')) return '✉';
  if (label.includes('shop')) return '◈';
  if (label.includes('dine') || label.includes('food')) return '◉';
  if (label.includes('event')) return '✦';
  if (label.includes('service')) return '≡';

  return ICONS[anchor.interaction_kind] || '•';
}

export class PannellumRendererAdapter {
  constructor({ containerId, resolveAssetUrl, onInteraction, onSceneChange, onError }) {
    this.containerId = containerId;
    this.resolveAssetUrl = resolveAssetUrl;
    this.onInteraction = onInteraction;
    this.onSceneChange = onSceneChange;
    this.onError = onError;
    this.viewer = null;
  }

  buildHotspotElement(hotSpotDiv, args) {
    hotSpotDiv.setAttribute('role', 'button');
    hotSpotDiv.setAttribute('tabindex', '0');
    hotSpotDiv.setAttribute('aria-label', args.label);

    const button = document.createElement('div');
    button.className = 'hs-icon-button';
    button.setAttribute('aria-hidden', 'true');

    const icon = document.createElement('span');
    icon.className = 'hs-icon';
    icon.textContent = iconForAnchor(args.anchor);

    button.appendChild(icon);
    hotSpotDiv.appendChild(button);

    hotSpotDiv.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.onInteraction(args.anchor);
      }
    });
  }

  sceneConfig(representation) {
    const presentation = representation.presentation;
    return {
      type: 'equirectangular',
      panorama: this.resolveAssetUrl(representation.asset_ref),
      pitch: presentation.initial_view.pitch,
      yaw: presentation.initial_view.yaw,
      hfov: presentation.initial_view.hfov,
      northOffset: presentation.initial_view.north_offset,
      hotSpots: presentation.interaction_anchors.map((anchor) => ({
        pitch: anchor.pitch,
        yaw: anchor.yaw,
        type: 'info',
        cssClass: 'brevard-hotspot',
        createTooltipFunc: (div, args) => this.buildHotspotElement(div, args),
        createTooltipArgs: {
          anchor,
          interactionKind: anchor.interaction_kind,
          label: anchor.label
        },
        clickHandlerFunc: () => this.onInteraction(anchor)
      }))
    };
  }

  initialize(representations, firstRepresentationId) {
    const scenes = {};
    for (const representation of representations) {
      scenes[representation.representation_id] = this.sceneConfig(representation);
    }

    this.viewer = pannellum.viewer(this.containerId, {
      default: {
        firstScene: firstRepresentationId,
        autoLoad: true,
        sceneFadeDuration: 700,
        orientationOnByDefault: false,
        showZoomCtrl: false,
        showFullscreenCtrl: true,
        compass: false,
        friction: 0.18,
        escapeHTML: true
      },
      scenes
    });

    this.viewer.on('scenechange', (sceneId) => this.onSceneChange?.(sceneId));
    this.viewer.on('error', (message) => this.onError?.(message));
  }

  transitionRepresentation(representationId) {
    if (!this.viewer) throw new Error('Renderer has not been initialized.');
    this.viewer.loadScene(representationId);
  }

  startOrientation() { this.viewer?.startOrientation(); }
  stopOrientation() { this.viewer?.stopOrientation(); }
  isOrientationActive() { return Boolean(this.viewer?.isOrientationActive()); }
}
