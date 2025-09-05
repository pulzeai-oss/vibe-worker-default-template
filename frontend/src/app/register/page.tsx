"use client";

import { useState } from "react";
import { useProxyAwareRouter } from "@/utils/navigation";
import { ArrowLeft, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  const router = useProxyAwareRouter();

  const handleBackToLogin = () => {
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button
              variant="ghost"
              onClick={handleBackToLogin}
              className="mb-4 -ml-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <UserPlus className="h-8 w-8 text-blue-600" />
              Create Account
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Sign up for a new account to get started
            </p>
          </div>
        </div>

        {/* Registration Form */}
        <div className="flex items-center justify-center">
          <RegisterForm onSwitchToLogin={handleBackToLogin} />
        </div>
      </div>
    </div>
  );
}