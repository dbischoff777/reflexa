import React from 'react';
import { AVAILABLE_AVATARS } from '../../constants/avatars';

const AvatarSelector = ({ currentAvatar, onSelect, settings }) => {
  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className={`text-2xl font-bold ${
        settings?.theme === 'dark' ? 'text-purple-300' : 'text-purple-600'
      }`}>
        Choose Your Avatar
      </h2>
      <div className="flex gap-4 justify-center items-center flex-nowrap">
        {AVAILABLE_AVATARS.map((avatar) => (
          <button
            key={avatar.id}
            onClick={() => onSelect(avatar.id)}
            className={`p-2 rounded-lg transition-all transform hover:scale-110 ${
              currentAvatar === avatar.id 
                ? 'ring-2 ring-purple-500 ring-offset-2' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <img
              src={avatar.image}
              alt={avatar.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default AvatarSelector;
