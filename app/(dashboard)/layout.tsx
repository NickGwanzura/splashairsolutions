import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { getUserById } from "@/lib/db/prisma";
import { DEMO_COOKIE_NAME, getDemoRoleFromCookie, getDemoUser, isPublicDemoEnabled } from "@/lib/demo";
import type { Session } from "next-auth";
import type { User } from "@/types";

function buildSessionFallbackUser(session: Session) {
  const now = new Date();

  const fallbackUser: User = {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name ?? "HVACOps User",
    avatar: session.user.avatar ?? null,
    phone: null,
    role: session.user.role,
    status: "ACTIVE",
    organizationId: session.user.organizationId,
    lastLoginAt: now,
    createdAt: now,
    updatedAt: now,
  };

  return fallbackUser;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const cookieStore = await cookies();
  const demoRole = isPublicDemoEnabled()
    ? getDemoRoleFromCookie(cookieStore.get(DEMO_COOKIE_NAME)?.value)
    : null;
  const isDemo = Boolean(demoRole);

  if (!session?.user?.id && !isDemo) {
    redirect("/login");
  }

  let user: User | null = demoRole ? getDemoUser(demoRole) : null;

  if (session?.user?.id) {
    try {
      user = await getUserById(session.user.id);
    } catch {
      user = buildSessionFallbackUser(session);
    }

    if (!user) {
      user = buildSessionFallbackUser(session);
    }
  }

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <div className="hidden shrink-0 lg:block">
        <Sidebar role={user.role} />
      </div>
      <div className="flex min-h-screen min-w-0 flex-1 flex-col overflow-hidden">
        <Header user={user} notificationCount={3} isDemo={isDemo && !session?.user?.id} />
        {isDemo && !session?.user?.id && (
          <div className="border-b border-[#f1c21b] bg-[#fcf4d6] px-4 py-3 text-sm text-[#5e4200] sm:px-6 lg:px-8">
            Demo mode is active. You can explore every dashboard, but account-changing actions stay read-only.
          </div>
        )}
        <main className="flex-1 overflow-auto bg-[linear-gradient(180deg,#ffffff_0%,#f4f4f4_16rem)]">
          <div className="mx-auto w-full max-w-[1600px] px-4 pb-10 pt-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
