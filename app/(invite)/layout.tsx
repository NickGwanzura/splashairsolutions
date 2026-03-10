export default function InviteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-hvac-50 to-hvac-100 p-4">
      {children}
    </div>
  );
}
