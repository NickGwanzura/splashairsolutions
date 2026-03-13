"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
const publicDemoEnabled = process.env.NEXT_PUBLIC_ENABLE_PUBLIC_DEMO === "true";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    await fetch("/api/demo/session", { method: "DELETE" });

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = async () => {
    setDemoLoading(true);

    try {
      const response = await fetch("/api/demo/session", { method: "POST" });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error || "Demo access is currently unavailable.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Unable to start the demo right now.");
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-hvac-50 to-hvac-100 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-hvac-600 flex items-center justify-center shadow-lg">
              <Wrench className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-hvac-900">HVACOps</h1>
              <p className="text-sm text-hvac-600">Field Service Management</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-hvac-600 hover:text-hvac-700"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" loading={loading}>
                Sign in
              </Button>
            </form>

            {publicDemoEnabled && (
              <div className="mt-6 rounded-xl border border-dashed border-hvac-200 bg-hvac-50/70 p-4">
                <p className="text-sm font-medium text-hvac-900">Need a quick product tour?</p>
                <p className="mt-1 text-sm text-hvac-700">
                  Launch a read-only demo and browse every dashboard without creating an account.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4 w-full border-hvac-200 bg-white hover:bg-hvac-100"
                  loading={demoLoading}
                  onClick={handleDemoAccess}
                >
                  Explore Demo Dashboards
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="mt-6 text-center text-sm">
              <Link href="/forgot-password" className="text-hvac-600 hover:text-hvac-700 font-medium">
                Forgot your password?
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          By signing in, you agree to our{" "}
          <Link href="/terms" className="underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
