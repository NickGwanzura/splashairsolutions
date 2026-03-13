const requiredVars = [
  "DATABASE_URL",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
  "NEXT_PUBLIC_APP_URL",
];

const optionalVars = [
  "RESEND_API_KEY",
  "DEMO_SESSION_SECRET",
  "NEXT_PUBLIC_ENABLE_PUBLIC_DEMO",
];

const missingRequired = requiredVars.filter((name) => !process.env[name]);

if (missingRequired.length > 0) {
  console.error("Missing required environment variables for Vercel deployment:");
  for (const name of missingRequired) {
    console.error(`- ${name}`);
  }
  process.exit(1);
}

const invalidUrlVars = ["NEXTAUTH_URL", "NEXT_PUBLIC_APP_URL"].filter((name) => {
  try {
    new URL(process.env[name]);
    return false;
  } catch {
    return true;
  }
});

if (invalidUrlVars.length > 0) {
  console.error("These environment variables must contain valid absolute URLs:");
  for (const name of invalidUrlVars) {
    console.error(`- ${name}=${process.env[name]}`);
  }
  process.exit(1);
}

if (process.env.NEXTAUTH_URL !== process.env.NEXT_PUBLIC_APP_URL) {
  console.warn(
    "Warning: NEXTAUTH_URL and NEXT_PUBLIC_APP_URL do not match. This is allowed, but it is usually unintentional."
  );
}

for (const name of optionalVars) {
  if (!process.env[name]) {
    console.warn(`Optional env not set: ${name}`);
  }
}

console.log("Vercel environment check passed.");
