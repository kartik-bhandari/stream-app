const BROKEN_AVATAR_HOSTS = ["avatar.iran.liara.run", "avatar-placeholder.iran.liara.run"];

export function isBrokenAvatarUrl(url) {
  if (!url) return true;
  try {
    const { hostname } = new URL(url);
    return BROKEN_AVATAR_HOSTS.some((host) => hostname.includes(host));
  } catch {
    return true;
  }
}

export function getAvatarUrl(profilePic, seed = "default") {
  if (!isBrokenAvatarUrl(profilePic)) return profilePic;
  return `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(String(seed))}`;
}

export function randomAvatarUrl() {
  return getAvatarUrl(null, `${Date.now()}-${Math.random()}`);
}
