import ninja from '../images/avatars/ninja.png';

export const AVAILABLE_AVATARS = [
  {
    id: 'default',
    name: 'default',
    image: ninja
  },
  {
    id: 'ninja',
    name: 'Ninja',
    image: ninja
  },
  {
    id: 'samurai',
    name: 'Samurai',
    image: ninja
  },
  // Add other avatars similarly
];

// Helper function to get avatar image by id
export const getAvatarImage = (avatarId) => {
  const avatar = AVAILABLE_AVATARS.find(a => a.id === avatarId);
  return avatar ? avatar.image : AVAILABLE_AVATARS[0].image; // Default to first avatar if not found
};