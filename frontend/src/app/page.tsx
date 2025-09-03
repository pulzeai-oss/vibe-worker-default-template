"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiService, User, Item } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [apiStatus, setApiStatus] = useState<"connected" | "disconnected" | "checking">("checking");
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    checkApiStatus();
    fetchData();
  }, []);

  const checkApiStatus = async () => {
    try {
      const healthResponse = await apiService.healthCheck();
      if (healthResponse.status === "healthy") {
        setApiStatus("connected");
      } else {
        setApiStatus("disconnected");
      }
    } catch (error) {
      setApiStatus("disconnected");
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch users and items in parallel
      const [usersResponse, itemsResponse] = await Promise.all([
        apiService.getUsers().catch(() => ({ data: [], count: 0 })),
        apiService.getItems().catch(() => ({ data: [], count: 0 }))
      ]);

      setUsers(usersResponse.data || []);
      setItems(itemsResponse.data || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setApiStatus("checking");
    await checkApiStatus();
  };

  const refreshData = async () => {
    await fetchData();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            FastAPI + Next.js Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            A modern full-stack application with FastAPI backend and Next.js frontend
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Users Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                👥 Users
                <Badge variant="secondary">{users.length}</Badge>
              </CardTitle>
              <CardDescription>
                Manage user accounts and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {loading ? (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Loading users...
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    No users found. Create your first user to get started.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {users.slice(0, 3).map((user) => (
                      <div key={user.user_id} className="text-sm">
                        <div className="font-medium">{user.full_name || user.email}</div>
                        <div className="text-gray-500">{user.email}</div>
                      </div>
                    ))}
                    {users.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{users.length - 3} more users
                      </div>
                    )}
                  </div>
                )}
                <Button className="w-full" onClick={refreshData}>
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Items Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📦 Items
                <Badge variant="secondary">{items.length}</Badge>
              </CardTitle>
              <CardDescription>
                Manage your application items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {loading ? (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Loading items...
                  </div>
                ) : items.length === 0 ? (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    No items found. Create your first item to get started.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {items.slice(0, 3).map((item) => (
                      <div key={item.id} className="text-sm">
                        <div className="font-medium">{item.title}</div>
                        <div className="text-gray-500">{item.description || "No description"}</div>
                      </div>
                    ))}
                    {items.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{items.length - 3} more items
                      </div>
                    )}
                  </div>
                )}
                <Button className="w-full" onClick={refreshData}>
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* API Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🔌 API Status
                <Badge 
                  variant={apiStatus === "connected" ? "default" : "destructive"}
                  className={apiStatus === "connected" ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  {apiStatus === "checking" ? "Checking..." : 
                   apiStatus === "connected" ? "Connected" : "Disconnected"}
                </Badge>
              </CardTitle>
              <CardDescription>
                FastAPI backend connection status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {apiStatus === "checking" && "Checking connection..."}
                  {apiStatus === "connected" && "Backend is running and accessible"}
                  {apiStatus === "disconnected" && "Backend is not accessible"}
                </div>
                <Button variant="outline" className="w-full" onClick={testConnection}>
                  Test Connection
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => window.open("http://localhost:8000/docs", "_blank")}
                >
                  View API Documentation
                </Button>
                <Button variant="outline" onClick={refreshData}>
                  Refresh Data
                </Button>
                <Button variant="outline" onClick={checkApiStatus}>
                  Check API Health
                </Button>
                <Button variant="outline" onClick={() => window.open("http://localhost:8000/health", "_blank")}>
                  Health Check
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
