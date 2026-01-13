import { auth } from "@/lib/auth";
import { UserMenu } from "@/components/user-menu";
import {
  GraduationCap,
  Users,
  Award,
  Star,
  ArrowRight,
  Shield,
  Zap,
  Globe,
} from "lucide-react";
import Link from "next/link";

const communityTypes = [
  {
    id: "cc",
    name: "AWS Cloud Club",
    description: "Student-led technical communities at educational institutions",
    example: "cc.tec@awscommunity.mx",
    icon: GraduationCap,
    color: "#c084fc",
  },
  {
    id: "ug",
    name: "AWS User Group",
    description: "Local community groups for AWS enthusiasts in cities",
    example: "ug.guadalajara@awscommunity.mx",
    icon: Users,
    color: "#fbbf24",
  },
  {
    id: "cb",
    name: "Community Builder",
    description: "AWS Community Builders program members",
    example: "cb.dvictoria@awscommunity.mx",
    icon: Award,
    color: "#34d399",
  },
  {
    id: "hero",
    name: "AWS Hero",
    description: "AWS Heroes recognized for their contributions",
    example: "hero.dvictoria@awscommunity.mx",
    icon: Star,
    color: "#f472b6",
  },
];

const steps = [
  {
    number: "01",
    title: "Select target community",
    description: "Choose your community type from Cloud Club, User Group, Community Builder, or Hero.",
  },
  {
    number: "02",
    title: "Verify membership",
    description: "Enter the access token provided by your community leader to verify your membership.",
  },
  {
    number: "03",
    title: "Create your email",
    description: "Pick your username and receive your @awscommunity.mx address instantly.",
  },
];

const features = [
  {
    icon: Shield,
    title: "Secure & Verified",
    description: "Token-based verification ensures only legitimate community members get access.",
  },
  {
    icon: Zap,
    title: "Instant Setup",
    description: "Your email is ready to use immediately after verification.",
  },
  {
    icon: Globe,
    title: "Google Workspace",
    description: "Full access to Gmail, Drive, Calendar, and all Google Workspace apps.",
  },
];

// Pixel graphic composition inspired by AWS Builder Center
function PixelGraphic() {
  return (
    <div className="relative w-[340px] h-[280px]">
      {/* Main composition - staggered diagonal */}
      <div className="absolute top-0 right-0 flex flex-col gap-1">
        {/* Row 1 */}
        <div className="flex gap-1 justify-end">
          <div className="w-11 h-11 rounded-[3px] bg-[#22d3ee]" />
          <div className="w-11 h-11 rounded-[3px] bg-[#67e8f9]/70" />
        </div>
        {/* Row 2 */}
        <div className="flex gap-1 justify-end pr-12">
          <div className="w-11 h-11 rounded-[3px] bg-[#c084fc]" />
          <div className="w-11 h-11 rounded-[3px] bg-[#d8b4fe]/80" />
          <div className="w-11 h-11 rounded-[3px] bg-[#67e8f9]/40" />
        </div>
        {/* Row 3 */}
        <div className="flex gap-1 justify-end pr-24">
          <div className="w-11 h-11 rounded-[3px] bg-[#a855f7]/60" />
          <div className="w-11 h-11 rounded-[3px] bg-[#f472b6]" />
          <div className="w-11 h-11 rounded-[3px] bg-[#f9a8d4]/70" />
        </div>
        {/* Row 4 */}
        <div className="flex gap-1 justify-end pr-36">
          <div className="w-11 h-11 rounded-[3px] bg-[#f472b6]/70" />
          <div className="w-11 h-11 rounded-[3px] bg-[#fb923c]" />
          <div className="w-11 h-11 rounded-[3px] bg-[#fbbf24]/60" />
        </div>
        {/* Row 5 */}
        <div className="flex gap-1 justify-end pr-48">
          <div className="w-11 h-11 rounded-[3px] bg-[#4ade80]/60" />
          <div className="w-11 h-11 rounded-[3px] bg-[#34d399]" />
          <div className="w-11 h-11 rounded-[3px] bg-[#fbbf24]/80" />
        </div>
      </div>

      {/* Floating accent blocks */}
      <div className="absolute top-2 left-8 w-3 h-3 rounded-[2px] bg-[#34d399] animate-pulse" />
      <div className="absolute bottom-16 right-4 w-2 h-2 rounded-[1px] bg-[#c084fc]/60" />
    </div>
  );
}

