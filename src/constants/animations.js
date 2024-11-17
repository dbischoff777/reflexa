//success animations
import successAnimation1 from '../assets/animations/success/Success_Object 1.gif';
import successAnimation2 from '../assets/animations/success/Success_Object 3.gif';
import successAnimation3 from '../assets/animations/success/Success_Object 4.gif';
import successAnimation4 from '../assets/animations/success/Success_Object 5.gif';

//try animations
import tryAnimation1 from '../assets/animations/try/Object_1.gif';
import tryAnimation2 from '../assets/animations/try/Object_2.gif';
import tryAnimation3 from '../assets/animations/try/Object_3.gif';
import tryAnimation4 from '../assets/animations/try/Object_4.gif';
import tryAnimation5 from '../assets/animations/try/Object_5.gif';

//fail animation
import failAnimation1 from '../assets/animations/fail/fail1.gif';

//fireworks
import fireworks1 from '../assets/animations/fireworks/fireworks animated_1.gif';
import fireworks2 from '../assets/animations/fireworks/fireworks animated_2.gif';
import fireworks3 from '../assets/animations/fireworks/fireworks animated_3.gif';
import fireworks4 from '../assets/animations/fireworks/fireworks animated_4.gif';
import fireworks5 from '../assets/animations/fireworks/fireworks animated_5.gif';
import fireworks6 from '../assets/animations/fireworks/fireworks animated_6.gif';


// Animation durations in milliseconds
export const ANIMATION_DURATIONS = {
  LONG: 3000,    // 3 seconds
  MEDIUM: 2000,  // 2 seconds
  SHORT: 1000,   // 1 second
  CLICK_WINDOW: 10000, // 10 seconds for clicking window
  FADE_OUT: 1000  // 1000ms for fade out animation
};

// Group animations by size
export const TRY_ANIMATIONS_BY_SIZE = {
  LARGE: [tryAnimation1, tryAnimation2],
  MEDIUM: [tryAnimation3, tryAnimation4],
  SMALL: [tryAnimation5]
};

// Success animations by size
export const SUCCESS_ANIMATIONS_BY_SIZE = {
  LARGE: [successAnimation1, successAnimation2],
  MEDIUM: [successAnimation3, successAnimation4],
  SMALL: [successAnimation4]
};

// Animation sequence constants
export const ANIMATION_SEQUENCE = {
  CURRENT_TO_NEXT: {
    FADE_OUT_CURRENT: true,    // Whether to fade out current animation
    SHOW_FAILURE_OVERLAY: true, // Show failure overlay
    CONTINUE_FROM_SAME_POSITION: true // Next object starts from previous position
  }
};

// Failure overlay animation
export const FAILURE_OVERLAY = {
  IMAGE: failAnimation1, // Using existing fail animation
  DURATION: ANIMATION_DURATIONS.MEDIUM
};

// firework animations by size
export const FIREWORKS_BY_SIZE = {
  LARGE: [fireworks1, fireworks2, fireworks3, fireworks4, fireworks5, fireworks6], 
  MEDIUM: [fireworks3, fireworks4],
  SMALL: [fireworks5]
};

// Constants for game logic
export const FAILURES_BEFORE_ANIMATION_CHANGE = 1;