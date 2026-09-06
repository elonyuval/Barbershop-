import type { Metadata } from "next";
import AdminDashboard from "@/components/admin/AdminDashboard";

export const metadata: Metadata = {
  title: "Admin",
  // The demo admin has no authentication — keep it out of search results.
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminDashboard />;
}
