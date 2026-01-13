import Link from "next/link";
import { RegistrationWizard } from "@/components/registration-wizard";
import { ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="border-b border-[#2d2d3a] bg-[#0a0a0f]">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#00d4aa] flex items-center justify-center">
              <span className="text-[#0a0a0f] font-heading font-semibold text-sm">MX</span>
            </div>
            <span className="font-heading text-[#e6edf3] text-sm">AWS Community</span>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-[#7d8590] hover:text-[#e6edf3] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="border-b border-[#2d2d3a] bg-[#0a0a0f]">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-[#7d8590] hover:text-[#e6edf3] transition-colors">
              AWS Community MX
            </Link>
            <span className="text-[#2d2d3a]">/</span>
            <span className="text-[#e6edf3]">Register</span>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="max-w-xl mx-auto mb-10 text-center">
          <h1 className="font-heading text-2xl text-[#e6edf3] mb-2">
            Create Your Email
          </h1>
          <p className="text-[#7d8590]">
            Get your professional @awscommunity.mx email address in a few simple steps.
          </p>
        </div>

        <RegistrationWizard />
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-[#2d2d3a]">
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
