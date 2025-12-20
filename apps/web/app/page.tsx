import Link from "next/link";
import {
  Camera,
  Mic,
  FileText,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Zap,
  Shield,
} from "lucide-react";
import { LandingNav } from "@/components/LandingNav";

const features = [
  {
    icon: Camera,
    title: "Photo Analysis",
    description:
      "AI automatically identifies issues, damage, and conditions from your photos",
  },
  {
    icon: Mic,
    title: "Voice Notes",
    description:
      "Record observations hands-free and get automatic transcriptions",
  },
  {
    icon: Sparkles,
    title: "Smart Findings",
    description:
      "AI generates findings with severity ratings and cost estimates",
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
    <div className="bg-background min-h-screen">
      {/* Navigation */}
      <nav className="border-border border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <img
              src="/images/logo.svg"
              alt="InspectAI Logo"
              className="h-auto w-52"
            />
            <LandingNav />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="from-primary/5 absolute inset-0 -z-10 bg-linear-to-b via-transparent to-transparent" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-foreground text-4xl font-bold tracking-tight sm:text-6xl">
              AI-Powered Property
              <span className="text-primary block">Inspection Reports</span>
            </h1>
            <p className="text-muted-foreground mt-6 text-lg">
              Transform photos and voice notes into comprehensive inspection
              reports with AI-identified issues, severity ratings, and cost
              estimates. Complete inspections in minutes, not hours.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-6 py-3 text-base font-semibold shadow-sm"
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="border-input bg-background text-foreground hover:bg-muted inline-flex items-center gap-2 rounded-lg border px-6 py-3 text-base font-semibold"
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
            <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need for modern inspections
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Powerful AI tools that make property inspections faster and more
              accurate
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="border-border bg-card rounded-xl border p-6 shadow-sm"
              >
                <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg">
                  <feature.icon className="text-primary h-6 w-6" />
                </div>
                <h3 className="text-foreground mt-4 text-lg font-semibold">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground mt-2 text-sm">
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
              <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
                Work smarter, not harder
              </h2>
              <p className="text-muted-foreground mt-4 text-lg">
                InspectAI helps you complete more inspections with better
                accuracy, giving you more time to grow your business.
              </p>
              <ul className="mt-8 space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 shrink-0 text-green-500" />
                    <span className="text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="border-border bg-card rounded-xl border p-6">
                <Zap className="h-8 w-8 text-amber-500" />
                <p className="text-foreground mt-4 text-3xl font-bold">60%</p>
                <p className="text-muted-foreground text-sm">
                  Faster inspections
                </p>
              </div>
              <div className="border-border bg-card rounded-xl border p-6">
                <Shield className="h-8 w-8 text-green-500" />
                <p className="text-foreground mt-4 text-3xl font-bold">99.2%</p>
                <p className="text-muted-foreground text-sm">
                  Issue detection rate
                </p>
              </div>
              <div className="border-border bg-card rounded-xl border p-6">
                <FileText className="h-8 w-8 text-blue-500" />
                <p className="text-foreground mt-4 text-3xl font-bold">10k+</p>
                <p className="text-muted-foreground text-sm">
                  Reports generated
                </p>
              </div>
              <div className="border-border bg-card rounded-xl border p-6">
                <Sparkles className="h-8 w-8 text-purple-500" />
                <p className="text-foreground mt-4 text-3xl font-bold">500+</p>
                <p className="text-muted-foreground text-sm">
                  Active inspectors
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-primary rounded-2xl px-6 py-16 text-center sm:px-16">
            <h2 className="text-primary-foreground text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to transform your inspections?
            </h2>
            <p className="text-primary-foreground/80 mx-auto mt-4 max-w-xl text-lg">
              Join thousands of inspectors who are already saving time and
              delivering better reports with InspectAI.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="text-primary inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-base font-semibold shadow-sm hover:bg-white/90"
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-border border-t py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <img
              src="/images/logo.svg"
              alt="InspectAI Logo"
              className="h-auto w-40"
            />
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} InspectAI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
