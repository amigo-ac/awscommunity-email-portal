"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Users,
  Award,
  Star,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  AlertCircle
} from "lucide-react";

type CommunityType = "cc" | "ug" | "cb" | "hero";

const communityTypes = [
  {
    id: "cc" as const,
    name: "AWS Cloud Club",
    description: "For student-led technical communities",
    prefix: "cc.",
    placeholder: "tecmonterrey",
    nameLabel: "School/Club Name",
    namePlaceholder: "Tec de Monterrey",
    nameHelp: "Enter the name of your school or club",
    icon: GraduationCap,
  },
  {
    id: "ug" as const,
    name: "AWS User Group",
    description: "For local city-based user groups",
    prefix: "ug.",
    placeholder: "guadalajara",
    nameLabel: "City/Group Name",
    namePlaceholder: "Guadalajara",
    nameHelp: "Enter the city or name of your user group",
    icon: Users,
  },
  {
    id: "cb" as const,
    name: "Community Builder",
    description: "For AWS Community Builders",
    prefix: "cb.",
    placeholder: "dvictoria",
    nameLabel: "First Name",
    namePlaceholder: "David",
    nameHelp: "Enter your first name",
    icon: Award,
  },
  {
    id: "hero" as const,
    name: "AWS Hero",
    description: "For AWS Heroes",
    prefix: "hero.",
    placeholder: "dvictoria",
    nameLabel: "First Name",
    namePlaceholder: "David",
    nameHelp: "Enter your first name",
    icon: Star,
  },
];

const EMAIL_DOMAIN = "awscommunity.mx";

