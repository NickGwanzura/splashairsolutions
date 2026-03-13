import { auth } from "@/lib/auth/auth";
import { DEMO_COOKIE_NAME, isDemoCookieValue, isPublicDemoEnabled } from "@/lib/demo";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();
  const cookieStore = await cookies();
  const isDemo =
    isPublicDemoEnabled() &&
    isDemoCookieValue(cookieStore.get(DEMO_COOKIE_NAME)?.value);

  if (session?.user?.id || isDemo) {
    redirect("/dashboard");
  }

  redirect("/login");
}
