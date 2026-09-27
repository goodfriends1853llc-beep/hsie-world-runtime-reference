export class TopologyResolver {
  constructor(store) {
    this.store = store;
  }

  resolveTarget(connectionRef) {
    const connection = this.store.connection(connectionRef);
    if (connection.status !== 'ACTIVE') {
      throw new Error(`Topology connection is not active: ${connectionRef}`);
    }

    return {
      connection,
      placeRef: connection.target_place_ref,
      spaceRef: connection.target_space_ref ?? null
    };
  }
}