// Small decorative pixel cluster for cards
function MiniPixels({ colors }: { colors: string[] }) {
  return (
    <div className="grid grid-cols-3 gap-0.5">
      {[...Array(9)].map((_, i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-[1px]"
          style={{
            backgroundColor: i < colors.length ? colors[i] : "transparent",
            opacity: i < colors.length ? 0.6 + Math.random() * 0.4 : 0,
          }}
        />
      ))}
    </div>
  );
}

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-[#2d2d3a]">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#00d4aa] flex items-center justify-center">
              <span className="text-[#0a0a0f] font-heading font-semibold text-sm">MX</span>
            </div>
            <span className="font-heading text-[#e6edf3] text-sm">AWS Community</span>
          </Link>

          <div className="flex items-center gap-4">
            <UserMenu user={session?.user ?? null} />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center gradient-hero pt-14">
        <div className="max-w-7xl mx-auto px-6 py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left content */}
            <div className="max-w-lg">
              <h1 className="font-heading text-[#e6edf3] text-4xl md:text-5xl leading-tight mb-6 animate-fade-in-up">
                Your ideas.
                <br />
                Your community.
                <br />
                Your AWS.
              </h1>

              <p className="text-[#7d8590] text-lg leading-relaxed mb-8 animate-fade-in-up delay-100">
                Connect with builders who understand your journey. Get your professional @awscommunity.mx email address and represent the AWS community in Mexico.
              </p>

              <div className="flex items-center gap-4 animate-fade-in-up delay-200">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#00d4aa] text-[#0a0a0f] text-sm font-semibold hover:bg-[#00c49a] transition-all hover:shadow-[0_0_20px_rgba(0,212,170,0.4)]"
                >
                  Join the community
                </Link>
                <Link
                  href="#community-types"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-[#3d3d4a] text-[#e6edf3] text-sm font-medium hover:border-[#e6edf3] hover:bg-[#e6edf3]/5 transition-all"
                >
                  Learn more
                </Link>
              </div>
            </div>

            {/* Right - Pixel graphic */}
            <div className="hidden lg:flex justify-center">
              <PixelGraphic />
            </div>
          </div>
        </div>
      </section>

      {/* Community Types */}
      <section id="community-types" className="py-20 px-6 bg-[#0a0a0f]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h2 className="font-heading text-[#e6edf3] text-2xl">Community Types</h2>
            <div className="flex gap-2">
              <button className="w-9 h-9 flex items-center justify-center border border-[#2d2d3a] rounded-md text-[#7d8590] hover:text-[#e6edf3] hover:border-[#e6edf3] transition-colors">
                <ArrowRight className="w-4 h-4 rotate-180" />
              </button>
              <button className="w-9 h-9 flex items-center justify-center border border-[#2d2d3a] rounded-md text-[#7d8590] hover:text-[#e6edf3] hover:border-[#e6edf3] transition-colors">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {communityTypes.map((type, index) => (
              <Link
                key={type.id}
                href="/register"
                className="group relative p-5 rounded-lg bg-[#12121a] border border-[#2d2d3a] hover:border-[#3d3d4a] transition-all animate-fade-in-up"
                style={{ animationDelay: `${index * 75}ms` }}
              >
                {/* Top accent bar */}
                <div
                  className="absolute top-0 left-4 right-4 h-[2px] rounded-b-full"
                  style={{ backgroundColor: type.color }}
                />

                <div className="pt-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${type.color}15` }}
                  >
                    <type.icon className="w-5 h-5" style={{ color: type.color }} />
                  </div>

                  <h3 className="text-[#e6edf3] font-medium mb-2">{type.name}</h3>
                  <p className="text-[#7d8590] text-sm mb-4 line-clamp-2">{type.description}</p>

                  <div className="font-mono text-xs text-[#7d8590] bg-[#0a0a0f] rounded px-2.5 py-1.5 border border-[#2d2d3a]">
                    {type.example}
                  </div>
                </div>

                {/* Hover arrow */}
                <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-4 h-4 text-[#7d8590]" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-6 bg-[#0a0a0f] border-t border-[#2d2d3a]">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-heading text-[#e6edf3] text-2xl mb-10">
            Easily plan and validate
          </h2>

          <div className="grid md:grid-cols-3 gap-5">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="relative p-6 rounded-lg bg-[#12121a] border border-[#2d2d3a] animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Decorative pixels */}
                <div className="absolute top-4 right-4">
                  <MiniPixels
                    colors={
                      index === 0
                        ? ["#c084fc", "#c084fc", "", "#f472b6", "#f472b6", "", "", "#34d399", ""]
                        : index === 1
                        ? ["#22d3ee", "#22d3ee", "", "#c084fc", "#c084fc", "", "", "#fbbf24", ""]
                        : ["#34d399", "#34d399", "", "#fbbf24", "#fbbf24", "", "", "#f472b6", ""]
                    }
                  />
                </div>

                {/* Step number */}
                <div className="flex items-center justify-center h-24 mb-4">
                  <span className="font-heading text-6xl text-[#2d2d3a] select-none">{step.number}</span>
                </div>

                <p className="text-xs text-[#7d8590] uppercase tracking-wider mb-1.5">Step {index + 1}</p>
                <h3 className="text-[#e6edf3] font-medium mb-2">{step.title}</h3>
                <p className="text-[#7d8590] text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-[#0a0a0f] border-t border-[#2d2d3a]">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-5">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="p-6 rounded-lg bg-[#12121a] border border-[#2d2d3a] animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-10 h-10 rounded-lg bg-[#00d4aa]/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-[#00d4aa]" />
                </div>
                <h3 className="text-[#e6edf3] font-medium mb-2">{feature.title}</h3>
                <p className="text-[#7d8590] text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-[#0a0a0f] border-t border-[#2d2d3a]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-heading text-[#e6edf3] text-2xl mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-[#7d8590] mb-8">
            Create your @awscommunity.mx email address today and represent your community.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#00d4aa] text-[#0a0a0f] text-sm font-semibold hover:bg-[#00c49a] transition-all hover:shadow-[0_0_20px_rgba(0,212,170,0.4)]"
          >
            Create Your Email
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-[#0a0a0f] border-t border-[#2d2d3a]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-[#00d4aa] flex items-center justify-center">
              <span className="text-[#0a0a0f] font-heading font-semibold text-[10px]">MX</span>
            </div>
            <span className="font-heading text-[#e6edf3] text-sm">AWS Community MX</span>
          </div>
          <p className="text-[#7d8590] text-sm">AWS Community Mexico Email Portal</p>
        </div>
      </footer>
    </div>
  );
}
