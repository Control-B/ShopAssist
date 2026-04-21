"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Badge,
  Banner,
  BlockStack,
  Box,
  Button,
  Card,
  Divider,
  InlineGrid,
  InlineStack,
  Spinner,
  Text,
  TextField,
} from "@shopify/polaris";

type ConnectionStatusResponse = {
  shopify: {
    shop: string;
    authenticated: boolean;
    sessionId: string | null;
    shopRecordExists: boolean;
    assistantEnabled: boolean;
    externalConnectionStatus: string;
  };
  omniweb: {
    configured: boolean;
    engineReachable: boolean;
    livekitTokenReady: boolean;
    defaultApiBaseUrl: string | null;
    apiBaseUrl: string | null;
    externalClientId: string | null;
    clerkUserId: string | null;
    livekitAgentName: string | null;
    connectionStatus: string;
    lastHealthCheckAt: string | null;
    lastError: string | null;
    readiness: {
      ok: boolean;
      service?: string;
      database_ok?: boolean;
      database_error?: string;
    } | null;
    profile: {
      client_id: string;
      name: string;
      email: string;
      plan: string;
      role: string;
      business_name?: string | null;
      business_type?: string | null;
    } | null;
  };
};

type BannerState = {
  tone: "success" | "info" | "warning" | "critical";
  message: string;
};

type ConnectionDashboardProps = {
  initialShop: string;
};

function getStatusTone(status: string): "success" | "warning" | "attention" | "critical" | "info" {
  switch (status) {
    case "CONNECTED":
      return "success";
    case "DEGRADED":
      return "warning";
    case "ERROR":
      return "critical";
    case "CONNECTING":
      return "attention";
    default:
      return "info";
  }
}

