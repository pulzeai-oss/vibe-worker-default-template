"use client";

import { useEffect, useState } from "react";
import { useProxyAwareRouter } from "@/utils/navigation";
import { ArrowLeft, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InviteForm } from "@/components/auth/InviteForm";
import { useAuth } from "@/contexts/AuthContext";

export default function InvitePage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useProxyAwareRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading) {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (user && !user.is_admin) {
        // Non-admin users shouldn't access this page
        router.push("/dashboard");
      }
    }
  }, [mounted, loading, isAuthenticated, user, router]);

  if (loading || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !user.is_admin) {
    return null;
  }

  const handleBackToDashboard = () => {
    router.push("/dashboard");
  };

  const handleInviteSuccess = (userEmail: string, role: string) => {
    // Optional: You can add additional logic here when a user is successfully invited
    console.log(`Successfully invited ${userEmail} with role ${role}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button
              variant="ghost"
              onClick={handleBackToDashboard}
              className="mb-4 -ml-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              Invite New User
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Create a new account for a team member and assign their role
            </p>
          </div>
        </div>

        {/* Invite Form */}
        <div className="flex items-center justify-center">
          <InviteForm onSuccess={handleInviteSuccess} />
        </div>
      </div>
    </div>
  );
}
