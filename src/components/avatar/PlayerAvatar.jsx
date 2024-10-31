import React from 'react';
import { AVAILABLE_AVATARS } from '../../constants/avatars';
import './PlayerAvatar.css';

const PlayerAvatar = ({ avatarId, username, showUsername = false }) => {
  const avatar = AVAILABLE_AVATARS.find(a => a.id === avatarId) || AVAILABLE_AVATARS[0];
  
  return (
    <div className="player-info">
      <img 
        src={avatar.image}
        alt={`${username}'s Avatar`}
        className="player-avatar w-8 h-8 rounded-full border-2 border-purple-500"
      />
      {showUsername && (
        <span className="player-name">{username}</span>
      )}
    </div>
  );
};

export default PlayerAvatar;