export function ConnectionDashboard({ initialShop }: ConnectionDashboardProps) {
  const shop = initialShop.trim();

  const [status, setStatus] = useState<ConnectionStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [requestingLivekitToken, setRequestingLivekitToken] = useState(false);
  const [banner, setBanner] = useState<BannerState | null>(null);
  const [livekitPreview, setLivekitPreview] = useState<{
    room_name: string;
    livekit_url: string;
  } | null>(null);
  const [form, setForm] = useState({
    apiBaseUrl: "",
    apiKey: "",
    clientId: "",
    clerkUserId: "",
    livekitAgentName: "Kai-d15",
  });

  const hydrateForm = useCallback((payload: ConnectionStatusResponse) => {
    setForm((current) => ({
      apiBaseUrl:
        current.apiBaseUrl ||
        payload.omniweb.apiBaseUrl ||
        payload.omniweb.defaultApiBaseUrl ||
        "",
      apiKey: current.apiKey,
      clientId: current.clientId || payload.omniweb.externalClientId || "",
      clerkUserId: current.clerkUserId || payload.omniweb.clerkUserId || "",
      livekitAgentName:
        current.livekitAgentName || payload.omniweb.livekitAgentName || "Kai-d15",
    }));
  }, []);

  const loadStatus = useCallback(async () => {
    if (!shop) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/connection/status?shop=${encodeURIComponent(shop)}`, {
        cache: "no-store",
      });
      const payload = (await response.json()) as ConnectionStatusResponse | { error: string };

      if (!response.ok || "error" in payload) {
        throw new Error("error" in payload ? payload.error : "Failed to load connection status.");
      }

      setStatus(payload);
      hydrateForm(payload);
    } catch (error) {
      setBanner({
        tone: "critical",
        message: error instanceof Error ? error.message : "Failed to load connection status.",
      });
    } finally {
      setLoading(false);
    }
  }, [hydrateForm, shop]);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const canSubmit = useMemo(() => {
    return Boolean(shop && form.apiBaseUrl.trim() && form.apiKey.trim());
  }, [form.apiBaseUrl, form.apiKey, shop]);

  async function handleSaveConnection() {
    if (!canSubmit) {
      setBanner({ tone: "warning", message: "Shop, Omniweb base URL, and API key are required." });
      return;
    }

    setSaving(true);
    setBanner(null);

    try {
      const response = await fetch("/api/connection/link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shop,
          apiBaseUrl: form.apiBaseUrl.trim(),
          apiKey: form.apiKey.trim(),
          clientId: form.clientId.trim() || undefined,
          clerkUserId: form.clerkUserId.trim() || undefined,
          livekitAgentName: form.livekitAgentName.trim() || undefined,
        }),
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to link Omniweb connection.");
      }

      setForm((current) => ({ ...current, apiKey: "" }));
      setBanner({
        tone: "success",
        message: "Omniweb engine linked. Shopify can now call the engine and request LiveKit sessions.",
      });
      await loadStatus();
    } catch (error) {
      setBanner({
        tone: "critical",
        message: error instanceof Error ? error.message : "Failed to link Omniweb connection.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDisconnect() {
    setSaving(true);
    setBanner(null);
    setLivekitPreview(null);

    try {
      const response = await fetch("/api/connection/link", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ shop }),
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to clear Omniweb connection.");
      }

      setForm((current) => ({
        ...current,
        apiKey: "",
        clientId: "",
        clerkUserId: "",
      }));
      setBanner({ tone: "info", message: "Stored Omniweb credentials cleared for this shop." });
      await loadStatus();
    } catch (error) {
      setBanner({
        tone: "critical",
        message: error instanceof Error ? error.message : "Failed to clear Omniweb connection.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleRequestLivekitToken() {
    setRequestingLivekitToken(true);
    setBanner(null);

    try {
      const response = await fetch("/api/connection/livekit-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shop,
          channel: "web",
          language: "en",
        }),
      });
      const payload = (await response.json()) as {
        error?: string;
        room_name?: string;
        livekit_url?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to request LiveKit token.");
      }

      setLivekitPreview({
        room_name: payload.room_name ?? "",
        livekit_url: payload.livekit_url ?? "",
      });
      setBanner({ tone: "success", message: "LiveKit token request succeeded through the Omniweb engine." });
    } catch (error) {
      setBanner({
        tone: "critical",
        message: error instanceof Error ? error.message : "Failed to request LiveKit token.",
      });
    } finally {
      setRequestingLivekitToken(false);
    }
  }

  if (!shop) {
    return (
      <Banner tone="warning">
        Add a `shop` query string, like `?shop=your-store.myshopify.com`, so the embedded app knows which merchant record to link.
      </Banner>
    );
  }

  if (loading && !status) {
    return (
      <Card roundedAbove="sm">
        <Box padding="500">
          <InlineStack gap="300" blockAlign="center">
            <Spinner accessibilityLabel="Loading connection status" size="small" />
            <Text as="p" variant="bodyMd">
              Loading Shopify and Omniweb connection status…
            </Text>
          </InlineStack>
        </Box>
      </Card>
    );
  }

  return (
    <BlockStack gap="500">
      {banner ? (
        <Banner tone={banner.tone} onDismiss={() => setBanner(null)}>
          {banner.message}
        </Banner>
      ) : null}

      <Card roundedAbove="sm">
        <BlockStack gap="300">
          <InlineStack align="space-between" blockAlign="center">
            <BlockStack gap="100">
              <Text as="h1" variant="headingLg">
                Omniweb Engine Connection
              </Text>
              <Text as="p" variant="bodyMd" tone="subdued">
                Shopify remains the merchant control plane. Omniweb handles Clerk identity, tenant prompts, and LiveKit token issuance.
              </Text>
            </BlockStack>
            <Button onClick={() => void loadStatus()} loading={loading}>
              Refresh status
            </Button>
          </InlineStack>
        </BlockStack>
      </Card>

      <InlineGrid columns={{ xs: 1, md: 3 }} gap="400">
        <Card roundedAbove="sm">
          <BlockStack gap="200">
            <InlineStack align="space-between" blockAlign="center">
              <Text as="h2" variant="headingMd">
                Shopify
              </Text>
              <Badge tone={status?.shopify.authenticated ? "success" : "warning"}>
                {status?.shopify.authenticated ? "Installed" : "Needs auth"}
              </Badge>
            </InlineStack>
            <Text as="p" variant="bodyMd" tone="subdued">
              {status?.shopify.shop}
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              Session: {status?.shopify.sessionId ?? "No offline Shopify session stored yet."}
            </Text>
          </BlockStack>
        </Card>

        <Card roundedAbove="sm">
          <BlockStack gap="200">
            <InlineStack align="space-between" blockAlign="center">
              <Text as="h2" variant="headingMd">
                Omniweb Engine
              </Text>
              <Badge tone={getStatusTone(status?.omniweb.connectionStatus ?? "DISCONNECTED")}>
                {status?.omniweb.connectionStatus ?? "DISCONNECTED"}
              </Badge>
            </InlineStack>
            <Text as="p" variant="bodyMd" tone="subdued">
              {status?.omniweb.apiBaseUrl ?? "No engine URL configured yet."}
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              {status?.omniweb.profile
                ? `${status.omniweb.profile.name} · ${status.omniweb.profile.plan} plan`
                : "No verified Omniweb tenant linked yet."}
            </Text>
          </BlockStack>
        </Card>

        <Card roundedAbove="sm">
          <BlockStack gap="200">
            <InlineStack align="space-between" blockAlign="center">
              <Text as="h2" variant="headingMd">
                LiveKit
              </Text>
              <Badge tone={status?.omniweb.livekitTokenReady ? "success" : "attention"}>
                {status?.omniweb.livekitTokenReady ? "Proxy ready" : "Waiting on link"}
              </Badge>
            </InlineStack>
            <Text as="p" variant="bodyMd" tone="subdued">
              LiveKit tokens are requested from Omniweb with the linked client ID, not generated in Shopify.
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              Agent: {status?.omniweb.livekitAgentName ?? form.livekitAgentName}
            </Text>
          </BlockStack>
        </Card>
      </InlineGrid>

      <InlineGrid columns={{ xs: 1, md: 2 }} gap="400">
        <Card roundedAbove="sm">
          <BlockStack gap="400">
            <Text as="h2" variant="headingMd">
              Link this shop to Omniweb
            </Text>
            <TextField
              label="Omniweb engine base URL"
              value={form.apiBaseUrl}
              onChange={(value) => setForm((current) => ({ ...current, apiBaseUrl: value }))}
              autoComplete="url"
              placeholder="https://your-omniweb-engine.example.com"
              helpText="Use the FastAPI base URL for the Omniweb AI Engine deployment."
            />
            <TextField
              label="Omniweb API key"
              type="password"
              value={form.apiKey}
              onChange={(value) => setForm((current) => ({ ...current, apiKey: value }))}
              autoComplete="off"
              helpText="Generate this once in the Omniweb dashboard settings. It is encrypted before saving in Shopify's database."
            />
            <TextField
              label="Omniweb client ID"
              value={form.clientId}
              onChange={(value) => setForm((current) => ({ ...current, clientId: value }))}
              autoComplete="off"
              helpText="Optional. Leave blank to trust the client ID returned by Omniweb's profile endpoint."
            />
            <TextField
              label="Linked Clerk user ID"
              value={form.clerkUserId}
              onChange={(value) => setForm((current) => ({ ...current, clerkUserId: value }))}
              autoComplete="off"
              helpText="Optional. Store the Clerk user that owns this Shopify connection for future SSO handoff."
            />
            <TextField
              label="LiveKit Cloud agent name"
              value={form.livekitAgentName}
              onChange={(value) => setForm((current) => ({ ...current, livekitAgentName: value }))}
              autoComplete="off"
              helpText="Matches the LiveKit Cloud agent worker deployed by Omniweb, usually `Kai-d15`."
            />
            <InlineStack gap="300">
              <Button variant="primary" onClick={() => void handleSaveConnection()} loading={saving} disabled={!canSubmit}>
                Verify and save
              </Button>
              <Button tone="critical" onClick={() => void handleDisconnect()} loading={saving} disabled={!status?.omniweb.configured}>
                Clear saved link
              </Button>
            </InlineStack>
          </BlockStack>
        </Card>

        <Card roundedAbove="sm">
          <BlockStack gap="300">
            <Text as="h2" variant="headingMd">
              How the pieces fit
            </Text>
            <Text as="p" variant="bodyMd" tone="subdued">
              This app now uses a clean split of responsibilities so your first deployment stays understandable.
            </Text>
            <Divider />
            <BlockStack gap="200">
              <Text as="p" variant="bodyMd">
                1. Shopify authenticates the merchant and stores the shop record.
              </Text>
              <Text as="p" variant="bodyMd">
                2. Omniweb authenticates the user with Clerk and owns the tenant profile.
              </Text>
              <Text as="p" variant="bodyMd">
                3. Shopify calls Omniweb with the stored API key to verify the tenant and request LiveKit tokens.
              </Text>
              <Text as="p" variant="bodyMd">
                4. LiveKit stays behind Omniweb, so your Shopify app never needs the LiveKit secret.
              </Text>
            </BlockStack>
            <Box background="bg-surface-secondary" borderRadius="300" padding="400">
              <Text as="p" variant="bodySm" tone="subdued">
                Clerk is intentionally kept on the Omniweb side. The Shopify app stores the mapping and can proxy a Clerk-to-Omniweb session exchange when you are ready to add embedded SSO.
              </Text>
            </Box>
          </BlockStack>
        </Card>
      </InlineGrid>

      <Card roundedAbove="sm">
        <BlockStack gap="300">
          <InlineStack align="space-between" blockAlign="center">
            <Text as="h2" variant="headingMd">
              LiveKit smoke test
            </Text>
            <Button
              onClick={() => void handleRequestLivekitToken()}
              loading={requestingLivekitToken}
              disabled={!status?.omniweb.livekitTokenReady}
            >
              Request token through Omniweb
            </Button>
          </InlineStack>
          <Text as="p" variant="bodyMd" tone="subdued">
            This verifies that Shopify can ask Omniweb for a short-lived LiveKit participant token using the linked tenant.
          </Text>
          {livekitPreview ? (
            <Box background="bg-surface-secondary" borderRadius="300" padding="400">
              <BlockStack gap="150">
                <Text as="p" variant="bodyMd">
                  Room: {livekitPreview.room_name}
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  LiveKit URL: {livekitPreview.livekit_url}
                </Text>
              </BlockStack>
            </Box>
          ) : null}
        </BlockStack>
      </Card>

      {status?.omniweb.lastError ? (
        <Card roundedAbove="sm">
          <BlockStack gap="200">
            <Text as="h2" variant="headingMd">
              Last engine error
            </Text>
            <Text as="p" variant="bodyMd" tone="critical">
              {status.omniweb.lastError}
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              Checked at {status.omniweb.lastHealthCheckAt ?? "unknown time"}
            </Text>
          </BlockStack>
        </Card>
      ) : null}
    </BlockStack>
  );
}
