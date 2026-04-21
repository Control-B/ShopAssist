import { DiagnosticsDashboard } from "@/components/diagnostics/diagnostics-dashboard";

type DiagnosticsPageProps = {
  searchParams?: Promise<{
    shop?: string;
  }>;
};

export default async function DiagnosticsPage({ searchParams }: DiagnosticsPageProps) {
  const resolvedSearchParams = await searchParams;

  return <DiagnosticsDashboard initialShop={resolvedSearchParams?.shop ?? ""} />;
}
