"use client";

import { Header } from "./Header";
import { ActionNavbar } from "./ActionNavbar";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  noHeader?: boolean;
  noActionNavbar?: boolean;
}

export function PageLayout({ children, className = "", noHeader = false, noActionNavbar = false }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {!noHeader && <Header />}
      {!noActionNavbar && <ActionNavbar />}
      <main className={noHeader ? className : `pt-16 ${className}`}>
        {children}
      </main>
    </div>
  );
}
