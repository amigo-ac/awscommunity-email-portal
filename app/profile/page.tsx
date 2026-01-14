"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Camera,
  MapPin,
  Building,
  Briefcase,
  Linkedin,
  Twitter,
  Github,
  Instagram,
  Facebook,
  Youtube,
  Globe,
  X,
  Check,
  AlertCircle,
  Mail,
  Calendar,
} from "lucide-react";

interface Profile {
  id: number;
  email: string;
  type: string;
  username: string;
  firstName: string;
  lastName: string | null;
  phone: string | null;
  alternativeEmail: string;
  googleDisplayName: string | null;
  createdAt: string;
  bio: string | null;
  location: string | null;
  company: string | null;
  jobTitle: string | null;
  profileImage: string | null;
  linkedin: string | null;
  twitter: string | null;
  github: string | null;
  instagram: string | null;
  facebook: string | null;
  youtube: string | null;
  website: string | null;
}

const typeColors: Record<string, { bg: string; text: string; label: string }> = {
  cc: { bg: "bg-purple-500/20", text: "text-purple-400", label: "Cloud Club" },
  ug: { bg: "bg-amber-500/20", text: "text-amber-400", label: "User Group" },
  cb: { bg: "bg-green-500/20", text: "text-green-400", label: "Community Builder" },
  hero: { bg: "bg-pink-500/20", text: "text-pink-400", label: "AWS Hero" },
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form state
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

  const isPersonType = profile?.type === "cb" || profile?.type === "hero";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        const data = await res.json();
        if (data.profile) {
          setProfile(data.profile);
          setBio(data.profile.bio || "");
          setLocation(data.profile.location || "");
          setCompany(data.profile.company || "");
          setJobTitle(data.profile.jobTitle || "");
          setLinkedin(data.profile.linkedin || "");
          setTwitter(data.profile.twitter || "");
          setGithub(data.profile.github || "");
          setInstagram(data.profile.instagram || "");
          setFacebook(data.profile.facebook || "");
          setYoutube(data.profile.youtube || "");
          setWebsite(data.profile.website || "");
          setProfileImagePreview(data.profile.profileImage);
        }
      } catch (err) {
        setError("Failed to load profile");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const size = 256;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
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

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio,
          location,
          company: isPersonType ? company : undefined,
          jobTitle: isPersonType ? jobTitle : undefined,
          profileImage,
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
        setProfile(data.profile);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.error || "Failed to save profile");
      }
    } catch {
      setError("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#00d4aa]" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-[#f85149] mx-auto mb-4" />
          <h2 className="text-xl text-[#e6edf3] mb-2">Profile Not Found</h2>
          <p className="text-[#7d8590]">
            You don&apos;t have an AWS Community email account yet.
          </p>
        </div>
      </div>
    );
  }

  const colors = typeColors[profile.type] || typeColors.cc;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="font-heading text-2xl text-[#e6edf3]">Edit Profile</h1>
          <p className="text-[#7d8590]">Update your profile information</p>
        </div>

        {/* Account Info (Read-only) */}
        <div className="bg-[#12121a] border border-[#2d2d3a] rounded-lg p-6 mb-6">
          <h2 className="font-heading text-lg text-[#e6edf3] mb-4">Account Information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-[#7d8590]" />
              <div>
                <p className="text-xs text-[#7d8590]">Email</p>
                <p className="font-mono text-[#e6edf3]">{profile.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-2 py-1 rounded text-xs font-medium ${colors.bg} ${colors.text}`}>
                {colors.label}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-[#7d8590]" />
              <div>
                <p className="text-xs text-[#7d8590]">Created</p>
                <p className="text-[#e6edf3]">
                  {new Date(profile.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Editable Profile */}
        <div className="bg-[#12121a] border border-[#2d2d3a] rounded-lg p-6 space-y-6">
          {/* Profile Image */}
          <div className="flex items-center gap-6">
            <div className="relative">
              {profileImagePreview ? (
                <div className="relative">
                  <img
                    src={profileImagePreview}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-2 border-[#2d2d3a]"
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
                <label className="w-24 h-24 rounded-full bg-[#0a0a0f] border-2 border-dashed border-[#2d2d3a] flex items-center justify-center cursor-pointer hover:border-[#00d4aa] transition-colors">
                  <Camera className="w-8 h-8 text-[#7d8590]" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>
            <div>
              <p className="text-[#e6edf3] font-medium">{profile.googleDisplayName || profile.firstName}</p>
              <p className="text-sm text-[#7d8590]">Click to upload a new photo</p>
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio" className="text-[#e6edf3]">Bio</Label>
            <textarea
              id="bio"
              placeholder="Tell us about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 500))}
              rows={3}
              className="w-full rounded-md border border-[#2d2d3a] bg-[#0a0a0f] px-3 py-2 text-sm text-[#e6edf3] placeholder:text-[#7d8590] focus:border-[#00d4aa] focus:outline-none focus:ring-1 focus:ring-[#00d4aa]/20 resize-none"
            />
            <p className="text-xs text-[#7d8590] text-right">{bio.length}/500</p>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="text-[#e6edf3] flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Location
            </Label>
            <Input
              id="location"
              placeholder="Mexico City, Mexico"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-[#0a0a0f] border-[#2d2d3a] text-[#e6edf3] placeholder:text-[#7d8590] focus:border-[#00d4aa]"
            />
          </div>

          {/* Company & Job Title (CB/Hero only) */}
          {isPersonType && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company" className="text-[#e6edf3] flex items-center gap-2">
                  <Building className="w-4 h-4" /> Company
                </Label>
                <Input
                  id="company"
                  placeholder="AWS"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="bg-[#0a0a0f] border-[#2d2d3a] text-[#e6edf3] placeholder:text-[#7d8590] focus:border-[#00d4aa]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobTitle" className="text-[#e6edf3] flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> Job Title
                </Label>
                <Input
                  id="jobTitle"
                  placeholder="Solutions Architect"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="bg-[#0a0a0f] border-[#2d2d3a] text-[#e6edf3] placeholder:text-[#7d8590] focus:border-[#00d4aa]"
                />
              </div>
            </div>
          )}

          {/* Social Networks */}
          <div className="space-y-3">
            <Label className="text-[#e6edf3]">Social Networks</Label>

            <div className="grid gap-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-[#0077b5]/10 flex items-center justify-center shrink-0">
                  <Linkedin className="w-5 h-5 text-[#0077b5]" />
                </div>
                <Input
                  placeholder="linkedin.com/in/username"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  className="bg-[#0a0a0f] border-[#2d2d3a] text-[#e6edf3] placeholder:text-[#7d8590] focus:border-[#00d4aa]"
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-[#1da1f2]/10 flex items-center justify-center shrink-0">
                  <Twitter className="w-5 h-5 text-[#1da1f2]" />
                </div>
                <Input
                  placeholder="x.com/username"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  className="bg-[#0a0a0f] border-[#2d2d3a] text-[#e6edf3] placeholder:text-[#7d8590] focus:border-[#00d4aa]"
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-[#333]/50 flex items-center justify-center shrink-0">
                  <Github className="w-5 h-5 text-[#e6edf3]" />
                </div>
                <Input
                  placeholder="github.com/username"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  className="bg-[#0a0a0f] border-[#2d2d3a] text-[#e6edf3] placeholder:text-[#7d8590] focus:border-[#00d4aa]"
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-[#e4405f]/10 flex items-center justify-center shrink-0">
                  <Instagram className="w-5 h-5 text-[#e4405f]" />
                </div>
                <Input
                  placeholder="instagram.com/username"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  className="bg-[#0a0a0f] border-[#2d2d3a] text-[#e6edf3] placeholder:text-[#7d8590] focus:border-[#00d4aa]"
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-[#1877f2]/10 flex items-center justify-center shrink-0">
                  <Facebook className="w-5 h-5 text-[#1877f2]" />
                </div>
                <Input
                  placeholder="facebook.com/username"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  className="bg-[#0a0a0f] border-[#2d2d3a] text-[#e6edf3] placeholder:text-[#7d8590] focus:border-[#00d4aa]"
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-[#ff0000]/10 flex items-center justify-center shrink-0">
                  <Youtube className="w-5 h-5 text-[#ff0000]" />
                </div>
                <Input
                  placeholder="youtube.com/@channel"
                  value={youtube}
                  onChange={(e) => setYoutube(e.target.value)}
                  className="bg-[#0a0a0f] border-[#2d2d3a] text-[#e6edf3] placeholder:text-[#7d8590] focus:border-[#00d4aa]"
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-[#00d4aa]/10 flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5 text-[#00d4aa]" />
                </div>
                <Input
                  placeholder="https://yourwebsite.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="bg-[#0a0a0f] border-[#2d2d3a] text-[#e6edf3] placeholder:text-[#7d8590] focus:border-[#00d4aa]"
                />
              </div>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="flex items-start gap-2.5 text-sm bg-[#f8514915] border border-[#f8514930] text-[#f85149] p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-2.5 text-sm bg-[#34d39915] border border-[#34d39930] text-[#34d399] p-3 rounded-lg">
              <Check className="w-4 h-4 mt-0.5 shrink-0" />
              <span>Profile saved successfully!</span>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#00d4aa] hover:bg-[#00c49a] text-[#0a0a0f] font-medium px-6"
            >
              {saving && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
