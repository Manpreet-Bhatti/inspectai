export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="from-background via-background to-muted min-h-screen bg-gradient-to-br">
      {children}
    </div>
  );
}
