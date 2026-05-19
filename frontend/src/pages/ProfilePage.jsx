import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  LoaderIcon,
  MailIcon,
  MapPinIcon,
  SaveIcon,
  ShuffleIcon,
  UserIcon,
} from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";
import { updateProfile } from "../lib/api";
import { LANGUAGES } from "../constants";
import { randomAvatarUrl } from "../lib/avatar";
import ProfileImage from "../components/ProfileImage";
import { getLanguageFlag } from "../components/FriendCard";
import { capitialize } from "../lib/utils";

const ProfilePage = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();

  const [formState, setFormState] = useState({
    fullName: "",
    bio: "",
    nativeLanguage: "",
    location: "",
    profilePic: "",
  });

  useEffect(() => {
    if (!authUser) return;

    setFormState({
      fullName: authUser.fullName || "",
      bio: authUser.bio || "",
      nativeLanguage: authUser.nativeLanguage || "",
      location: authUser.location || "",
      profilePic: authUser.profilePic || "",
    });
  }, [authUser]);

  const { mutate: saveProfile, isPending } = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update profile");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    saveProfile(formState);
  };

  const handleRandomAvatar = () => {
    const randomAvatar = randomAvatarUrl();
    setFormState({ ...formState, profilePic: randomAvatar });
    toast.success("New profile picture generated");
  };

  if (!authUser) {
    return (
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">My Profile</h1>

        <div className="card bg-base-200 shadow-xl">
          <div className="card-body p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <div className="size-32 rounded-full bg-base-300 overflow-hidden ring ring-primary ring-offset-base-200 ring-offset-2">
                  <ProfileImage
                    src={formState.profilePic}
                    seed={authUser._id}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button type="button" onClick={handleRandomAvatar} className="btn btn-accent btn-sm">
                  <ShuffleIcon className="size-4" />
                  New Avatar
                </button>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <label className="input input-bordered flex items-center gap-2 bg-base-300">
                  <MailIcon className="size-4 opacity-70" />
                  <input type="email" value={authUser.email} disabled className="grow" />
                </label>
                <label className="label">
                  <span className="label-text-alt opacity-60">Email cannot be changed</span>
                </label>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Full Name</span>
                </label>
                <label className="input input-bordered flex items-center gap-2">
                  <UserIcon className="size-4 opacity-70" />
                  <input
                    type="text"
                    value={formState.fullName}
                    onChange={(e) => setFormState({ ...formState, fullName: e.target.value })}
                    className="grow"
                    placeholder="Your full name"
                    required
                  />
                </label>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Bio</span>
                </label>
                <textarea
                  value={formState.bio}
                  onChange={(e) => setFormState({ ...formState, bio: e.target.value })}
                  className="textarea textarea-bordered h-24"
                  placeholder="Tell others about yourself"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Native Language</span>
                  </label>
                  <select
                    value={formState.nativeLanguage}
                    onChange={(e) =>
                      setFormState({ ...formState, nativeLanguage: e.target.value })
                    }
                    className="select select-bordered w-full"
                    required
                  >
                    <option value="">Select your native language</option>
                    {LANGUAGES.map((lang) => (
                      <option key={lang} value={lang.toLowerCase()}>
                        {lang}
                      </option>
                    ))}
                  </select>
                  {formState.nativeLanguage && (
                    <label className="label">
                      <span className="label-text-alt flex items-center gap-1">
                        {getLanguageFlag(formState.nativeLanguage)}
                        {capitialize(formState.nativeLanguage)}
                      </span>
                    </label>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Location</span>
                  </label>
                  <div className="relative">
                    <MapPinIcon className="absolute top-1/2 -translate-y-1/2 left-3 size-5 opacity-70" />
                    <input
                      type="text"
                      value={formState.location}
                      onChange={(e) => setFormState({ ...formState, location: e.target.value })}
                      className="input input-bordered w-full pl-10"
                      placeholder="City, Country"
                      required
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-full" disabled={isPending}>
                {isPending ? (
                  <>
                    <LoaderIcon className="animate-spin size-5" />
                    Saving...
                  </>
                ) : (
                  <>
                    <SaveIcon className="size-5" />
                    Save Changes
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
