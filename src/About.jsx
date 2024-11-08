import React from 'react';
import { Paper } from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = ({ settings }) => {
  return (
      <div className={`flex min-h-screen items-center justify-center fixed inset-0 ${
        settings?.theme === 'dark' 
          ? 'bg-gray-800 text-white' 
          : 'bg-gray-50 text-gray-900'  // Changed from bg-gray-100
      }`}>
        <Paper 
          elevation={3}
          className={`relative w-80 rounded-3xl p-6 ${
            settings?.theme === 'dark' 
              ? 'bg-gray-700' 
              : 'bg-gray-100'  // Changed from bg-pink-200
          }`}
          sx={{
            backgroundColor: settings?.theme === 'dark' ? '#374151' : '#f3f4f6',  // Changed from #fce7f3
            borderRadius: '1.5rem',
            position: 'relative',
            width: '20rem',
            padding: '1.5rem'
          }}
        >
          <Link 
            to="/" 
            className={`absolute top-4 left-4 ${
              settings?.theme === 'dark'
                ? 'text-purple-400 hover:text-purple-300'
                : 'text-purple-600 hover:text-purple-500'
            }`}
          >
            <ArrowLeft />
          </Link>
    
          <div className="text-center mb-6">
            <h1 className={`text-2xl font-bold mb-4 ${
              settings?.theme === 'dark'
                ? 'text-purple-300'
                : 'text-purple-600'  // Adjusted purple shade
            }`}>
              About Fetch & Feast
            </h1>
          </div>
    
          <div className={`space-y-4 ${
            settings?.theme === 'dark'
              ? 'text-gray-200'
              : 'text-gray-700'  // Changed from text-purple-900
          }`}>
            <p>
              Fetch & Feast is a fun reaction game where dogs need to fetch the 
              treats.
            </p>
            
            <div className="space-y-2">
              <h2 className="font-bold">How to Play:</h2>
              <ul className="list-disc list-inside space-y-1 text-left">
                <li>Click the Start Game button to begin</li>
                <li>Wait for the countdown to finish</li>
                <li>Click the treats as they appear</li>
                <li>Each correct click earns you a point</li>
                <li>Missing a treat or clicking wrong loses a life</li>
                {/* <li>The game speeds up as your score increases</li> */}
              </ul>
            </div>
            <p className={`text-sm mt-4 text-center ${
            settings?.theme === 'dark'
              ? 'text-gray-300'
              : 'text-gray-600'  // Changed from text-purple-900
          }`}>
            © {new Date().getFullYear()} Dennis Bischoff. All rights reserved.
          </p> 
          <p className={`text-sm italic text-center ${
            settings?.theme === 'dark'
              ? 'text-gray-300'
              : 'text-gray-600'  // Changed from text-purple-900
          }`}>
            Created with React and lots of ❤️
          </p>       
        </div>
      </Paper>
    </div>
  );
};

export default About;