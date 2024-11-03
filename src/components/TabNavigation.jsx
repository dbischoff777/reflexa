const TabNavigation = ({ activeTab, onTabChange, theme }) => {
    const tabs = [
      { id: 'stats', label: 'Statistics', icon: <Chart /> },
      { id: 'achievements', label: 'Achievements', icon: <Trophy /> },
      { id: 'history', label: 'Game History', icon: <History /> }
    ];
  
    return (
      <div className="flex space-x-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg transition-all
              ${activeTab === tab.id
                ? theme === 'dark'
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-100 text-purple-700'
                : theme === 'dark'
                ? 'text-gray-400 hover:bg-gray-700'
                : 'text-gray-600 hover:bg-gray-100'
              }
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
    );
  };