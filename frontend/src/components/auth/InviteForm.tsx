"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const inviteSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  confirmPassword: z.string().min(1, "Please confirm the password"),
  role: z.enum(["viewer", "editor", "admin"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type InviteFormData = {
  email: string;
  password: string;
  confirmPassword: string;
  role: "viewer" | "editor" | "admin";
};

interface InviteFormProps {
  onSuccess?: (userEmail: string, role: string) => void;
}

export function InviteForm({ onSuccess }: InviteFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const { inviteUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      role: "viewer",
    },
  });

  const onSubmit = async (data: InviteFormData) => {
    try {
      setError("");
      setSuccess("");
      
      await inviteUser(data.email, data.password, data.role);
      
      const successMessage = `✅ User ${data.email} has been successfully invited with ${data.role} role. They can now log in with their credentials.`;
      setSuccess(successMessage);
      
      // Reset form after successful invitation
      reset();
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(data.email, data.role);
      }
    } catch (err: any) {
      console.error('Invite form submission error:', err);
      
      if (err.message.includes("already exists") || err.message.includes("already used")) {
        setError("An account with this email already exists.");
      } else if (err.message.includes("403") || err.message.includes("Forbidden")) {
        setError("You don't have permission to invite users. Only administrators can invite users.");
      } else if (err.message.includes("401") || err.message.includes("Unauthorized")) {
        setError("Your session has expired. Please log in again.");
      } else if (err.message.includes("Network") || err.message.includes("fetch")) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError("Failed to invite user. Please try again.");
      }
    }
  };

  const handleInviteAnother = () => {
    setSuccess("");
    setError("");
    reset();
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
          <CheckCircle className="h-6 w-6 text-blue-600" />
          Invite User
        </CardTitle>
        <CardDescription className="text-center">
          Enter the user's email and set their initial password and role
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              {...register("email")}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">User Role</Label>
            <Select onValueChange={(value) => setValue("role", value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">
                  <div className="flex flex-col">
                    <span className="font-medium">Viewer</span>
                    <span className="text-sm text-gray-500">View only access</span>
                  </div>
                </SelectItem>
                <SelectItem value="editor">
                  <div className="flex flex-col">
                    <span className="font-medium">Editor</span>
                    <span className="text-sm text-gray-500">Can edit content</span>
                  </div>
                </SelectItem>
                <SelectItem value="admin">
                  <div className="flex flex-col">
                    <span className="font-medium">Admin</span>
                    <span className="text-sm text-gray-500">Full access</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-red-500">{errors.role.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Initial Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a secure password"
                {...register("password")}
                className={errors.password ? "border-red-500 pr-10" : "pr-10"}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm the password"
                {...register("confirmPassword")}
                className={errors.confirmPassword ? "border-red-500 pr-10" : "pr-10"}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Inviting User...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Invite User
              </>
            )}
          </Button>
          
          {success && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleInviteAnother}
            >
              Invite Another User
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
