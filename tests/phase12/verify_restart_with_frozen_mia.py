from __future__ import annotations
import hashlib
import json
import os
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

MIA_HOME = os.environ.get("MIA_RUNTIME_HOME")
MIA_ZIP = os.environ.get("MIA_RUNTIME_ZIP")
if not MIA_HOME or not MIA_ZIP:
    raise SystemExit("MIA_RUNTIME_HOME and MIA_RUNTIME_ZIP are required")

mia_home = Path(MIA_HOME).resolve()
mia_zip = Path(MIA_ZIP).resolve()
sys.path.insert(0, str(mia_home))

from mia_runtime import MIARuntime, MIAAPI
from mia_runtime.capabilities import CapabilityContract
from adapters.mia_business_activation import (
    BusinessActivationProvider,
    CAPABILITY_ID,
    OPERATION,
    PROVIDER_ID,
)
from adapters.mia_execution_port import MiaExecutionPort
from runtime.world_runtime_receipt import WorldRuntimeReceiptEngine

EXPECTED_MIA_SHA256 = "ac6fecd1458c8a6596ba5998ec63d461566196792d022b7d19db021b9d71405a"
EXPECTED_SNAPSHOT = "snapshot:sha256:c0b8b8cf841c02112452a82ff256d9786f76a3f567a072ab4b4f37921d678991"


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


assert sha256_file(mia_zip) == EXPECTED_MIA_SHA256

