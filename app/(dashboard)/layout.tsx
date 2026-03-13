import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { getUserById } from "@/lib/db/prisma";
import { DEMO_COOKIE_NAME, demoUser, isDemoCookieValue, isPublicDemoEnabled } from "@/lib/demo";
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
  const isDemo =
    isPublicDemoEnabled() &&
    isDemoCookieValue(cookieStore.get(DEMO_COOKIE_NAME)?.value);

  if (!session?.user?.id && !isDemo) {
    redirect("/login");
  }

  let user: User | null = isDemo ? demoUser : null;

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
    <div className="flex h-screen bg-background">
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header user={user} notificationCount={3} isDemo={isDemo && !session?.user?.id} />
        {isDemo && !session?.user?.id && (
          <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:px-6 lg:px-8">
            Demo mode is active. You can explore every dashboard, but account-changing actions stay read-only.
          </div>
        )}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
