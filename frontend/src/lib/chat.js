export function getDirectChannelId(userIdA, userIdB) {
  return [userIdA, userIdB].sort().join("-");
}

export function getOtherUserIdFromChannel(channelId, currentUserId) {
  const [first, second] = channelId.split("-");
  if (first === currentUserId) return second;
  if (second === currentUserId) return first;
  return channelId.replace(`${currentUserId}-`, "").replace(`-${currentUserId}`, "");
}
