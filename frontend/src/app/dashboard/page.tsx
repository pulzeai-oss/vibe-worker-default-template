"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Shield, 
  Settings, 
  LogOut, 
  Edit3,
  Eye,
  Crown
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardPage() {
  const { user, loading, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [mounted, loading, isAuthenticated, router]);

  if (loading || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4" />;
      case 'editor':
        return <Edit3 className="h-4 w-4" />;
      case 'viewer':
        return <Eye className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'default';
      case 'editor':
        return 'secondary';
      case 'viewer':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Welcome back, manage your account and settings
            </p>
          </div>
          <Button
            variant="outline"
            onClick={logout}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Profile Card */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Your account details and role information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-blue-600 text-white text-lg">
                      {getInitials(user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{user.email}</h3>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={getRoleBadgeVariant(user.role)}
                        className="flex items-center gap-1"
                      >
                        {getRoleIcon(user.role)}
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                      {user.is_admin && (
                        <Badge variant="default" className="bg-green-600">
                          <Shield className="h-3 w-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      User ID
                    </label>
                    <p className="text-sm font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1">
                      {user.user_id}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Role
                    </label>
                    <p className="text-sm p-2 mt-1">
                      {user.role === 'admin' && 'Full system access with user management capabilities'}
                      {user.role === 'editor' && 'Can create, edit, and manage content'}
                      {user.role === 'viewer' && 'Read-only access to view content'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions Card */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Manage your account settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/dashboard/change-password')}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.open('http://localhost:9000/docs', '_blank')}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  API Documentation
                </Button>

                <Separator />

                <Button
                  variant="destructive"
                  className="w-full justify-start"
                  onClick={logout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>

            {/* Role Permissions */}
            <Card>
              <CardHeader>
                <CardTitle>Your Permissions</CardTitle>
                <CardDescription>
                  What you can do with your current role
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {user.role === 'admin' && (
                    <>
                      <div className="flex items-center gap-2 text-green-600">
                        <Shield className="h-3 w-3" />
                        Create and manage users
                      </div>
                      <div className="flex items-center gap-2 text-green-600">
                        <Shield className="h-3 w-3" />
                        Full system access
                      </div>
                      <div className="flex items-center gap-2 text-green-600">
                        <Shield className="h-3 w-3" />
                        Manage all content
                      </div>
                    </>
                  )}
                  {user.role === 'editor' && (
                    <>
                      <div className="flex items-center gap-2 text-blue-600">
                        <Edit3 className="h-3 w-3" />
                        Create and edit content
                      </div>
                      <div className="flex items-center gap-2 text-blue-600">
                        <Edit3 className="h-3 w-3" />
                        Manage own content
                      </div>
                      <div className="flex items-center gap-2 text-blue-600">
                        <Edit3 className="h-3 w-3" />
                        View all content
                      </div>
                    </>
                  )}
                  {user.role === 'viewer' && (
                    <>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Eye className="h-3 w-3" />
                        View content
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Eye className="h-3 w-3" />
                        Read-only access
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}