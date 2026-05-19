import { getAvatarUrl, handleAvatarError } from "../lib/avatar";

const ProfileImage = ({ src, seed, alt = "", className, ...props }) => {
  const avatarSrc = getAvatarUrl(src, seed);

  return (
    <img
      src={avatarSrc}
      alt={alt}
      className={className}
      onError={(e) => handleAvatarError(e, seed)}
      {...props}
    />
  );
};

export default ProfileImage;
