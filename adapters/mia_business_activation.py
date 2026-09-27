from __future__ import annotations
import hashlib
import json
import os
import tempfile
from copy import deepcopy
from pathlib import Path
from typing import Any


CAPABILITY_ID = "world.business.activation"
PROVIDER_ID = "wrb001.business.activation.local"
OPERATION = "ACTIVATE_BUSINESS_PLACE"
PUBLISH_SCHEMA = "hsie-world-publish/0.1"


class BusinessActivationError(ValueError):
    pass


def canonical_json(value: Any) -> str:
    if isinstance(value, dict):
        return "{" + ",".join(
            json.dumps(str(key), ensure_ascii=False, separators=(",", ":")) + ":" + canonical_json(value[key])
            for key in sorted(value)
        ) + "}"
    if isinstance(value, list):
        return "[" + ",".join(canonical_json(item) for item in value) + "]"
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"))


def sha256_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def sha256_obj(value: Any) -> str:
    return sha256_text(canonical_json(value))


def _read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


class ActivationCatalog:
    def __init__(self, world_root: str | Path):
        self.world_root = Path(world_root).resolve()
        self.data_root = self.world_root / "data" / "migrated"
        self.manifest = _read_json(self.data_root / "manifest.json")
        self.world = _read_json(self.data_root / self.manifest["world"])
        self.places = [_read_json(self.data_root / rel) for rel in self.manifest["places"]]
        self.businesses = [_read_json(self.data_root / rel) for rel in self.manifest["businesses"]]
        self.representations = [_read_json(self.data_root / rel) for rel in self.manifest["representations"]]
        self.topology = [_read_json(self.data_root / rel) for rel in self.manifest["topology"]]

    def semantic_payload(self) -> dict[str, Any]:
        return {
            "schema_version": PUBLISH_SCHEMA,
            "world": deepcopy(self.world),
            "places": sorted(deepcopy(self.places), key=lambda item: item["place_id"]),
            "businesses": sorted(deepcopy(self.businesses), key=lambda item: item["business_id"]),
            "representations": sorted(deepcopy(self.representations), key=lambda item: item["representation_id"]),
            "topology": sorted(deepcopy(self.topology), key=lambda item: item["connection_id"]),
        }

    @property
    def content_digest(self) -> str:
        return "sha256:" + sha256_obj(self.semantic_payload())

    @property
    def snapshot_id(self) -> str:
        return "snapshot:" + self.content_digest

    def business(self, business_id: str) -> dict[str, Any]:
        for business in self.businesses:
            if business["business_id"] == business_id:
                return business
        raise BusinessActivationError(f"unknown Business: {business_id}")

    def place(self, place_id: str) -> dict[str, Any]:
        for place in self.places:
            if place["place_id"] == place_id:
                return place
        raise BusinessActivationError(f"unknown Place: {place_id}")

    def representation_map(self) -> dict[str, dict[str, Any]]:
        return {item["representation_id"]: item for item in self.representations}

    def verify_activation_preconditions(self, business_id: str, place_id: str, snapshot_id: str) -> dict[str, Any]:
        if snapshot_id != self.snapshot_id:
            raise BusinessActivationError(
                f"snapshot mismatch: expected {self.snapshot_id}, got {snapshot_id}"
            )

        business = self.business(business_id)
        place = self.place(place_id)

        if business.get("status") != "CANDIDATE":
            raise BusinessActivationError(f"Business is not activation-eligible CANDIDATE: {business.get('status')}")
        if place.get("status") != "ACTIVE":
            raise BusinessActivationError(f"Place is not ACTIVE: {place.get('status')}")
        if place.get("public_visibility") != "PUBLIC":
            raise BusinessActivationError("Place is not PUBLIC")
        if place_id not in business.get("world_place_refs", []):
            raise BusinessActivationError("Business does not reference target Place")

        provenance = business.get("provenance") or {}
        for field in ("source_system", "source_schema", "source_commit"):
            if not provenance.get(field):
                raise BusinessActivationError(f"Business provenance missing {field}")

        representation_refs = list(place.get("representation_refs", []))
        for space in place.get("spaces", []):
            representation_refs.extend(space.get("representation_refs", []))
        representation_refs = sorted(set(representation_refs))
        if not representation_refs:
            raise BusinessActivationError("Place has no Representation references")

        reps = self.representation_map()
        for representation_ref in representation_refs:
            representation = reps.get(representation_ref)
            if not representation:
                raise BusinessActivationError(f"missing Representation: {representation_ref}")
            if representation.get("place_ref") != place_id:
                raise BusinessActivationError(f"Representation targets wrong Place: {representation_ref}")
            if not representation.get("integrity_digest"):
                raise BusinessActivationError(f"Representation integrity digest missing: {representation_ref}")

        return {
            "business_id": business_id,
            "place_id": place_id,
            "business_version": business.get("version"),
            "place_version": place.get("version"),
            "representation_refs": representation_refs,
            "business_provenance": provenance,
            "snapshot_id": self.snapshot_id,
            "content_digest": self.content_digest,
            "verification_state": "VERIFIED",
        }


