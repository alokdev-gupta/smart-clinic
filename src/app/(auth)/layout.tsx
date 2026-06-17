export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center"
      style={{ background: "#0F172A" }}
    >
      {children}
    </div>
  );
}