export function RegistrationWizard() {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<CommunityType | null>(null);
  const [token, setToken] = useState("");
  const [username, setUsername] = useState("");

  // New fields
  const [firstName, setFirstName] = useState(""); // For CB/Hero: first name. For CC/UG: org name
  const [lastName, setLastName] = useState(""); // Only for CB/Hero
  const [contactName, setContactName] = useState(""); // Only for CC/UG
  const [phone, setPhone] = useState("");
  const [alternativeEmail, setAlternativeEmail] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [createdEmail, setCreatedEmail] = useState("");
  const [tempPassword, setTempPassword] = useState("");

  const selectedTypeInfo = communityTypes.find((t) => t.id === selectedType);
  const fullEmail = selectedTypeInfo
    ? `${selectedTypeInfo.prefix}${username}@${EMAIL_DOMAIN}`
    : "";

  const isOrgType = selectedType === "cc" || selectedType === "ug";

  const validateToken = async () => {
    if (!selectedType || !token) return;
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/validate-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: selectedType, token }),
      });
      const data = await res.json();
      if (data.valid) {
        setTokenValid(true);
        setStep(3);
      } else {
        setTokenValid(false);
        setError("Invalid token. Please check with your community leader.");
      }
    } catch {
      setError("Failed to validate token. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const checkUsername = async () => {
    if (!selectedType || !username) return;
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/check-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: selectedType, username }),
      });
      const data = await res.json();
      setUsernameAvailable(data.available);
      if (!data.available) {
        setError("This username is already taken. Please choose another.");
      }
    } catch {
      setError("Failed to check username. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const canProceedToStep4 = () => {
    if (!username || usernameAvailable !== true) return false;
    if (isOrgType) {
      return firstName && contactName && alternativeEmail;
    } else {
      return firstName && lastName && alternativeEmail;
    }
  };

  const createEmail = async () => {
    if (!selectedType || !username || !tokenValid) return;
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedType,
          username,
          token,
          firstName,
          // For CC/UG: store contact person in lastName field
          // For CB/Hero: store actual lastName
          lastName: isOrgType ? contactName : lastName,
          phone,
          alternativeEmail,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCreatedEmail(data.email);
        setTempPassword(data.tempPassword);
        setStep(4);
      } else {
        setError(data.error || "Failed to create email. Please try again.");
      }
    } catch {
      setError("Failed to create email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress indicator */}
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= s
                  ? "bg-orange-500 text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step > s ? <Check className="h-4 w-4" /> : s}
            </div>
            {s < 4 && (
              <div
                className={`w-12 h-1 ${
                  step > s ? "bg-orange-500" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Select Community Type */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Your Community Type</CardTitle>
            <CardDescription>
              Choose the type that best represents your role in the AWS community.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              {communityTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedType === type.id
                      ? "border-orange-500 bg-orange-50"
                      : "border-border hover:border-orange-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                      <type.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium">{type.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {type.description}
                      </div>
                      <div className="mt-2 text-xs font-mono text-muted-foreground">
                        {type.prefix}
                        {type.placeholder}@{EMAIL_DOMAIN}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => setStep(2)}
                disabled={!selectedType}
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Enter Token */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Enter Access Token</CardTitle>
            <CardDescription>
              Enter the token provided by your community leader to verify your membership.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                {selectedTypeInfo && (
                  <>
                    <selectedTypeInfo.icon className="h-5 w-5 text-orange-500" />
                    <span className="font-medium">{selectedTypeInfo.name}</span>
                  </>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="token">Access Token</Label>
                <Input
                  id="token"
                  type="password"
                  placeholder="Enter your token"
                  value={token}
                  onChange={(e) => {
                    setToken(e.target.value);
                    setTokenValid(null);
                    setError("");
                  }}
                />
              </div>
              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={validateToken}
                disabled={!token || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Validate Token
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Enter Details */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Enter Your Details</CardTitle>
            <CardDescription>
              Fill in your information to create your @{EMAIL_DOMAIN} email.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                {selectedTypeInfo && (
                  <>
                    <selectedTypeInfo.icon className="h-5 w-5 text-orange-500" />
                    <span className="font-medium">{selectedTypeInfo.name}</span>
                    <Badge variant="secondary" className="ml-auto">
                      Token verified
                    </Badge>
                  </>
                )}
              </div>

              {/* Username field */}
              <div className="space-y-2">
                <Label htmlFor="username">Email Username</Label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground font-mono">
                    {selectedTypeInfo?.prefix}
                  </span>
                  <Input
                    id="username"
                    placeholder={selectedTypeInfo?.placeholder}
                    value={username}
                    onChange={(e) => {
                      const value = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "");
                      setUsername(value);
                      setUsernameAvailable(null);
                      setError("");
                    }}
                    onBlur={checkUsername}
                  />
                  <span className="text-muted-foreground font-mono">
                    @{EMAIL_DOMAIN}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Only lowercase letters and numbers are allowed.
                </p>
                {username && usernameAvailable === true && (
                  <Badge variant="default" className="bg-green-500">
                    <Check className="mr-1 h-3 w-3" />
                    Available
                  </Badge>
                )}
                {username && usernameAvailable === false && (
                  <Badge variant="destructive">Not available</Badge>
                )}
              </div>

              {/* Conditional fields based on type */}
              {isOrgType ? (
                // CC/UG: Organization name + Contact person
                <>
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{selectedTypeInfo?.nameLabel} *</Label>
                    <Input
                      id="firstName"
                      placeholder={selectedTypeInfo?.namePlaceholder}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">
                      {selectedTypeInfo?.nameHelp}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Contact Person Name *</Label>
                    <Input
                      id="contactName"
                      placeholder="Juan Pérez"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">
                      Name of the main contact for this group
                    </p>
                  </div>
                </>
              ) : (
                // CB/Hero: First name + Last name
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        placeholder="David"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        placeholder="Victoria"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Common fields */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+52 55 1234 5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alternativeEmail">Alternative Email *</Label>
                <Input
                  id="alternativeEmail"
                  type="email"
                  placeholder="your.email@gmail.com"
                  value={alternativeEmail}
                  onChange={(e) => setAlternativeEmail(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  We&apos;ll send your temporary password to this email
                </p>
              </div>

              {/* Email preview */}
              {username && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Email preview:</p>
                  <p className="font-mono font-medium">{fullEmail}</p>
                  {firstName && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Display name: {isOrgType
                        ? `${selectedType === "cc" ? "AWS Cloud Club at" : "AWS User Group"} ${firstName} (México)`
                        : `${firstName} ${lastName} (${selectedType === "hero" ? "AWS Hero" : "Community Builder"})`
                      }
                    </p>
                  )}
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={createEmail}
                disabled={!canProceedToStep4() || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Create Email
                <Check className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Success */}
      {step === 4 && (
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle>Email Created Successfully!</CardTitle>
            <CardDescription>
              Your new email address is ready to use.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-1">Your new email:</p>
              <p className="text-xl font-mono font-bold">{createdEmail}</p>
            </div>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="font-medium text-yellow-800 mb-2">Temporary Password</p>
              <p className="font-mono bg-white p-2 rounded border text-center select-all">
                {tempPassword}
              </p>
              <p className="text-sm text-yellow-700 mt-2">
                You will be required to change this password on your first login.
              </p>
            </div>
            <div className="space-y-2 text-sm">
              <p className="font-medium">Next steps:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Go to <a href="https://mail.google.com" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">mail.google.com</a></li>
                <li>Sign in with <strong>{createdEmail}</strong></li>
                <li>Use the temporary password above</li>
                <li>Set a new secure password when prompted</li>
              </ol>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              <p>A confirmation email has been sent to <strong>{alternativeEmail}</strong></p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
