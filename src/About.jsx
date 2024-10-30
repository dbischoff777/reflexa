import React from 'react';
import { Paper } from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Paper 
        elevation={3}
        className="relative w-80 bg-pink-200 rounded-3xl p-6"
        sx={{
          backgroundColor: '#fce7f3',
          borderRadius: '1.5rem',
          position: 'relative',
          width: '20rem',
          padding: '1.5rem'
        }}
      >
        <Link 
          to="/" 
          className="absolute top-4 left-4 text-purple-600 hover:text-purple-800"
        >
          <ArrowLeft />
        </Link>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-purple-800 mb-4">
            About Pop It!
          </h1>
        </div>

        <div className="space-y-4 text-purple-900">
          <p>
            Pop It! is a fun reaction game where players need to click on 
            highlighted buttons as quickly as possible.
          </p>
          
          <div className="space-y-2">
            <h2 className="font-bold">How to Play:</h2>
            <ul className="list-disc list-inside space-y-1 text-left">
              <li>Click the Start Game button to begin</li>
              <li>Wait for the countdown to finish</li>
              <li>Click the highlighted (red) buttons as they appear</li>
              <li>Each correct click earns you a point</li>
              <li>Missing a button or clicking wrong loses a life</li>
              <li>The game speeds up as your score increases</li>
            </ul>
          </div>
          <p className="text-sm text-purple-900 mt-4 text-center">
            © {new Date().getFullYear()} Dennis Bischoff. All rights reserved.
          </p> 
          <p className="text-sm italic">
            Created with with React and lots of ❤️
          </p>       
        </div>
      </Paper>
    </div>
  );
};

export default About;
