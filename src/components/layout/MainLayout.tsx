/*
  BEGINNER NOTE: This is the main layout wrapper that includes
  the sidebar and provides the content area for pages.
  Now responsive: sidebar hidden on mobile, visible on large screens.
*/

import { Sidebar } from "./Sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - hidden on mobile, fixed on large screens */}
      <Sidebar />
      
      {/* Main content area - full width on mobile, offset by sidebar on lg+ */}
      <main className="lg:ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}
