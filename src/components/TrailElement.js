import pawCursor from '../assets/images/pawCursor.png';

const TrailElement = ({ type = 'paw' }) => {
  switch (type) {
    case 'paw':
      return (
        <img 
          src={pawCursor}
          alt="paw"
          className="w-16 h-16 object-contain"
        />
      );
    
    case 'star':
      return (
        <div className="trail-star">
          ✨
        </div>
      );
    
    case 'glow':
      return (
        <div 
          className="w-4 h-4 rounded-full bg-yellow-300"
          style={{
            filter: 'blur(4px)',
            animation: 'glow 1s ease-out'
          }}
        />
      );
  }
}; 

export default TrailElement;