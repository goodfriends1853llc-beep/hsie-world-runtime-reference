export class InteractionExecutor {
  constructor({ store, topology, navigate, showAbout, showServices, openExternal }) {
    this.store = store;
    this.topology = topology;
    this.navigate = navigate;
    this.showAbout = showAbout;
    this.showServices = showServices;
    this.openExternal = openExternal;
  }

  execute(anchor, location) {
    switch (anchor.interaction_kind) {
      case 'MOVE': {
        if (anchor.target_type !== 'TOPOLOGY_CONNECTION') {
          throw new Error('MOVE anchor does not reference Topology.');
        }
        const target = this.topology.resolveTarget(anchor.target_ref);
        this.navigate(target);
        return;
      }

      case 'ABOUT': {
        if (anchor.target_type !== 'BUSINESS_PUBLIC_PROFILE') {
          throw new Error('ABOUT anchor does not reference Business public profile.');
        }
        const business = this.store.businessForPlace(location.placeRef);
        if (!business) throw new Error('No Business is associated with the current Place.');
        this.showAbout(business);
        return;
      }

      case 'SERVICES': {
        if (anchor.target_type !== 'BUSINESS_SERVICES') {
          throw new Error('SERVICES anchor does not reference Business services.');
        }
        const business = this.store.businessForPlace(location.placeRef);
        if (!business) throw new Error('No Business is associated with the current Place.');
        this.showServices(business);
        return;
      }

      case 'BOOK': {
        if (anchor.target_type !== 'BUSINESS_EXTERNAL_ACTION') {
          throw new Error('BOOK anchor does not reference a Business external action.');
        }
        this.openExternal(this.store.externalAction(anchor.target_ref));
        return;
      }

      default:
        throw new Error(`Unsupported interaction kind: ${anchor.interaction_kind}`);
    }
  }
}
