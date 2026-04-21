"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Banner,
  BlockStack,
  Box,
  Button,
  Card,
  InlineStack,
  Spinner,
  Text,
} from "@shopify/polaris";

type DiagnosticsPayload = Record<string, unknown>;

type DiagnosticsDashboardProps = {
  initialShop: string;
};

export function DiagnosticsDashboard({ initialShop }: DiagnosticsDashboardProps) {
  const shop = initialShop.trim();
  const [payload, setPayload] = useState<DiagnosticsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDiagnostics = useCallback(async () => {
    if (!shop) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/connection/status?shop=${encodeURIComponent(shop)}`, {
        cache: "no-store",
      });
      const nextPayload = (await response.json()) as DiagnosticsPayload & { error?: string };

      if (!response.ok) {
        throw new Error(nextPayload.error ?? "Failed to load diagnostics.");
      }

      setPayload(nextPayload);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to load diagnostics.");
    } finally {
      setLoading(false);
    }
  }, [shop]);

  useEffect(() => {
    void loadDiagnostics();
  }, [loadDiagnostics]);

  if (!shop) {
    return (
      <Banner tone="warning">
        Add a `shop` query string, like `?shop=your-store.myshopify.com`, to inspect diagnostics for a specific merchant.
      </Banner>
    );
  }

  return (
    <BlockStack gap="500">
      {error ? <Banner tone="critical">{error}</Banner> : null}

      <Card roundedAbove="sm">
        <InlineStack align="space-between" blockAlign="center">
          <BlockStack gap="100">
            <Text as="h1" variant="headingLg">
              Connection diagnostics
            </Text>
            <Text as="p" variant="bodyMd" tone="subdued">
              Raw status for Shopify install, Omniweb linkage, and LiveKit readiness.
            </Text>
          </BlockStack>
          <Button onClick={() => void loadDiagnostics()} loading={loading}>
            Refresh diagnostics
          </Button>
        </InlineStack>
      </Card>

      <Card roundedAbove="sm">
        <BlockStack gap="300">
          <Text as="h2" variant="headingMd">
            Quick checks
          </Text>
          <Text as="p" variant="bodyMd">
            - Shopify offline session should be present after app install.
          </Text>
          <Text as="p" variant="bodyMd">
            - Omniweb profile should resolve with the stored API key.
          </Text>
          <Text as="p" variant="bodyMd">
            - LiveKit becomes testable once Omniweb stores a client ID for the shop.
          </Text>
        </BlockStack>
      </Card>

      <Card roundedAbove="sm">
        <BlockStack gap="300">
          <Text as="h2" variant="headingMd">
            Raw payload
          </Text>
          {loading && !payload ? (
            <InlineStack gap="300" blockAlign="center">
              <Spinner accessibilityLabel="Loading diagnostics" size="small" />
              <Text as="p" variant="bodyMd">
                Fetching latest connection payload…
              </Text>
            </InlineStack>
          ) : (
            <Box background="bg-surface-secondary" borderRadius="300" padding="400">
              <pre className="overflow-x-auto whitespace-pre-wrap text-xs text-slate-700">
                {JSON.stringify(payload, null, 2)}
              </pre>
            </Box>
          )}
        </BlockStack>
      </Card>
    </BlockStack>
  );
}
