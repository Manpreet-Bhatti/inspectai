import Link from "next/link";
import { 
  Camera, 
  Mic, 
  FileText, 
  Sparkles, 
  ArrowRight,
  CheckCircle,
  Zap,
  Shield
} from "lucide-react";

const features = [
  {
    icon: Camera,
    title: "Photo Analysis",
    description: "AI automatically identifies issues, damage, and conditions from your photos",
  },
  {
    icon: Mic,
    title: "Voice Notes",
    description: "Record observations hands-free and get automatic transcriptions",
  },
  {
    icon: Sparkles,
    title: "Smart Findings",
    description: "AI generates findings with severity ratings and cost estimates",
  },
  {
    icon: FileText,
    title: "Instant Reports",
    description: "Generate professional PDF reports in seconds, not hours",
  },
];

const benefits = [
  "Reduce inspection time by 60%",
  "Never miss a critical issue",
  "Consistent, professional reports",
  "Historical pattern matching",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-sm font-bold text-primary-foreground">AI</span>
              </div>
              <span className="text-xl font-bold text-foreground">InspectAI</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              AI-Powered Property
              <span className="block text-primary">Inspection Reports</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Transform photos and voice notes into comprehensive inspection reports 
              with AI-identified issues, severity ratings, and cost estimates. 
              Complete inspections in minutes, not hours.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-6 py-3 text-base font-semibold text-foreground hover:bg-muted"
              >
                View Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Everything you need for modern inspections
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Powerful AI tools that make property inspections faster and more accurate
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-border bg-card p-6 shadow-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-muted/50 py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Work smarter, not harder
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                InspectAI helps you complete more inspections with better accuracy, 
                giving you more time to grow your business.
              </p>
              <ul className="mt-8 space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-6">
                <Zap className="h-8 w-8 text-amber-500" />
                <p className="mt-4 text-3xl font-bold text-foreground">60%</p>
                <p className="text-sm text-muted-foreground">Faster inspections</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-6">
                <Shield className="h-8 w-8 text-green-500" />
                <p className="mt-4 text-3xl font-bold text-foreground">99.2%</p>
                <p className="text-sm text-muted-foreground">Issue detection rate</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-6">
                <FileText className="h-8 w-8 text-blue-500" />
                <p className="mt-4 text-3xl font-bold text-foreground">10k+</p>
                <p className="text-sm text-muted-foreground">Reports generated</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-6">
                <Sparkles className="h-8 w-8 text-purple-500" />
                <p className="mt-4 text-3xl font-bold text-foreground">500+</p>
                <p className="text-sm text-muted-foreground">Active inspectors</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-primary px-6 py-16 text-center sm:px-16">
            <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
              Ready to transform your inspections?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/80">
              Join thousands of inspectors who are already saving time and delivering 
              better reports with InspectAI.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-base font-semibold text-primary shadow-sm hover:bg-white/90"
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
                <span className="text-xs font-bold text-primary-foreground">AI</span>
              </div>
              <span className="font-semibold text-foreground">InspectAI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} InspectAI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
