"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavMenu, TitleBar } from "@shopify/app-bridge-react";
import {
  Badge,
  BlockStack,
  Box,
  Card,
  InlineStack,
  Text,
} from "@shopify/polaris";

const navigationItems = [
  { label: "Overview", href: "/overview" },
  { label: "Assistant Configuration", href: "/assistant" },
  { label: "Store Data Sharing", href: "/store-data" },
  { label: "External AI Connection", href: "/connection" },
  { label: "Branding & Widget", href: "/branding" },
  { label: "Logs & Diagnostics", href: "/diagnostics" },
] as const;

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <>
      <TitleBar title="Omniweb AI Control Panel" />
      <NavMenu>
        {navigationItems.map((item) => (
          <a key={item.href} href={item.href}>
            {item.label}
          </a>
        ))}
      </NavMenu>

      <div className="min-h-screen bg-slate-100">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row lg:px-6">
          <aside className="w-full lg:max-w-xs">
            <Card roundedAbove="sm">
              <BlockStack gap="500">
                <BlockStack gap="200">
                  <InlineStack align="space-between" blockAlign="center">
                    <Text as="h2" variant="headingMd">
                      Omniweb AI
                    </Text>
                    <Badge tone="attention">Phase 1</Badge>
                  </InlineStack>
                  <Text as="p" variant="bodyMd" tone="subdued">
                    Shopify embedded foundation for configuring an external AI
                    assistant.
                  </Text>
                </BlockStack>

                <BlockStack gap="150">
                  {navigationItems.map((item) => {
                    const isActive = pathname === item.href;

                    return (
                      <Box
                        key={item.href}
                        background={isActive ? "bg-surface-active" : undefined}
                        borderRadius="300"
                        padding="300"
                      >
                        <Link
                          href={item.href}
                          className="block no-underline"
                          style={{ color: "inherit" }}
                        >
                          <Text
                            as="span"
                            variant="bodyMd"
                            fontWeight={isActive ? "semibold" : "regular"}
                          >
                            {item.label}
                          </Text>
                        </Link>
                      </Box>
                    );
                  })}
                </BlockStack>
              </BlockStack>
            </Card>
          </aside>

          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </>
  );
}
