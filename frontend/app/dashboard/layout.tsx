"use client";

import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Menu, User, LogOut, CheckSquare } from "lucide-react";
import { useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-muted"></div>
          <div className="h-4 w-24 rounded bg-muted"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/30">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 shadow-sm">
        {/* Mobile Hamburger Layout */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger className="inline-flex items-center justify-center shrink-0 md:hidden h-10 w-10 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <nav className="grid gap-4 text-lg font-medium mt-8">
              <Link
                href="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 text-lg font-semibold"
              >
                <CheckSquare className="h-6 w-6 text-primary" />
                <span>TaskMaster</span>
              </Link>
              <div className="my-4 border-t" />
              <div className="flex items-center gap-2 text-muted-foreground px-2">
                <User className="h-5 w-5" />
                <span className="text-sm">{user?.email || "User"}</span>
              </div>
              <Button
                variant="outline"
                className="mt-4 justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  logout();
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </nav>
          </SheetContent>
        </Sheet>

        {/* Desktop Logo */}
        <Link
          href="/dashboard"
          className="hidden md:flex items-center gap-2 font-semibold"
        >
          <CheckSquare className="h-6 w-6 text-primary" />
          <span className="text-xl tracking-tight">TaskMaster</span>
        </Link>

        {/* Desktop Right Nav */}
        <div className="flex items-center gap-4 ml-auto">
          <div className="hidden md:flex items-center gap-2 mr-4 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
            <User className="h-4 w-4" />
            {user?.email || "Loading..."}
          </div>
          <Button
            variant="ghost"
            className="hidden md:flex text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto p-4 md:p-8 lg:p-10 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
