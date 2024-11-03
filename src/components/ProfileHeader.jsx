const ProfileHeader = ({ username, avatar, level, experience, theme }) => {
    return (
      <div className={`rounded-lg shadow-lg p-6 mb-6 ${
        theme === 'dark' ? 'bg-gray-700' : 'bg-white'
      }`}>
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={getAvatarImage(avatar)}
              alt={`${username}'s avatar`}
              className="w-16 h-16 rounded-full object-cover border-2 border-purple-500"
            />
            <div className="absolute -bottom-1 -right-1 bg-purple-500 rounded-full p-1">
              <Medal size={16} className="text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{username}</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm">Level {level}</span>
                <div className="w-32">
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 bg-purple-600 rounded-full"
                      style={{
                        width: `${((experience % 100) / 100) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };