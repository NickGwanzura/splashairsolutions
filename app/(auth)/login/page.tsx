"use client";

import { useState } from "react";
import { Button as CarbonButton, Column, Grid, InlineNotification, PasswordInput, Tag, TextInput, Tile } from "@carbon/react";
import { UserRole } from "@prisma/client";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  ClipboardList,
  DollarSign,
  LayoutDashboard,
  Settings2,
  ShieldCheck,
  UserRound,
  Users,
  Wrench,
} from "lucide-react";

const publicDemoEnabled = process.env.NEXT_PUBLIC_ENABLE_PUBLIC_DEMO === "true";

const demoDestinations = [
  {
    title: "Overview",
    description: "See the executive summary dashboard first.",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Dispatch",
    description: "Jump into the scheduling and field ops view.",
    href: "/dispatch",
    icon: ClipboardList,
  },
  {
    title: "Customers",
    description: "Preview customer records and account screens.",
    href: "/customers",
    icon: Users,
  },
  {
    title: "Reports",
    description: "Open the reporting area and business metrics.",
    href: "/reports",
    icon: BarChart3,
  },
  {
    title: "Calendar",
    description: "Browse the planning calendar in demo mode.",
    href: "/calendar",
    icon: CalendarDays,
  },
  {
    title: "Settings",
    description: "Review the admin and workspace configuration.",
    href: "/settings",
    icon: Settings2,
  },
] as const;

const roleAccessProfiles = [
  {
    title: "Owner",
    role: UserRole.OWNER,
    icon: ShieldCheck,
    emailHint: "owner@coolairhvac.com",
  },
  {
    title: "Admin",
    role: UserRole.ADMIN,
    icon: Settings2,
    emailHint: "admin@coolairhvac.com",
  },
  {
    title: "Dispatcher",
    role: UserRole.DISPATCHER,
    icon: ClipboardList,
    emailHint: "dispatch@coolairhvac.com",
  },
  {
    title: "Technician",
    role: UserRole.TECHNICIAN,
    icon: UserRound,
    emailHint: "mike.j@coolairhvac.com",
  },
  {
    title: "Accountant",
    role: UserRole.ACCOUNTANT,
    icon: DollarSign,
    emailHint: "accounting@coolairhvac.com",
  },
] as const;

