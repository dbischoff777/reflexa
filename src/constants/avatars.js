import defaultAvatar from '../images/avatars/default.png';
import girl from '../images/avatars/girl.png';
import boy from '../images/avatars/boy.png';
import dog from '../images/avatars/dog.png';
import ninja from '../images/avatars/ninja.png';

export const AVAILABLE_AVATARS = [
  {
    id: 'default',
    name: 'default',
    image: defaultAvatar
  },
  {
    id: 'girl',
    name: 'Girl',
    image: girl
  },
  {
    id: 'boy',
    name: 'Boy',
    image: boy
  },
  {
    id: 'dog',
    name: 'Dog',
    image: dog
  },
  {
    id: 'ninja',
    name: 'Ninja',
    image: ninja
  },
];

// Helper function to get avatar image by id
export const getAvatarImage = (avatarId) => {
  const avatar = AVAILABLE_AVATARS.find(a => a.id === avatarId);
  return avatar ? avatar.image : AVAILABLE_AVATARS[0].image; // Default to first avatar if not found
};