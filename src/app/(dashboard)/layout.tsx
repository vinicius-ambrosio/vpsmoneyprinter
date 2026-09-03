import { Sidebar } from "@/components/layout/Sidebar";
import { CreditsProvider } from "@/components/CreditsProvider";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CreditsProvider>
      <div className="flex w-full h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-white m-4 rounded-2xl border border-gray-200 shadow-sm">
          {children}
        </main>
      </div>
    </CreditsProvider>
  );
}
