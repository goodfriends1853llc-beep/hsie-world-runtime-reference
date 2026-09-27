const manifestUrl = new URL('../../data/migrated/manifest.json', import.meta.url);

async function getJson(url) {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`${url.pathname} HTTP ${response.status}`);
  return response.json();
}

export class ReferenceDataStore {
  async load() {
    const manifest = await getJson(manifestUrl);
    const resolve = (rel) => new URL(rel, manifestUrl);

    const [world, places, businesses, representations, topology] = await Promise.all([
      getJson(resolve(manifest.world)),
      Promise.all(manifest.places.map((p) => getJson(resolve(p)))),
      Promise.all(manifest.businesses.map((p) => getJson(resolve(p)))),
      Promise.all(manifest.representations.map((p) => getJson(resolve(p)))),
      Promise.all(manifest.topology.map((p) => getJson(resolve(p))))
    ]);

    this.world = world;
    this.places = new Map(places.map((x) => [x.place_id, x]));
    this.businesses = new Map(businesses.map((x) => [x.business_id, x]));
    this.representations = new Map(representations.map((x) => [x.representation_id, x]));
    this.topology = new Map(topology.map((x) => [x.connection_id, x]));
    return this;
  }

  place(placeRef) {
    const value = this.places.get(placeRef);
    if (!value) throw new Error(`Unknown Place: ${placeRef}`);
    return value;
  }

  businessForPlace(placeRef) {
    return [...this.businesses.values()].find((business) => business.world_place_refs.includes(placeRef)) || null;
  }

  externalAction(actionRef) {
    for (const business of this.businesses.values()) {
      const action = business.external_actions.find((candidate) => candidate.action_id === actionRef);
      if (action) return action;
    }
    throw new Error(`Unknown external action: ${actionRef}`);
  }

  connection(connectionRef) {
    const value = this.topology.get(connectionRef);
    if (!value) throw new Error(`Unknown Topology connection: ${connectionRef}`);
    return value;
  }

  representationFor(placeRef, spaceRef = null) {
    const match = [...this.representations.values()].find(
      (representation) => representation.place_ref === placeRef && (representation.space_ref ?? null) === (spaceRef ?? null)
    );
    if (!match) throw new Error(`No Representation for ${placeRef} / ${spaceRef ?? 'root'}`);
    return match;
  }

  displayLabel(placeRef, spaceRef = null) {
    const place = this.place(placeRef);
    if (!spaceRef) return place.display_name;
    const space = place.spaces.find((candidate) => candidate.space_id === spaceRef);
    return space?.display_name || `${place.display_name} / ${spaceRef}`;
  }
}
