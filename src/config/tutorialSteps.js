// Import the video
import tutorialVideo2 from '../assets/animations/tutorial/tutorialStep2.mp4';
import tutorialVideo3 from '../assets/animations/tutorial/tutorialStep3.mp4';

export const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Fetch & Feast! 🐾',
    content: "Let's learn how to play together! Click 'Next' to continue.",
    highlight: null,
    action: 'next',
  },
{
    id: 'treats-explanation',
    title: 'Collecting Treats', 
    content: 'Click or tap on the treats that appear on the screen to collect them.',
    highlight: 'grid',
    action: 'try',
    animation: tutorialVideo2,
},
  {
    id: 'lives',
    title: 'Watch Your Lives',
    content: 'You start with 5 lives. Missing a treat or clicking an empty space will cost you a life!',
    highlight: 'lives-counter',
    action: 'fail',
    animation: tutorialVideo3,
  },
  {
    id: 'score',
    title: 'Score Points',
    content: 'Your score increases with each treat collected. Build combos for bonus points!',
    highlight: 'score-display',
    action: 'next',
  },
  {
    id: 'multiplier',
    title: 'Multiplier Bonus',
    content: 'Collect treats quickly to increase your multiplier. Higher multipliers mean more points!',
    highlight: 'multiplier-display',
    action: 'next',
  },
  {
    id: 'complete',
    title: "You're Ready! 🎉",
    content: "Now you know the basics! Click 'Start Playing' to begin your adventure!",
    highlight: null,
    action: 'complete',
  },
]; 