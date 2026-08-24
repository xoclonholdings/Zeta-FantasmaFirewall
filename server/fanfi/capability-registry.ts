import type { FanfiPlatform } from "./contracts";

export type CapabilityCertification = "ACTIVE" | "PROVISIONAL" | "VERIFY_REQUIRED" | "UNAVAILABLE";
export type CapabilityManifest = {
  capability: string;
  platform: FanfiPlatform;
  implementationTier: "DIRECT" | "NATIVE_COMPANION" | "PROVIDER" | "MANAGED_DEVICE" | "UNAVAILABLE" | "VERIFY_REQUIRED";
  certification: CapabilityCertification;
  minimumOs?: string;
  permissions: string[];
  managedDeviceRequired: boolean;
  sideEffectClass: "NONE" | "IDEMPOTENT" | "NON_IDEMPOTENT";
  reversibility: "REVERSIBLE" | "CONDITIONAL" | "IRREVERSIBLE";
  approvalRequired: boolean;
  verificationMethod: string;
  notes: string;
};

const manifests: CapabilityManifest[] = [
  { capability: "fanfi.trigger.manual", platform: "IOS", implementationTier: "DIRECT", certification: "ACTIVE", permissions: [], managedDeviceRequired: false, sideEffectClass: "NONE", reversibility: "REVERSIBLE", approvalRequired: false, verificationMethod: "trigger receipt", notes: "Shortcuts/App Intents activation only." },
  { capability: "fanfi.trigger.manual", platform: "ANDROID", implementationTier: "NATIVE_COMPANION", certification: "ACTIVE", permissions: [], managedDeviceRequired: false, sideEffectClass: "NONE", reversibility: "REVERSIBLE", approvalRequired: false, verificationMethod: "trigger receipt", notes: "Native companion activation only." },
  { capability: "fanfi.signal.network_change", platform: "IOS", implementationTier: "NATIVE_COMPANION", certification: "PROVISIONAL", permissions: [], managedDeviceRequired: false, sideEffectClass: "NONE", reversibility: "REVERSIBLE", approvalRequired: false, verificationMethod: "authorized adapter observation", notes: "Only observable network state; no compromise inference." },
  { capability: "fanfi.signal.network_change", platform: "ANDROID", implementationTier: "NATIVE_COMPANION", certification: "ACTIVE", permissions: ["ACCESS_NETWORK_STATE"], managedDeviceRequired: false, sideEffectClass: "NONE", reversibility: "REVERSIBLE", approvalRequired: false, verificationMethod: "ConnectivityManager.NetworkCallback", notes: "Network transition only; identifiers minimized." },
  { capability: "fanfi.signal.app_usage", platform: "IOS", implementationTier: "UNAVAILABLE", certification: "UNAVAILABLE", permissions: [], managedDeviceRequired: false, sideEffectClass: "NONE", reversibility: "REVERSIBLE", approvalRequired: false, verificationMethod: "none", notes: "No generic other-app runtime inspection." },
  { capability: "fanfi.signal.app_usage", platform: "ANDROID", implementationTier: "NATIVE_COMPANION", certification: "PROVISIONAL", permissions: ["PACKAGE_USAGE_STATS_SPECIAL_ACCESS"], managedDeviceRequired: false, sideEffectClass: "NONE", reversibility: "REVERSIBLE", approvalRequired: false, verificationMethod: "UsageStatsManager with user-granted usage access", notes: "Usage history only; not malware detection or unrestricted process inspection." },
  { capability: "fanfi.signal.microphone_other_app", platform: "IOS", implementationTier: "UNAVAILABLE", certification: "UNAVAILABLE", permissions: [], managedDeviceRequired: false, sideEffectClass: "NONE", reversibility: "REVERSIBLE", approvalRequired: false, verificationMethod: "none", notes: "Must report UNAVAILABLE." },
  { capability: "fanfi.signal.microphone_other_app", platform: "ANDROID", implementationTier: "UNAVAILABLE", certification: "UNAVAILABLE", permissions: [], managedDeviceRequired: false, sideEffectClass: "NONE", reversibility: "REVERSIBLE", approvalRequired: false, verificationMethod: "none", notes: "Normal app has no unrestricted system-wide microphone surveillance authority." },
  { capability: "fanfi.signal.camera_other_app", platform: "IOS", implementationTier: "UNAVAILABLE", certification: "UNAVAILABLE", permissions: [], managedDeviceRequired: false, sideEffectClass: "NONE", reversibility: "REVERSIBLE", approvalRequired: false, verificationMethod: "none", notes: "Must report UNAVAILABLE." },
  { capability: "fanfi.signal.camera_other_app", platform: "ANDROID", implementationTier: "UNAVAILABLE", certification: "UNAVAILABLE", permissions: [], managedDeviceRequired: false, sideEffectClass: "NONE", reversibility: "REVERSIBLE", approvalRequired: false, verificationMethod: "none", notes: "Privacy indicators do not grant FanFI unrestricted cross-app telemetry." },
  { capability: "fanfi.signal.system_logs", platform: "IOS", implementationTier: "UNAVAILABLE", certification: "UNAVAILABLE", permissions: [], managedDeviceRequired: false, sideEffectClass: "NONE", reversibility: "REVERSIBLE", approvalRequired: false, verificationMethod: "none", notes: "Only specifically authorized imported/provider evidence may be consumed." },
  { capability: "fanfi.signal.system_logs", platform: "ANDROID", implementationTier: "UNAVAILABLE", certification: "UNAVAILABLE", permissions: [], managedDeviceRequired: false, sideEffectClass: "NONE", reversibility: "REVERSIBLE", approvalRequired: false, verificationMethod: "none", notes: "No unrestricted generic system-log access for an ordinary app." },
  { capability: "fanfi.flux.vpn", platform: "IOS", implementationTier: "PROVIDER", certification: "PROVISIONAL", permissions: ["VPN_PROVIDER_CONFIGURATION"], managedDeviceRequired: false, sideEffectClass: "IDEMPOTENT", reversibility: "REVERSIBLE", approvalRequired: true, verificationMethod: "provider-reported VPN state plus adapter observation", notes: "Requires configured approved VPN/Network Extension provider." },
  { capability: "fanfi.flux.vpn", platform: "ANDROID", implementationTier: "NATIVE_COMPANION", certification: "PROVISIONAL", permissions: ["VPN_USER_CONSENT"], managedDeviceRequired: false, sideEffectClass: "IDEMPOTENT", reversibility: "REVERSIBLE", approvalRequired: true, verificationMethod: "FanFI VpnService established-state observation", notes: "Requires user consent and foreground-service compliance." },
  { capability: "fanfi.managed.network_logging", platform: "ANDROID", implementationTier: "MANAGED_DEVICE", certification: "PROVISIONAL", permissions: ["DEVICE_OR_PROFILE_OWNER_OR_DELEGATION"], managedDeviceRequired: true, sideEffectClass: "NONE", reversibility: "REVERSIBLE", approvalRequired: false, verificationMethod: "DevicePolicyManager/delegated network-log receipt", notes: "Coverage has documented gaps; absence of an event is not proof of no traffic." },
  { capability: "fanfi.managed.network_logging", platform: "IOS", implementationTier: "MANAGED_DEVICE", certification: "VERIFY_REQUIRED", permissions: ["MDM_ENROLLMENT"], managedDeviceRequired: true, sideEffectClass: "NONE", reversibility: "REVERSIBLE", approvalRequired: false, verificationMethod: "approved MDM/provider response", notes: "Exact implementation must be certified before activation." },
];

export const getCapabilityManifest = (platform: FanfiPlatform, capability: string) => manifests.find((m) => m.platform === platform && m.capability === capability);
export const listCapabilityManifests = (platform?: FanfiPlatform) => platform ? manifests.filter((m) => m.platform === platform) : [...manifests];
