"use client";

import { Header } from "./Header";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  noHeader?: boolean;
}

export function PageLayout({ children, className = "", noHeader = false }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {!noHeader && <Header />}
      <main className={noHeader ? className : `pt-16 ${className}`}>
        {children}
      </main>
    </div>
  );
}
