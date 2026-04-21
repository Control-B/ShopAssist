"use client";

import {
  Badge,
  BlockStack,
  Box,
  Button,
  Card,
  InlineGrid,
  InlineStack,
  List,
  Text,
} from "@shopify/polaris";

const healthCards = [
  {
    title: "Assistant status",
    value: "Disabled by default",
    tone: "warning" as const,
    detail: "The assistant remains off until the external AI connection is configured.",
  },
  {
    title: "Connection health",
    value: "Awaiting configuration",
    tone: "attention" as const,
    detail: "API base URL, encrypted key storage, and LiveKit linkage come next.",
  },
  {
    title: "Product sync",
    value: "Foundation ready",
    tone: "success" as const,
    detail: "Schema, sync config defaults, and service boundaries are already scaffolded.",
  },
  {
    title: "Webhooks",
    value: "Route structure prepared",
    tone: "info" as const,
    detail: "Webhook logging and topic-specific behavior will plug into the current foundation.",
  },
] as const;

export function OverviewDashboard() {
  return (
    <BlockStack gap="500">
      <Card roundedAbove="sm">
        <BlockStack gap="300">
          <InlineStack align="space-between" blockAlign="center">
            <BlockStack gap="100">
              <Text as="h1" variant="headingLg">
                Shopify Embedded App Foundation
              </Text>
              <Text as="p" variant="bodyMd" tone="subdued">
                Omniweb AI is set up as the merchant control plane and secure
                integration layer for an external LiveKit-powered assistant.
              </Text>
            </BlockStack>
            <Button url="/api/health">Check foundation health</Button>
          </InlineStack>
        </BlockStack>
      </Card>

      <InlineGrid columns={{ xs: 1, md: 2 }} gap="400">
        {healthCards.map((card) => (
          <Card key={card.title} roundedAbove="sm">
            <BlockStack gap="200">
              <InlineStack align="space-between" blockAlign="center">
                <Text as="h2" variant="headingMd">
                  {card.title}
                </Text>
                <Badge tone={card.tone}>{card.value}</Badge>
              </InlineStack>
              <Text as="p" variant="bodyMd" tone="subdued">
                {card.detail}
              </Text>
            </BlockStack>
          </Card>
        ))}
      </InlineGrid>

      <InlineGrid columns={{ xs: 1, md: 2 }} gap="400">
        <Card roundedAbove="sm">
          <BlockStack gap="300">
            <Text as="h2" variant="headingMd">
              What exists now
            </Text>
            <List type="bullet">
              <List.Item>Multi-tenant Prisma schema for merchant data.</List.Item>
              <List.Item>
                Shopify OAuth route handlers and session persistence.
              </List.Item>
              <List.Item>
                Default onboarding records for new shop installs.
              </List.Item>
              <List.Item>Embedded admin shell with section navigation.</List.Item>
            </List>
          </BlockStack>
        </Card>

        <Card roundedAbove="sm">
          <BlockStack gap="300">
            <Text as="h2" variant="headingMd">
              Next implementation focus
            </Text>
            <List type="bullet">
              <List.Item>
                Merchant-facing Assistant Configuration forms and validation.
              </List.Item>
              <List.Item>
                External AI connection testing and encrypted secret storage.
              </List.Item>
              <List.Item>
                Product and store context sync pipelines to the external backend.
              </List.Item>
              <List.Item>Webhook processing and diagnostics views.</List.Item>
            </List>
          </BlockStack>
        </Card>
      </InlineGrid>

      <Card roundedAbove="sm">
        <BlockStack gap="300">
          <Text as="h2" variant="headingMd">
            Architecture guardrails
          </Text>
          <Box
            background="bg-surface-secondary"
            borderRadius="300"
            padding="400"
          >
            <Text as="p" variant="bodyMd">
              This app does not host media, telephony, or the LiveKit runtime.
              It is dedicated to Shopify connectivity, secure configuration,
              merchant context, and controlled communication with an external AI
              backend.
            </Text>
          </Box>
        </BlockStack>
      </Card>
    </BlockStack>
  );
}
