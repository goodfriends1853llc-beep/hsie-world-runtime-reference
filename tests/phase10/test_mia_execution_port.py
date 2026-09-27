import unittest
from adapters.mia_execution_port import (
    EXPECTED_RUNTIME_ID,
    MiaExecutionPort,
    PortPhaseBoundaryError,
    PortRuntimeMismatch,
    PortValidationError,
)


class FakeMIAAPI:
    def __init__(self):
        self.calls = []
        self.runtime_id = EXPECTED_RUNTIME_ID

    def health(self):
        return {"runtime_id": self.runtime_id, "store_integrity": {"status": "PASS"}}

    def execute(self, request):
        self.calls.append(request)
        return {
            "status": "PASS",
            "terminal_state": "COMPLETED",
            "request_id": request["request_id"],
            "execution_id": "execution:stub:001",
            "receipt_id": "receipt:mia:stub:001",
            "proof_id": "proof:mia:stub:001",
            "output": {"ok": True},
        }


def governed_request():
    return {
        "request_id": "request:phase10:001",
        "runtime_id": EXPECTED_RUNTIME_ID,
        "caller_id": "caller:world-runtime",
        "actor_id": "actor:test",
        "subject_id": "subject:test",
        "operation": "analyze",
        "purpose": "phase10_port_test",
        "scope": ["subject:test"],
        "requested_effect": {},
        "input": {},
        "evidence_refs": [],
        "authority_refs": ["authority:test"],
        "consent_refs": ["consent:test"],
        "policy_context": {},
        "requested_capabilities": ["model.sim.a"],
        "requested_provider": None,
        "event_time": None,
        "submitted_at": "2026-09-27T18:15:00+00:00",
        "trace_id": "trace:phase10:001",
    }


class PortCase(unittest.TestCase):
    def setUp(self):
        self.api = FakeMIAAPI()
        self.port = MiaExecutionPort(self.api)

    def test_valid_mapping_preserves_canonical_and_adds_aliases(self):
        req = governed_request()
        mapped = self.port.map_request(req)
        self.assertEqual(mapped["caller_id"], req["caller_id"])
        self.assertEqual(mapped["runtime_id"], EXPECTED_RUNTIME_ID)
        self.assertEqual(mapped["authority_refs"], req["authority_refs"])
        self.assertEqual(mapped["consent_refs"], req["consent_refs"])
        self.assertEqual(mapped["requested_capabilities"], req["requested_capabilities"])
        self.assertEqual(mapped["authority_id"], "authority:test")
        self.assertEqual(mapped["consent_id"], "consent:test")
        self.assertEqual(mapped["capability_id"], "model.sim.a")

    def test_execute_returns_mia_refs_without_world_receipt(self):
        result = self.port.execute(governed_request()).as_dict()
        self.assertEqual(result["mia_receipt_ref"], "receipt:mia:stub:001")
        self.assertNotIn("world_runtime_receipt", result)
        self.assertEqual(len(self.api.calls), 1)

    def test_wrong_requested_runtime_rejected_before_execute(self):
        req = governed_request()
        req["runtime_id"] = "WRONG"
        with self.assertRaises(PortRuntimeMismatch):
            self.port.execute(req)
        self.assertEqual(self.api.calls, [])

    def test_wrong_connected_runtime_rejected_before_execute(self):
        self.api.runtime_id = "WRONG"
        with self.assertRaises(PortRuntimeMismatch):
            self.port.execute(governed_request())
        self.assertEqual(self.api.calls, [])

    def test_missing_caller_rejected(self):
        req = governed_request()
        req["caller_id"] = ""
        with self.assertRaises(PortValidationError):
            self.port.execute(req)
        self.assertEqual(self.api.calls, [])

    def test_multiple_authorities_rejected(self):
        req = governed_request()
        req["authority_refs"] = ["authority:a", "authority:b"]
        with self.assertRaises(PortValidationError):
            self.port.execute(req)

    def test_multiple_capabilities_rejected(self):
        req = governed_request()
        req["requested_capabilities"] = ["model.sim.a", "model.sim.b"]
        with self.assertRaises(PortValidationError):
            self.port.execute(req)

    def test_multiple_consents_rejected(self):
        req = governed_request()
        req["consent_refs"] = ["consent:a", "consent:b"]
        with self.assertRaises(PortValidationError):
            self.port.execute(req)

    def test_nonempty_policy_context_rejected(self):
        req = governed_request()
        req["policy_context"] = {"policy": "caller-supplied"}
        with self.assertRaises(PortValidationError):
            self.port.execute(req)

    def test_requested_provider_rejected(self):
        req = governed_request()
        req["requested_provider"] = "model.sim.a"
        with self.assertRaises(PortValidationError):
            self.port.execute(req)

    def test_activate_business_place_blocked_in_phase10(self):
        req = governed_request()
        req["operation"] = "ACTIVATE_BUSINESS_PLACE"
        with self.assertRaises(PortPhaseBoundaryError):
            self.port.execute(req)
        self.assertEqual(self.api.calls, [])


if __name__ == "__main__":
    unittest.main(verbosity=2)
