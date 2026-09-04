import { Sidebar } from "@/components/layout/Sidebar";
import { CreditsProvider } from "@/components/CreditsProvider";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CreditsProvider>
      <div className="flex w-full h-screen overflow-hidden flex-col md:flex-row">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-white md:m-4 md:rounded-2xl md:border border-gray-200 shadow-sm relative">
          {children}
        </main>
      </div>
    </CreditsProvider>
  );
}
