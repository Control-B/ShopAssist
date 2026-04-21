import { ConnectionDashboard } from "@/components/connection/connection-dashboard";

type ConnectionPageProps = {
  searchParams?: Promise<{
    shop?: string;
  }>;
};

export default async function ConnectionPage({ searchParams }: ConnectionPageProps) {
  const resolvedSearchParams = await searchParams;

  return <ConnectionDashboard initialShop={resolvedSearchParams?.shop ?? ""} />;
}