class BusinessActivationProvider:
    provider_id = PROVIDER_ID

    def __init__(self, *, world_root: str | Path, state_path: str | Path):
        self.catalog = ActivationCatalog(world_root)
        self.state_path = Path(state_path).resolve()

    def _load_state(self) -> dict[str, Any]:
        if not self.state_path.exists():
            return {
                "schema_version": "wrb001.business-activation-state/0.1",
                "activations": {},
            }
        value = _read_json(self.state_path)
        if value.get("schema_version") != "wrb001.business-activation-state/0.1":
            raise BusinessActivationError("activation state schema mismatch")
        if not isinstance(value.get("activations"), dict):
            raise BusinessActivationError("activation state is malformed")
        return value

    def _write_state(self, value: dict[str, Any]) -> None:
        self.state_path.parent.mkdir(parents=True, exist_ok=True)
        fd, tmp_name = tempfile.mkstemp(prefix=self.state_path.name + ".", suffix=".tmp", dir=self.state_path.parent)
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as handle:
                json.dump(value, handle, ensure_ascii=False, sort_keys=True, indent=2)
                handle.write("\n")
                handle.flush()
                os.fsync(handle.fileno())
            os.replace(tmp_name, self.state_path)
        finally:
            if os.path.exists(tmp_name):
                os.unlink(tmp_name)

    def invoke(self, operation: str, payload: dict[str, Any], context: dict[str, Any]) -> dict[str, Any]:
        if operation != OPERATION:
            raise BusinessActivationError(f"unsupported operation {operation}")
        if not isinstance(payload, dict):
            raise BusinessActivationError("activation payload must be an object")

        business_id = payload.get("business_id")
        place_id = payload.get("place_id")
        snapshot_id = payload.get("snapshot_id")
        if not all(isinstance(value, str) and value for value in (business_id, place_id, snapshot_id)):
            raise BusinessActivationError("business_id, place_id, and snapshot_id are required")

        preconditions = self.catalog.verify_activation_preconditions(business_id, place_id, snapshot_id)
        activation_key = business_id + "|" + place_id
        activation_seed = {
            "business_id": business_id,
            "place_id": place_id,
            "snapshot_id": snapshot_id,
        }
        activation_id = "business-activation:sha256:" + sha256_obj(activation_seed)

        state = self._load_state()
        existing = state["activations"].get(activation_key)
        if existing:
            if (
                existing.get("activation_id") != activation_id
                or existing.get("snapshot_id") != snapshot_id
                or existing.get("status") != "ACTIVE"
            ):
                raise BusinessActivationError("conflicting existing activation state")
            return {
                **deepcopy(existing),
                "changed": False,
                "verification_state": "VERIFIED",
                "effect_class": "LOCAL_REFERENCE_STATE_WRITE",
                "state_digest": "sha256:" + sha256_obj(state),
            }

        activation = {
            "activation_id": activation_id,
            "business_id": business_id,
            "place_id": place_id,
            "snapshot_id": snapshot_id,
            "content_digest": preconditions["content_digest"],
            "status": "ACTIVE",
            "business_version": preconditions["business_version"],
            "place_version": preconditions["place_version"],
            "representation_refs": preconditions["representation_refs"],
            "business_provenance": preconditions["business_provenance"],
        }
        state["activations"][activation_key] = activation
        self._write_state(state)

        readback = self._load_state()
        if readback["activations"].get(activation_key) != activation:
            raise BusinessActivationError("activation state readback verification failed")

        return {
            **deepcopy(activation),
            "changed": True,
            "verification_state": "VERIFIED",
            "effect_class": "LOCAL_REFERENCE_STATE_WRITE",
            "state_digest": "sha256:" + sha256_obj(readback),
        }
