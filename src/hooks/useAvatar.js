import { useState } from 'react';

export const useAvatar = (initialAvatar = 'default') => {
  const [playerAvatar, setPlayerAvatar] = useState(
    localStorage.getItem('playerAvatar') || initialAvatar
  );

  const handleAvatarSelect = (avatarId) => {
    setPlayerAvatar(avatarId);
    localStorage.setItem('playerAvatar', avatarId);
  };

  return {
    playerAvatar,
    setPlayerAvatar: handleAvatarSelect
  };
};