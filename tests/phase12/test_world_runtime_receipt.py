import tempfile
import unittest
from pathlib import Path

from runtime.world_runtime_receipt import (
    WORLD_RECEIPT_CLASS,
    WORLD_ISSUER,
    WorldRuntimeReceiptEngine,
    WorldRuntimeReceiptError,
)


class ReceiptCase(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.engine = WorldRuntimeReceiptEngine(Path(self.tmp.name) / "world-receipts.ndjson")

    def tearDown(self):
        self.tmp.cleanup()

    def issue(self):
        return self.engine.issue(
            request_ref="request:phase12:001",
            execution_ref="world-execution:phase12:001",
            issued_at="2026-09-27T18:45:00+00:00",
            payload_ref="business-activation:sha256:test",
            mia_execution_ref="mia-execution:test",
            mia_receipt_ref="mia-receipt:test",
            mia_proof_ref="mia-proof:test",
            activation_state_digest="sha256:activation",
            snapshot_id="snapshot:sha256:semantic",
            mia_receipt_verified=True,
            mia_proof_verified=True,
            activation_verified=True,
        )

    def test_issue_and_verify(self):
        receipt = self.issue()
        self.assertEqual(receipt["receipt_class"], WORLD_RECEIPT_CLASS)
        self.assertEqual(receipt["issuer_system"], WORLD_ISSUER)
        self.assertEqual(self.engine.verify(receipt["receipt_id"])["status"], "PASS")

    def test_world_receipt_identity_is_separate(self):
        receipt = self.issue()
        self.assertNotEqual(receipt["receipt_id"], receipt["evidence_refs"]["mia_receipt_ref"])
        self.assertTrue(receipt["receipt_id"].startswith("world-receipt:"))

    def test_identical_issue_is_idempotent(self):
        first = self.issue()
        second = self.issue()
        self.assertEqual(first, second)
        lines = Path(self.tmp.name, "world-receipts.ndjson").read_text().strip().splitlines()
        self.assertEqual(len(lines), 1)

    def test_verification_gate_required(self):
        with self.assertRaises(WorldRuntimeReceiptError):
            self.engine.issue(
                request_ref="request:x",
                execution_ref="world-execution:x",
                issued_at="2026-09-27T18:45:00+00:00",
                payload_ref="activation:x",
                mia_execution_ref="execution:x",
                mia_receipt_ref="receipt:x",
                mia_proof_ref="proof:x",
                activation_state_digest="sha256:x",
                snapshot_id="snapshot:sha256:x",
                mia_receipt_verified=False,
                mia_proof_verified=True,
                activation_verified=True,
            )

    def test_tamper_detected(self):
        receipt = self.issue()
        path = Path(self.tmp.name, "world-receipts.ndjson")
        text = path.read_text()
        path.write_text(text.replace('"verification_state": "VERIFIED"', '"verification_state": "BROKEN"'))
        self.assertEqual(self.engine.verify(receipt["receipt_id"])["status"], "FAIL")


if __name__ == "__main__":
    unittest.main(verbosity=2)