with tempfile.TemporaryDirectory() as td:
    td = Path(td)
    db_path = td / "mia.db"
    activation_path = td / "business-activation-state.json"
    world_receipt_path = td / "world-receipts.ndjson"
    registry_path = ROOT / "adapters/mia/registry/wrb001-phase11-runtime-registry.json"

    runtime = MIARuntime(db_path, registry_path)
    provider = BusinessActivationProvider(world_root=ROOT, state_path=activation_path)
    runtime.gateway.register(
        CapabilityContract(CAPABILITY_ID, PROVIDER_ID, "DETERMINISTIC", "WRITE"),
        provider,
    )
    api = MIAAPI(runtime)
    port = MiaExecutionPort(api, no_consent_operations={OPERATION})

    caller = api.create_entity("SERVICE", "WRB-001 World Runtime")
    actor = api.create_entity("OPERATOR", "WRB-001 Operator")
    subject = api.create_entity("BUSINESS", "Lagoon Cuts Demo Business")
    authority = api.grant_authority(
        actor["id"],
        basis="WRB-001 Phase 12 restart proof",
        powers=[OPERATION],
        scope=[subject["id"]],
        actor_id=actor["id"],
    )

    request = {
        "request_id": "request:phase12:activate-business-place:001",
        "runtime_id": "MIA-RUNTIME-v1",
        "caller_id": caller["id"],
        "actor_id": actor["id"],
        "subject_id": subject["id"],
        "operation": OPERATION,
        "purpose": "activate_business_place",
        "scope": [subject["id"]],
        "requested_effect": {
            "business_id": "business:lagoon-cuts",
            "place_id": "place:lagoon-cuts-demo",
            "status": "ACTIVE",
        },
        "input": {
            "business_id": "business:lagoon-cuts",
            "place_id": "place:lagoon-cuts-demo",
            "snapshot_id": EXPECTED_SNAPSHOT,
        },
        "evidence_refs": [],
        "authority_refs": [authority["id"]],
        "consent_refs": [],
        "policy_context": {},
        "requested_capabilities": [CAPABILITY_ID],
        "requested_provider": None,
        "event_time": None,
        "submitted_at": "2026-09-27T18:45:00+00:00",
        "trace_id": "trace:phase12:activate-business-place:001",
        "requires_consent": False,
    }

    mia_result = port.execute(request)
    assert mia_result.mia_status == "PASS"
    assert api.verify_receipt(mia_result.mia_receipt_ref)["status"] == "PASS"
    assert api.verify_proof(mia_result.mia_proof_ref)["status"] == "PASS"

    executions = [
        item for item in runtime.store.list("execution")
        if item["payload"].get("execution_id") == mia_result.execution_id
    ]
    execution_record = executions[-1]
    effect = runtime.store.get(execution_record["payload"]["effect_ref"])
    observed = effect["payload"]["observed_effect"]
    assert observed["verification_state"] == "VERIFIED"

    world_execution_ref = "world-execution:sha256:" + hashlib.sha256(
        (request["request_id"] + "|" + mia_result.execution_id).encode("utf-8")
    ).hexdigest()

    world_receipts = WorldRuntimeReceiptEngine(world_receipt_path)
    world_receipt = world_receipts.issue(
        request_ref=request["request_id"],
        execution_ref=world_execution_ref,
        issued_at="2026-09-27T18:46:00+00:00",
        payload_ref=observed["activation_id"],
        mia_execution_ref=mia_result.execution_id,
        mia_receipt_ref=mia_result.mia_receipt_ref,
        mia_proof_ref=mia_result.mia_proof_ref,
        activation_state_digest=observed["state_digest"],
        snapshot_id=observed["snapshot_id"],
        mia_receipt_verified=True,
        mia_proof_verified=True,
        activation_verified=True,
    )

    assert world_receipts.verify(world_receipt["receipt_id"])["status"] == "PASS"
    assert world_receipt["receipt_id"] != mia_result.mia_receipt_ref
    activation_before = json.loads(activation_path.read_text(encoding="utf-8"))
    activation_file_hash_before = sha256_file(activation_path)
    world_receipt_file_hash_before = sha256_file(world_receipt_path)

    runtime.close()

    # Restart the exact same frozen MIA runtime against the same DB/registry and
    # re-register the same World-owned capability for the new process.
    restarted = MIARuntime(db_path, registry_path)
    restarted_provider = BusinessActivationProvider(world_root=ROOT, state_path=activation_path)
    restarted.gateway.register(
        CapabilityContract(CAPABILITY_ID, PROVIDER_ID, "DETERMINISTIC", "WRITE"),
        restarted_provider,
    )
    restarted_api = MIAAPI(restarted)

    receipt_after = restarted_api.verify_receipt(mia_result.mia_receipt_ref)
    proof_after = restarted_api.verify_proof(mia_result.mia_proof_ref)
    replay_after = restarted_api.replay(mia_result.execution_id)
    health_after = restarted_api.health()

    assert receipt_after["status"] == "PASS"
    assert proof_after["status"] == "PASS"
    assert replay_after["status"] == "PASS"
    assert health_after["store_integrity"]["status"] == "PASS"

    activation_after = json.loads(activation_path.read_text(encoding="utf-8"))
    assert activation_after == activation_before
    assert sha256_file(activation_path) == activation_file_hash_before

    reopened_world_receipts = WorldRuntimeReceiptEngine(world_receipt_path)
    world_verify_after = reopened_world_receipts.verify(world_receipt["receipt_id"])
    assert world_verify_after["status"] == "PASS"
    assert sha256_file(world_receipt_path) == world_receipt_file_hash_before

    idempotent_effect = restarted_provider.invoke(
        OPERATION,
        {
            "business_id": "business:lagoon-cuts",
            "place_id": "place:lagoon-cuts-demo",
            "snapshot_id": EXPECTED_SNAPSHOT,
        },
        {},
    )
    assert idempotent_effect["changed"] is False
    assert idempotent_effect["activation_id"] == observed["activation_id"]

    print(json.dumps({
        "result": "PASS",
        "frozen_mia_zip_sha256": EXPECTED_MIA_SHA256,
        "mia_request_id": request["request_id"],
        "mia_execution_id": mia_result.execution_id,
        "mia_receipt_ref": mia_result.mia_receipt_ref,
        "mia_receipt_after_restart": receipt_after["status"],
        "mia_proof_ref": mia_result.mia_proof_ref,
        "mia_proof_after_restart": proof_after["status"],
        "mia_replay_after_restart": replay_after["status"],
        "mia_store_integrity_after_restart": health_after["store_integrity"]["status"],
        "world_receipt_id": world_receipt["receipt_id"],
        "world_receipt_class": world_receipt["receipt_class"],
        "world_receipt_after_restart": world_verify_after["status"],
        "world_receipt_distinct_from_mia_receipt": world_receipt["receipt_id"] != mia_result.mia_receipt_ref,
        "activation_id": observed["activation_id"],
        "activation_state_preserved_after_restart": True,
        "activation_state_file_sha256": activation_file_hash_before,
        "world_receipt_journal_sha256": world_receipt_file_hash_before,
        "idempotent_activation_readback_changed": idempotent_effect["changed"],
        "snapshot_id": observed["snapshot_id"]
    }, indent=2))

    restarted.close()
