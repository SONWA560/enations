"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function SignupPage() {
  const router = useRouter();
  const { userData, loading } = useAuth();

  useEffect(() => {
    // Redirect to /auth which has the actual login/signup form
    if (!loading && !userData) {
      router.replace("/auth");
    } else if (!loading && userData) {
      // User is already logged in, redirect to appropriate dashboard
      if (userData.role === "admin") {
        router.replace("/admin/dashboard");
      } else if (userData.federationId) {
        router.replace("/dashboard");
      } else {
        router.replace("/register-federation");
      }
    }
  }, [userData, loading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}
