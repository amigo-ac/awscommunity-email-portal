import { auth, signIn } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserMenu } from "@/components/user-menu";
import { Mail, Users, GraduationCap, Award, Star } from "lucide-react";
import Link from "next/link";

const communityTypes = [
  {
    id: "cc",
    name: "AWS Cloud Club",
    description: "Student-led technical communities at educational institutions",
    prefix: "cc.school",
    example: "cc.tec@awscommunity.mx",
    icon: GraduationCap,
  },
  {
    id: "ug",
    name: "AWS User Group",
    description: "Local community groups for AWS enthusiasts in different cities",
    prefix: "ug.city",
    example: "ug.guadalajara@awscommunity.mx",
    icon: Users,
  },
  {
    id: "cb",
    name: "Community Builder",
    description: "AWS Community Builders program members",
    prefix: "cb.name",
    example: "cb.dvictoria@awscommunity.mx",
    icon: Award,
  },
  {
    id: "hero",
    name: "AWS Hero",
    description: "AWS Heroes recognized for their community contributions",
    prefix: "hero.name",
    example: "hero.dvictoria@awscommunity.mx",
    icon: Star,
  },
];

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-6 w-6 text-orange-500" />
            <span className="font-semibold text-lg">AWS Community MX</span>
          </div>
          <UserMenu user={session?.user ?? null} />
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <Badge variant="secondary" className="mb-4">
            AWS Community Mexico
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Get Your @awscommunity.mx Email
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            As a member of the AWS community in Mexico, you can create your own
            professional email address to represent your community activities.
          </p>
          {session ? (
            <Button size="lg" asChild>
              <Link href="/register">
                <Mail className="mr-2 h-5 w-5" />
                Create Your Email
              </Link>
            </Button>
          ) : (
            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: "/register" });
              }}
            >
              <Button size="lg" type="submit">
                Sign in with Google to Continue
              </Button>
            </form>
          )}
        </div>
      </section>

      {/* Community Types */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            Email Formats by Community Type
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {communityTypes.map((type) => (
              <Card key={type.id}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                      <type.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{type.name}</CardTitle>
                      <CardDescription>{type.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted rounded-lg p-3 font-mono text-sm">
                    {type.example}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold">Sign in with Google</h3>
                <p className="text-muted-foreground">
                  Use your existing Google account to authenticate and link your identity.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold">Select Your Community Type</h3>
                <p className="text-muted-foreground">
                  Choose whether you&apos;re a Cloud Club, User Group, Community Builder, or Hero.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold">Enter Your Access Token</h3>
                <p className="text-muted-foreground">
                  Use the token provided by your community leader to verify your membership.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h3 className="font-semibold">Choose Your Username</h3>
                <p className="text-muted-foreground">
                  Pick your email username and get your @awscommunity.mx address instantly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>AWS Community Mexico Email Portal</p>
          <p className="mt-1">
            AWS and related marks are trademarks of Amazon.com, Inc.
          </p>
        </div>
      </footer>
    </div>
  );
}
