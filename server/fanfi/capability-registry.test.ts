import test from "node:test";
import assert from "node:assert/strict";
import { getCapabilityManifest, listCapabilityManifests } from "./capability-registry";

test("mic and camera surveillance remain unavailable on ordinary iOS and Android deployments", () => {
  for (const platform of ["IOS", "ANDROID"] as const) {
    assert.equal(getCapabilityManifest(platform, "fanfi.signal.microphone_other_app")?.certification, "UNAVAILABLE");
    assert.equal(getCapabilityManifest(platform, "fanfi.signal.camera_other_app")?.certification, "UNAVAILABLE");
  }
});

test("Android network change is an active observation capability, not a compromise finding", () => {
  const manifest = getCapabilityManifest("ANDROID", "fanfi.signal.network_change");
  assert.equal(manifest?.certification, "ACTIVE");
  assert.match(manifest?.notes ?? "", /no compromise inference/i);
});

test("managed network logging never appears as an ordinary Android capability", () => {
  const manifest = getCapabilityManifest("ANDROID", "fanfi.managed.network_logging");
  assert.equal(manifest?.managedDeviceRequired, true);
  assert.equal(manifest?.implementationTier, "MANAGED_DEVICE");
});

test("capability registry remains platform-separated", () => {
  const ios = listCapabilityManifests("IOS");
  const android = listCapabilityManifests("ANDROID");
  assert.ok(ios.length > 0 && android.length > 0);
  assert.ok(ios.every((m) => m.platform === "IOS"));
  assert.ok(android.every((m) => m.platform === "ANDROID"));
});