const SEEDED_DEMO_PASSWORD = "password123";

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<(typeof roleAccessProfiles)[number]["title"]>("Owner");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoadingTarget, setDemoLoadingTarget] = useState<string | null>(null);
  const activeRoleProfile =
    roleAccessProfiles.find((role) => role.title === selectedRole) ?? roleAccessProfiles[0];

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

  const handleDemoAccess = async (
    path = "/dashboard",
    role: UserRole = UserRole.OWNER,
    target = path,
  ) => {
    setError("");
    setDemoLoadingTarget(target);

    try {
      const response = await fetch("/api/demo/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error || "Demo access is currently unavailable.");
        return;
      }

      router.push(path);
      router.refresh();
    } catch {
      setError("Unable to start the demo right now.");
    } finally {
      setDemoLoadingTarget(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Grid fullWidth condensed className="min-h-screen">
        <Column sm={4} md={8} lg={7} xlg={6} max={6} className="hidden lg:block">
          <section className="flex min-h-screen flex-col justify-between bg-[#161616] px-8 py-10 text-[#f4f4f4] xl:px-12">
            <div className="space-y-10">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center border border-[#0f62fe] bg-[#0f62fe] text-white">
                  <Wrench className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-[#8d8d8d]">
                    IBM Carbon Edition
                  </p>
                  <h1 className="mt-1 text-3xl font-semibold tracking-[-0.03em]">
                    HVACOps
                  </h1>
                </div>
              </div>

              <div className="max-w-xl space-y-5">
                <Tag type="blue">Carbon design language</Tag>
                <h2 className="text-5xl font-semibold tracking-[-0.04em]">
                  Run field operations with a cleaner, more structured control room.
                </h2>
                <p className="text-lg leading-8 text-[#c6c6c6]">
                  The sign-in flow now lands inside an IBM Carbon-inspired shell with
                  stronger hierarchy, sharper data density, and clearer paths into dispatch.
                </p>
              </div>
            </div>

            <div className="grid gap-px bg-[#393939] md:grid-cols-2">
              {demoDestinations.slice(0, 4).map((destination) => {
                const Icon = destination.icon;

                return (
                  <div key={destination.href} className="bg-[#262626] p-6">
                    <div className="flex h-11 w-11 items-center justify-center bg-[#0f62fe] text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-xl font-semibold tracking-[-0.02em]">
                      {destination.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-[#c6c6c6]">
                      {destination.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        </Column>

        <Column sm={4} md={8} lg={9} xlg={10} max={10} className="flex min-h-screen items-center justify-center">
          <div className="w-full max-w-[720px] px-4 py-10 sm:px-8 lg:px-12">
            <div className="mb-8 lg:hidden">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center border border-[#0f62fe] bg-[#0f62fe] text-white">
                  <Wrench className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">
                    IBM Carbon Edition
                  </p>
                  <h1 className="mt-1 text-2xl font-semibold tracking-[-0.03em]">
                    HVACOps
                  </h1>
                </div>
              </div>
            </div>

            <Tile className="border border-border !bg-white !p-0 shadow-none">
              <div className="border-b border-border px-6 py-6 sm:px-8">
                <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
                  Sign in
                </p>
                <h2 className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-foreground">
                  Access your workspace
                </h2>
                <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
                  Enter your credentials or preload one of the seeded demo roles below.
                </p>
              </div>

              <div className="space-y-8 px-6 py-6 sm:px-8">
                {error && (
                  <InlineNotification
                    kind="error"
                    lowContrast
                    hideCloseButton
                    title="Unable to continue"
                    subtitle={error}
                  />
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <TextInput
                    id="email"
                    type="email"
                    labelText="Email"
                    placeholder={activeRoleProfile.emailHint}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-medium text-foreground">Password</span>
                      <Link
                        href="/forgot-password"
                        className="text-sm font-medium text-primary transition-colors hover:text-[#0043ce]"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <PasswordInput
                      id="password"
                      labelText=""
                      hideLabel
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center bg-[#edf5ff] text-[#0f62fe]">
                        <BriefcaseBusiness className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
                          Seeded access
                        </p>
                        <p className="text-sm text-foreground">
                          Select a role to preload credentials and permissions.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-px bg-border sm:grid-cols-2 xl:grid-cols-3">
                      {roleAccessProfiles.map((role) => {
                        const Icon = role.icon;
                        const isSelected = role.title === selectedRole;

                        return (
                          <button
                            key={role.title}
                            type="button"
                            aria-pressed={isSelected}
                            disabled={loading}
                            onClick={() => {
                              setSelectedRole(role.title);
                              setEmail(role.emailHint);
                              setPassword(SEEDED_DEMO_PASSWORD);
                              setError("");
                            }}
                            className={`bg-white p-4 text-left transition-colors ${
                              isSelected
                                ? "bg-[#edf5ff] shadow-[inset_3px_0_0_0_#0f62fe]"
                                : "hover:bg-[#f4f4f4]"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex h-10 w-10 items-center justify-center bg-[#edf5ff] text-[#0f62fe]">
                                <Icon className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-foreground">{role.title}</p>
                                <p className="mt-1 text-xs text-muted-foreground">{role.emailHint}</p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <CarbonButton type="submit" size="lg" disabled={loading}>
                    {loading ? "Signing in..." : "Sign in"}
                  </CarbonButton>
                </form>

                {publicDemoEnabled && (
                  <div className="space-y-4 border-t border-border pt-8">
                    <div className="space-y-2">
                      <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
                        Product tour
                      </p>
                      <h3 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">
                        Launch a read-only demo
                      </h3>
                      <p className="text-sm leading-7 text-muted-foreground">
                        Open any major dashboard without creating an account.
                      </p>
                    </div>

                    <CarbonButton
                      type="button"
                      kind="secondary"
                      size="lg"
                      disabled={demoLoadingTarget === "/dashboard"}
                      onClick={() => handleDemoAccess("/dashboard")}
                    >
                      {demoLoadingTarget === "/dashboard" ? "Launching demo..." : "Explore demo dashboards"}
                    </CarbonButton>

                    <div className="grid gap-px bg-border sm:grid-cols-2">
                      {demoDestinations.map((destination) => {
                        const Icon = destination.icon;
                        const isLoading = demoLoadingTarget === destination.href;

                        return (
                          <button
                            key={destination.href}
                            type="button"
                            onClick={() => handleDemoAccess(destination.href)}
                            disabled={Boolean(demoLoadingTarget)}
                            className="bg-white p-4 text-left transition-colors hover:bg-[#f4f4f4] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex h-10 w-10 items-center justify-center bg-[#f4f4f4] text-foreground">
                                <Icon className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-foreground">
                                  {isLoading ? "Opening..." : `Demo ${destination.title}`}
                                </p>
                                <p className="mt-1 text-xs leading-6 text-muted-foreground">
                                  {destination.description}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </Tile>

            <p className="mt-6 text-sm leading-7 text-muted-foreground">
              By signing in, you agree to our{" "}
              <Link href="/terms" className="font-medium text-foreground underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="font-medium text-foreground underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </Column>
      </Grid>
    </div>
  );
}
