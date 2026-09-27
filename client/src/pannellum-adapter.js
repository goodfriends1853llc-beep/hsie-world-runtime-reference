const ICONS = {
  MOVE: '↑',
  ABOUT: 'ℹ',
  SERVICES: '✂',
  BOOK: '↗'
};

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

    const pill = document.createElement('div');
    pill.className = 'hs-pill';

    const icon = document.createElement('span');
    icon.className = 'hs-icon';
    icon.textContent = ICONS[args.interactionKind] || '•';

    const label = document.createElement('span');
    label.textContent = args.label;

    pill.append(icon, label);
    hotSpotDiv.appendChild(pill);

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

  startOrientation() {
    this.viewer?.startOrientation();
  }

  stopOrientation() {
    this.viewer?.stopOrientation();
  }

  isOrientationActive() {
    return Boolean(this.viewer?.isOrientationActive());
  }
}
