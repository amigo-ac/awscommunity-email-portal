import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserMenu } from "@/components/user-menu";
import { RegistrationWizard } from "@/components/registration-wizard";
import { Mail } from "lucide-react";
import Link from "next/link";

export default async function RegisterPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/");
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Mail className="h-6 w-6 text-orange-500" />
            <span className="font-semibold text-lg">AWS Community MX</span>
          </Link>
          <UserMenu user={session.user} />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <RegistrationWizard userEmail={session.user.email} />
      </main>
    </div>
  );
}
