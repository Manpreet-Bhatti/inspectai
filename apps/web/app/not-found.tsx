import Link from "next/link";
import { FileSearch } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <FileSearch className="h-8 w-8 text-muted-foreground" />
      </div>
      <div>
        <h1 className="text-foreground text-2xl font-bold">Page not found</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          The page you&apos;re looking for doesn&apos;t exist or you don&apos;t have access.
        </p>
      </div>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
      >
        Go to dashboard
      </Link>
    </div>
  );
}
