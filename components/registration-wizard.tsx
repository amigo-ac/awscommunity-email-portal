"use client";

import { useState, useEffect, useCallback } from "react";
import { IMaskInput } from "react-imask";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  GraduationCap,
  Users,
  Award,
  Star,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  AlertCircle,
  Mail,
  Copy,
  ExternalLink,
  Camera,
  Linkedin,
  Twitter,
  Github,
  Instagram,
  Facebook,
  Youtube,
  Globe,
  MapPin,
  Building,
  Briefcase,
  X,
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
    color: "#c084fc",
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
    color: "#fbbf24",
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
    color: "#34d399",
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
    color: "#f472b6",
  },
];

const EMAIL_DOMAIN = "awscommunity.mx";

export function RegistrationWizard() {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<CommunityType | null>(null);
  const [token, setToken] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [alternativeEmail, setAlternativeEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [createdEmail, setCreatedEmail] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [copied, setCopied] = useState(false);

  // Profile & Social fields (Step 4)
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [twitter, setTwitter] = useState("");
  const [github, setGithub] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [youtube, setYoutube] = useState("");
  const [website, setWebsite] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);

  const selectedTypeInfo = communityTypes.find((t) => t.id === selectedType);
  const fullEmail = selectedTypeInfo
    ? `${selectedTypeInfo.prefix}${username}@${EMAIL_DOMAIN}`
    : "";
  const isOrgType = selectedType === "cc" || selectedType === "ug";
  const isPersonType = selectedType === "cb" || selectedType === "hero";

  // Generate username from first initial + first last name
  // e.g., "David Eduardo" + "Victoria Ramírez" → "dvictoria"
  const generateUsername = useCallback((first: string, last: string): string => {
    if (!first || !last) return "";
    // Take only the first word from each field
    const firstName = first.trim().split(/\s+/)[0] || "";
    const lastName = last.trim().split(/\s+/)[0] || "";
    // Remove accents and normalize to ASCII
    const normalize = (str: string) =>
      str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove diacritical marks
        .replace(/[^a-z]/g, ""); // Keep only a-z
    const cleanFirst = normalize(firstName);
    const cleanLast = normalize(lastName);
    if (!cleanFirst || !cleanLast) return "";
    return `${cleanFirst[0]}${cleanLast}`;
  }, []);

  // Auto-generate username for CB/Hero when names change
  useEffect(() => {
    if (!isPersonType || step !== 3) return;

    const generatedUsername = generateUsername(firstName, lastName);
    if (generatedUsername && generatedUsername !== username) {
      setUsername(generatedUsername);
      setUsernameAvailable(null);
      setError("");
    }
  }, [firstName, lastName, isPersonType, step, generateUsername, username]);

  // Auto-check username availability for CB/Hero when username is generated
  useEffect(() => {
    if (!isPersonType || !username || step !== 3) return;

    const checkAvailability = async () => {
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
          setError("This username is already taken. Please contact an administrator.");
        }
      } catch {
        setError("Failed to check username availability.");
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(checkAvailability, 300);
    return () => clearTimeout(timeoutId);
  }, [username, selectedType, isPersonType, step]);

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
          lastName: isOrgType ? contactName : lastName,
          phone,
          alternativeEmail,
          // Profile fields
          bio,
          location,
          company: isPersonType ? company : undefined,
          jobTitle: isPersonType ? jobTitle : undefined,
          profileImage,
          // Social networks
          linkedin,
          twitter,
          github,
          instagram,
          facebook,
          youtube,
          website,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCreatedEmail(data.email);
        setTempPassword(data.tempPassword);
        setStep(5);
      } else {
        setError(data.error || "Failed to create email. Please try again.");
      }
    } catch {
      setError("Failed to create email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(tempPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stepLabels = ["Community", "Verify", "Details", "Profile", "Complete"];

  // Handle image upload and resize
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB before resize)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas for resizing
        const canvas = document.createElement("canvas");
        const size = 256; // Google Workspace photo size
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          // Calculate crop dimensions (center crop to square)
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;

          // Draw resized and cropped image
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);

          // Convert to base64 JPEG
          const base64 = canvas.toDataURL("image/jpeg", 0.8);
          setProfileImage(base64);
          setProfileImagePreview(base64);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setProfileImage(null);
    setProfileImagePreview(null);
  };

  return (
    <div className="max-w-xl mx-auto">
      {/* Step indicator */}
      <div className="flex items-center justify-between mb-10 px-2">
        {stepLabels.map((label, i) => (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  step > i + 1
                    ? "bg-[#00d4aa] text-[#0a0a0f]"
                    : step === i + 1
                    ? "bg-[#00d4aa] text-[#0a0a0f] glow-sm"
                    : "bg-[#1a1a24] text-[#7d8590] border border-[#2d2d3a]"
                }`}
              >
                {step > i + 1 ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-xs mt-2 ${step >= i + 1 ? "text-[#e6edf3]" : "text-[#7d8590]"}`}>
                {label}
              </span>
            </div>
            {i < 4 && (
              <div
                className={`w-8 sm:w-14 h-[2px] mx-1 rounded-full transition-all ${
                  step > i + 1 ? "bg-[#00d4aa]" : "bg-[#2d2d3a]"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Select Community Type */}
      {step === 1 && (
        <div className="bg-[#12121a] border border-[#2d2d3a] rounded-lg p-6 animate-scale-in">
          <div className="mb-6">
            <h2 className="font-heading text-xl text-[#e6edf3] mb-1.5">Select Your Community</h2>
            <p className="text-[#7d8590] text-sm">
              Choose the type that best represents your role.
            </p>
          </div>

          <div className="grid gap-3">
            {communityTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`group relative flex items-start gap-4 p-4 rounded-lg text-left transition-all ${
                  selectedType === type.id
                    ? "bg-[#1a1a24] border-2"
                    : "bg-[#0a0a0f] border border-[#2d2d3a] hover:border-[#3d3d4a]"
                }`}
                style={{
                  borderColor: selectedType === type.id ? type.color : undefined,
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${type.color}15` }}
                >
                  <type.icon className="w-5 h-5" style={{ color: type.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[#e6edf3]">{type.name}</div>
                  <div className="text-sm text-[#7d8590] mt-0.5">{type.description}</div>
                  <div className="font-mono text-xs text-[#7d8590] mt-2">
                    {type.prefix}example@{EMAIL_DOMAIN}
                  </div>
                </div>
                {selectedType === type.id && (
                  <div
                    className="absolute top-4 right-4 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: type.color }}
                  >
                    <Check className="w-3 h-3 text-[#0a0a0f]" />
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              onClick={() => setStep(2)}
              disabled={!selectedType}
              className="bg-[#00d4aa] hover:bg-[#00c49a] text-[#0a0a0f] font-medium px-5 h-10 disabled:opacity-50"
            >
              Continue
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Enter Token */}
      {step === 2 && (
        <div className="bg-[#12121a] border border-[#2d2d3a] rounded-lg p-6 animate-scale-in">
          <div className="mb-6">
            <h2 className="font-heading text-xl text-[#e6edf3] mb-1.5">Verify Membership</h2>
            <p className="text-[#7d8590] text-sm">
              Enter the access token provided by your community leader.
            </p>
          </div>

          <div className="space-y-5">
            {/* Selected type badge */}
            <div
              className="flex items-center gap-3 p-3 rounded-lg border"
              style={{
                backgroundColor: `${selectedTypeInfo?.color}08`,
                borderColor: `${selectedTypeInfo?.color}30`,
              }}
            >
              {selectedTypeInfo && (
                <>
                  <selectedTypeInfo.icon
                    className="w-5 h-5"
                    style={{ color: selectedTypeInfo.color }}
                  />
                  <span className="font-medium text-[#e6edf3]">{selectedTypeInfo.name}</span>
                </>
              )}
            </div>

            {/* Token input */}
            <div className="space-y-2">
              <Label htmlFor="token" className="text-[#e6edf3] text-sm">
                Access Token
              </Label>
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
                className="bg-[#0a0a0f] border-[#2d2d3a] text-[#e6edf3] placeholder:text-[#7d8590] focus:border-[#00d4aa] focus:ring-[#00d4aa]/20 h-11"
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-start gap-2.5 text-sm bg-[#f8514915] border border-[#f8514930] text-[#f85149] p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-between">
            <Button
              variant="outline"
              onClick={() => setStep(1)}
              className="border-[#2d2d3a] text-[#e6edf3] hover:bg-[#1a1a24] h-10"
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back
            </Button>
            <Button
              onClick={validateToken}
              disabled={!token || isLoading}
              className="bg-[#00d4aa] hover:bg-[#00c49a] text-[#0a0a0f] font-medium px-5 h-10 disabled:opacity-50"
            >
              {isLoading && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
              Validate
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Enter Details */}
      {step === 3 && (
        <div className="bg-[#12121a] border border-[#2d2d3a] rounded-lg p-6 animate-scale-in">
          <div className="mb-6">
            <h2 className="font-heading text-xl text-[#e6edf3] mb-1.5">Your Details</h2>
            <p className="text-[#7d8590] text-sm">
              Fill in your information to create your email.
            </p>
          </div>

          <div className="space-y-5">
            {/* Verified badge */}
            <div
              className="flex items-center justify-between p-3 rounded-lg border"
              style={{
                backgroundColor: `${selectedTypeInfo?.color}08`,
                borderColor: `${selectedTypeInfo?.color}30`,
              }}
            >
              <div className="flex items-center gap-3">
                {selectedTypeInfo && (
                  <>
                    <selectedTypeInfo.icon
                      className="w-5 h-5"
                      style={{ color: selectedTypeInfo.color }}
                    />
                    <span className="font-medium text-[#e6edf3]">{selectedTypeInfo.name}</span>
                  </>
                )}
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-[#34d39915] text-[#34d399] border border-[#34d39930]">
                Verified
              </span>
            </div>

            {/* CB/Hero: Name fields first, then read-only email */}
            {isPersonType ? (
              <>
                {/* Name fields first for CB/Hero */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-[#e6edf3] text-sm">
                      First Name <span className="text-[#f85149]">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      placeholder="David"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="bg-[#0a0a0f] border-[#2d2d3a] text-[#e6edf3] placeholder:text-[#7d8590] focus:border-[#00d4aa] h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-[#e6edf3] text-sm">
                      Last Name <span className="text-[#f85149]">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      placeholder="Victoria"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="bg-[#0a0a0f] border-[#2d2d3a] text-[#e6edf3] placeholder:text-[#7d8590] focus:border-[#00d4aa] h-11"
                    />
                  </div>
                </div>

                {/* Auto-generated email preview (read-only) */}
                {firstName && lastName && (
                  <div className="space-y-2">
                    <Label className="text-[#e6edf3] text-sm">
                      Your Email Address
                    </Label>
                    <div className="p-4 rounded-lg bg-[#0a0a0f] border border-[#2d2d3a]">
                      <div className="flex items-center justify-between">
                        <p className="font-mono text-[#e6edf3]">{fullEmail}</p>
                        {isLoading && (
                          <Loader2 className="w-4 h-4 animate-spin text-[#7d8590]" />
                        )}
                        {!isLoading && usernameAvailable === true && (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-[#34d39915] text-[#34d399]">
                            <Check className="w-3 h-3" />
                            Available
                          </span>
                        )}
                        {!isLoading && usernameAvailable === false && (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-[#f8514915] text-[#f85149]">
                            <AlertCircle className="w-3 h-3" />
                            Taken
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[#7d8590] mt-2">
                        <span className="text-[#7d8590]">Display: </span>
                        <span style={{ color: selectedTypeInfo?.color }}>
                          {firstName} {lastName} ({selectedType === "hero" ? "AWS Hero" : "Community Builder"})
                        </span>
                      </p>
                    </div>
                    <p className="text-xs text-[#7d8590]">
                      Email is automatically generated from your name
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-[#e6edf3] text-sm">
                    Phone Number
                  </Label>
                  <IMaskInput
                    mask="+0[0] (000) 000 0000"
                    value={phone}
                    unmask={false}
                    onAccept={(value: string) => setPhone(value)}
                    placeholder="+52 (111) 222 3333"
                    className="flex h-11 w-full rounded-md border border-[#2d2d3a] bg-[#0a0a0f] px-3 py-2 text-sm text-[#e6edf3] placeholder:text-[#7d8590] focus:border-[#00d4aa] focus:outline-none focus:ring-1 focus:ring-[#00d4aa]/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alternativeEmail" className="text-[#e6edf3] text-sm">
                    Alternative Email <span className="text-[#f85149]">*</span>
                  </Label>
                  <Input
                    id="alternativeEmail"
                    type="email"
                    placeholder="your.email@gmail.com"
                    value={alternativeEmail}
                    onChange={(e) => setAlternativeEmail(e.target.value)}
                    className="bg-[#0a0a0f] border-[#2d2d3a] text-[#e6edf3] placeholder:text-[#7d8590] focus:border-[#00d4aa] h-11"
                  />
                  <p className="text-xs text-[#7d8590]">
                    Your temporary password will be sent here
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* CC/UG: Manual username entry flow */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-[#e6edf3] text-sm">
                    Email Username
                  </Label>
                  <div className="flex items-center">
                    <span className="text-[#7d8590] font-mono text-sm px-3 py-2.5 bg-[#1a1a24] border border-r-0 border-[#2d2d3a] rounded-l-md">
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
                      className="bg-[#0a0a0f] border-[#2d2d3a] text-[#e6edf3] placeholder:text-[#7d8590] focus:border-[#00d4aa] rounded-l-none border-r-0 h-11"
                    />
                    <span className="text-[#7d8590] font-mono text-sm px-3 py-2.5 bg-[#1a1a24] border border-l-0 border-[#2d2d3a] rounded-r-md">
                      @{EMAIL_DOMAIN}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-[#7d8590]">Only lowercase letters and numbers</p>
                    {username && usernameAvailable === true && (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-[#34d39915] text-[#34d399]">
                        <Check className="w-3 h-3" />
                        Available
                      </span>
                    )}
                    {username && usernameAvailable === false && (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-[#f8514915] text-[#f85149]">
                        <AlertCircle className="w-3 h-3" />
                        Taken
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-[#e6edf3] text-sm">
                    {selectedTypeInfo?.nameLabel} <span className="text-[#f85149]">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    placeholder={selectedTypeInfo?.namePlaceholder}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="bg-[#0a0a0f] border-[#2d2d3a] text-[#e6edf3] placeholder:text-[#7d8590] focus:border-[#00d4aa] h-11"
                  />
                  <p className="text-xs text-[#7d8590]">{selectedTypeInfo?.nameHelp}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactName" className="text-[#e6edf3] text-sm">
                    Contact Person <span className="text-[#f85149]">*</span>
                  </Label>
                  <Input
                    id="contactName"
                    placeholder="Juan Perez"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="bg-[#0a0a0f] border-[#2d2d3a] text-[#e6edf3] placeholder:text-[#7d8590] focus:border-[#00d4aa] h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-[#e6edf3] text-sm">
                    Phone Number
                  </Label>
                  <IMaskInput
                    mask="+0[0] (000) 000 0000"
                    value={phone}
                    unmask={false}
                    onAccept={(value: string) => setPhone(value)}
                    placeholder="+52 (111) 222 3333"
                    className="flex h-11 w-full rounded-md border border-[#2d2d3a] bg-[#0a0a0f] px-3 py-2 text-sm text-[#e6edf3] placeholder:text-[#7d8590] focus:border-[#00d4aa] focus:outline-none focus:ring-1 focus:ring-[#00d4aa]/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alternativeEmail" className="text-[#e6edf3] text-sm">
                    Alternative Email <span className="text-[#f85149]">*</span>
                  </Label>
                  <Input
                    id="alternativeEmail"
                    type="email"
                    placeholder="your.email@gmail.com"
                    value={alternativeEmail}
                    onChange={(e) => setAlternativeEmail(e.target.value)}
                    className="bg-[#0a0a0f] border-[#2d2d3a] text-[#e6edf3] placeholder:text-[#7d8590] focus:border-[#00d4aa] h-11"
                  />
                  <p className="text-xs text-[#7d8590]">
                    Your temporary password will be sent here
                  </p>
                </div>

                {/* Preview for CC/UG */}
                {username && (
                  <div className="p-4 rounded-lg bg-[#0a0a0f] border border-[#2d2d3a]">
                    <p className="text-xs text-[#7d8590] mb-2">Email preview</p>
                    <p className="font-mono text-[#e6edf3]">{fullEmail}</p>
                    {firstName && (
                      <p className="text-sm text-[#7d8590] mt-2">
                        <span className="text-[#7d8590]">Display: </span>
                        <span style={{ color: selectedTypeInfo?.color }}>
                          {selectedType === "cc" ? "AWS Cloud Club at" : "AWS User Group"} {firstName} (Mexico)
                        </span>
                      </p>
                    )}
                  </div>
                )}
              </>
            )}

            {error && (
              <div className="flex items-start gap-2.5 text-sm bg-[#f8514915] border border-[#f8514930] text-[#f85149] p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-between">
            <Button
              variant="outline"
              onClick={() => setStep(2)}
              className="border-[#2d2d3a] text-[#e6edf3] hover:bg-[#1a1a24] h-10"
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back
            </Button>
            <Button
              onClick={() => setStep(4)}
              disabled={!canProceedToStep4()}
              className="bg-[#00d4aa] hover:bg-[#00c49a] text-[#0a0a0f] font-medium px-5 h-10 disabled:opacity-50"
            >
              Continue
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Profile & Social */}
      {step === 4 && (
        <div className="bg-[#12121a] border border-[#2d2d3a] rounded-lg p-6 animate-scale-in">
          <div className="mb-6">
            <h2 className="font-heading text-xl text-[#e6edf3] mb-1.5">Profile & Social</h2>
            <p className="text-[#7d8590] text-sm">
              Add your profile information and social links (all optional).
            </p>
          </div>

          <div className="space-y-5">
            {/* Profile Image Upload */}
            <div className="space-y-2">
              <Label className="text-[#e6edf3] text-sm">Profile Photo</Label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  {profileImagePreview ? (
                    <div className="relative">
                      <img
                        src={profileImagePreview}
                        alt="Profile preview"
                        className="w-20 h-20 rounded-full object-cover border-2 border-[#2d2d3a]"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-20 h-20 rounded-full bg-[#0a0a0f] border-2 border-dashed border-[#2d2d3a] flex items-center justify-center cursor-pointer hover:border-[#00d4aa] transition-colors">
                      <Camera className="w-6 h-6 text-[#7d8590]" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                </div>
                <div className="text-xs text-[#7d8590]">
                  <p>Upload a profile photo</p>
                  <p>JPG, PNG (max 5MB)</p>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-[#e6edf3] text-sm">Bio</Label>
              <textarea
                id="bio"
                placeholder="Tell us about yourself or your community..."
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 500))}
                rows={3}
                className="w-full rounded-md border border-[#2d2d3a] bg-[#0a0a0f] px-3 py-2 text-sm text-[#e6edf3] placeholder:text-[#7d8590] focus:border-[#00d4aa] focus:outline-none focus:ring-1 focus:ring-[#00d4aa]/20 resize-none"
              />
              <p className="text-xs text-[#7d8590] text-right">{bio.length}/500</p>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-[#e6edf3] text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Location
              </Label>
              <Input
                id="location"
                placeholder="Mexico City, Mexico"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-[#0a0a0f] border-[#2d2d3a] text-[#e6edf3] placeholder:text-[#7d8590] focus:border-[#00d4aa] h-11"
              />
            </div>

            {/* Company & Job Title (CB/Hero only) */}
            {isPersonType && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-[#e6edf3] text-sm flex items-center gap-2">
                    <Building className="w-4 h-4" /> Company
                  </Label>
                  <Input
                    id="company"
                    placeholder="AWS"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="bg-[#0a0a0f] border-[#2d2d3a] text-[#e6edf3] placeholder:text-[#7d8590] focus:border-[#00d4aa] h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobTitle" className="text-[#e6edf3] text-sm flex items-center gap-2">
                    <Briefcase className="w-4 h-4" /> Job Title
                  </Label>
                  <Input
                    id="jobTitle"
                    placeholder="Solutions Architect"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="bg-[#0a0a0f] border-[#2d2d3a] text-[#e6edf3] placeholder:text-[#7d8590] focus:border-[#00d4aa] h-11"
                  />
                </div>
              </div>
            )}

            {/* Social Networks */}
            <div className="space-y-3">
              <Label className="text-[#e6edf3] text-sm">Social Networks</Label>

              <div className="grid gap-3">
                {/* LinkedIn */}
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-[#0077b5]/10 flex items-center justify-center shrink-0">
                    <Linkedin className="w-5 h-5 text-[#0077b5]" />
                  </div>
                  <Input
                    placeholder="linkedin.com/in/username"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    className="bg-[#0a0a0f] border-[#2d2d3a] text-[#e6edf3] placeholder:text-[#7d8590] focus:border-[#00d4aa] h-10"
                  />
                </div>

                {/* Twitter/X */}
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-[#1da1f2]/10 flex items-center justify-center shrink-0">
                    <Twitter className="w-5 h-5 text-[#1da1f2]" />
                  </div>
                  <Input
                    placeholder="x.com/username"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    className="bg-[#0a0a0f] border-[#2d2d3a] text-[#e6edf3] placeholder:text-[#7d8590] focus:border-[#00d4aa] h-10"
                  />
                </div>

                {/* GitHub */}
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-[#333]/50 flex items-center justify-center shrink-0">
                    <Github className="w-5 h-5 text-[#e6edf3]" />
                  </div>
                  <Input
                    placeholder="github.com/username"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    className="bg-[#0a0a0f] border-[#2d2d3a] text-[#e6edf3] placeholder:text-[#7d8590] focus:border-[#00d4aa] h-10"
                  />
                </div>

                {/* Instagram */}
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-[#e4405f]/10 flex items-center justify-center shrink-0">
                    <Instagram className="w-5 h-5 text-[#e4405f]" />
                  </div>
                  <Input
                    placeholder="instagram.com/username"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="bg-[#0a0a0f] border-[#2d2d3a] text-[#e6edf3] placeholder:text-[#7d8590] focus:border-[#00d4aa] h-10"
                  />
                </div>

                {/* Facebook */}
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-[#1877f2]/10 flex items-center justify-center shrink-0">
                    <Facebook className="w-5 h-5 text-[#1877f2]" />
                  </div>
                  <Input
                    placeholder="facebook.com/username"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    className="bg-[#0a0a0f] border-[#2d2d3a] text-[#e6edf3] placeholder:text-[#7d8590] focus:border-[#00d4aa] h-10"
                  />
                </div>

                {/* YouTube */}
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-[#ff0000]/10 flex items-center justify-center shrink-0">
                    <Youtube className="w-5 h-5 text-[#ff0000]" />
                  </div>
                  <Input
                    placeholder="youtube.com/@channel"
                    value={youtube}
                    onChange={(e) => setYoutube(e.target.value)}
                    className="bg-[#0a0a0f] border-[#2d2d3a] text-[#e6edf3] placeholder:text-[#7d8590] focus:border-[#00d4aa] h-10"
                  />
                </div>

                {/* Website */}
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-[#00d4aa]/10 flex items-center justify-center shrink-0">
                    <Globe className="w-5 h-5 text-[#00d4aa]" />
                  </div>
                  <Input
                    placeholder="https://yourwebsite.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="bg-[#0a0a0f] border-[#2d2d3a] text-[#e6edf3] placeholder:text-[#7d8590] focus:border-[#00d4aa] h-10"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 text-sm bg-[#f8514915] border border-[#f8514930] text-[#f85149] p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-between">
            <Button
              variant="outline"
              onClick={() => setStep(3)}
              className="border-[#2d2d3a] text-[#e6edf3] hover:bg-[#1a1a24] h-10"
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back
            </Button>
            <Button
              onClick={createEmail}
              disabled={isLoading}
              className="bg-[#00d4aa] hover:bg-[#00c49a] text-[#0a0a0f] font-medium px-5 h-10 disabled:opacity-50"
            >
              {isLoading && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
              Create Email
              <Check className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 5: Success */}
      {step === 5 && (
        <div className="bg-[#12121a] border border-[#2d2d3a] rounded-lg p-6 animate-scale-in">
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-[#00d4aa] flex items-center justify-center mb-4 glow-md animate-pulse-glow">
              <Mail className="w-8 h-8 text-[#0a0a0f]" />
            </div>
            <h2 className="font-heading text-xl text-[#e6edf3] mb-1.5">Email Created</h2>
            <p className="text-[#7d8590] text-sm">Your new email address is ready to use.</p>
          </div>

          <div className="space-y-4">
            {/* Email address */}
            <div className="p-4 rounded-lg bg-[#0a0a0f] border border-[#2d2d3a] text-center">
              <p className="text-xs text-[#7d8590] mb-2">Your new email</p>
              <p className="font-mono text-lg gradient-text font-medium">{createdEmail}</p>
            </div>

            {/* Temporary password */}
            <div className="p-4 rounded-lg bg-[#fbbf2408] border border-[#fbbf2430]">
              <div className="flex items-center justify-between mb-3">
                <p className="font-medium text-[#fbbf24] text-sm">Temporary Password</p>
                <button
                  onClick={copyPassword}
                  className="flex items-center gap-1.5 text-xs text-[#7d8590] hover:text-[#e6edf3] transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <p className="font-mono bg-[#0a0a0f] p-3 rounded-md border border-[#2d2d3a] text-center text-[#e6edf3] select-all text-sm">
                {tempPassword}
              </p>
              <p className="text-xs text-[#fbbf24]/80 mt-3">
                You will be required to change this on first login.
              </p>
            </div>

            {/* Next steps */}
            <div className="space-y-3">
              <p className="font-medium text-[#e6edf3] text-sm">Next steps</p>
              <ol className="space-y-2 text-sm text-[#7d8590]">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#1a1a24] flex items-center justify-center text-xs shrink-0">1</span>
                  <span>
                    Go to{" "}
                    <a
                      href="https://mail.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#00d4aa] hover:underline inline-flex items-center gap-1"
                    >
                      mail.google.com
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#1a1a24] flex items-center justify-center text-xs shrink-0">2</span>
                  <span>
                    Sign in with <strong className="text-[#e6edf3]">{createdEmail}</strong>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#1a1a24] flex items-center justify-center text-xs shrink-0">3</span>
                  <span>Use the temporary password above</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#1a1a24] flex items-center justify-center text-xs shrink-0">4</span>
                  <span>Set a new secure password when prompted</span>
                </li>
              </ol>
            </div>

            <div className="pt-4 border-t border-[#2d2d3a] text-center">
              <p className="text-xs text-[#7d8590]">
                A confirmation email has been sent to{" "}
                <strong className="text-[#e6edf3]">{alternativeEmail}</strong>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
