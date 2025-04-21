"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { logoutUser } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { User, LogOut, PlusCircle, Database } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, isAdmin } = useAuth();
  
  const isActiveLink = (path: string) => {
    return pathname === path;
  };
  
  const handleLogout = async () => {
    await logoutUser();
    router.push("/");
  };
  
  return (
    <nav className="bg-background border-b">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Museum Ticketing
        </Link>
        
        <div className="flex items-center space-x-6">
          <Link 
            href="/" 
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              isActiveLink("/") ? "text-primary underline decoration-2 underline-offset-4" : "text-muted-foreground"
            )}
          >
            Home
          </Link>
          
          {user && (
            <Link 
              href="/dashboard" 
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                isActiveLink("/dashboard") ? "text-primary underline decoration-2 underline-offset-4" : "text-muted-foreground"
              )}
            >
              Dashboard
            </Link>
          )}
          
          {isAdmin && (
            <>
              <Link 
                href="/admin" 
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isActiveLink("/admin") ? "text-primary underline decoration-2 underline-offset-4" : "text-muted-foreground"
                )}
              >
                Admin
              </Link>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => router.push("/admin")}
                className="flex items-center gap-1 border-green-500 text-green-600 hover:bg-green-50"
              >
                <PlusCircle className="h-4 w-4" />
                Add Museum
              </Button>
            </>
          )}
          
          {user && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.push("/dashboard?tab=import")}
              className="flex items-center gap-1 border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              <Database className="h-4 w-4" />
              Import Data
            </Button>
          )}
          
          {!loading && (
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>{user.email}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleLogout}
                    className="flex items-center gap-1"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => router.push("/login")}
                  >
                    Login
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={() => router.push("/register")}
                  >
                    Register
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
} 