"use client";

import {
  Badge,
  BlockStack,
  Box,
  Card,
  InlineStack,
  Text,
} from "@shopify/polaris";

type SectionPlaceholderProps = {
  title: string;
  description: string;
};

export function SectionPlaceholder({
  title,
  description,
}: SectionPlaceholderProps) {
  return (
    <BlockStack gap="500">
      <Card roundedAbove="sm">
        <BlockStack gap="300">
          <InlineStack align="space-between" blockAlign="center">
            <Text as="h1" variant="headingLg">
              {title}
            </Text>
            <Badge tone="info">Next phase</Badge>
          </InlineStack>
          <Text as="p" variant="bodyMd" tone="subdued">
            {description}
          </Text>
        </BlockStack>
      </Card>

      <Card roundedAbove="sm">
        <BlockStack gap="200">
          <Text as="h2" variant="headingMd">
            Foundation Status
          </Text>
          <Text as="p" variant="bodyMd" tone="subdued">
            Navigation, Prisma models, Shopify auth routes, onboarding defaults,
            and environment configuration are in place. This section will gain
            merchant-editable forms and data wiring in the next phase.
          </Text>
          <Box
            background="bg-surface-secondary"
            borderRadius="300"
            padding="400"
          >
            <Text as="p" variant="bodySm" tone="subdued">
              The UI shell exists now so each section can be implemented without
              restructuring the embedded app later.
            </Text>
          </Box>
        </BlockStack>
      </Card>
    </BlockStack>
  );
}
