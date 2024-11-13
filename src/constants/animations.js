import successAnimation1 from '../assets/animations/success/successPurple.gif';
import successAnimation2 from '../assets/animations/success/snacksMix.gif';
import successAnimation3 from '../assets/animations/success/successBlue.gif';
import successAnimation4 from '../assets/animations/success/successBrownSilver.gif';
import successAnimation5 from '../assets/animations/success/successMix.gif';
import tryAnimation1 from '../assets/animations/try/Try.gif';
import tryAnimation2 from '../assets/animations/try/tryBrownSilver.gif';
import tryAnimation3 from '../assets/animations/try/tryMix.gif';
import tryAnimation4 from '../assets/animations/try/tryMix2.gif';

// Animation durations in milliseconds
export const ANIMATION_DURATIONS = {
  LONG: 3000,   // 3 seconds
  MEDIUM: 2000, // 2 seconds
  SHORT: 1000   // 1 seconds
};

// Group animations by size
export const TRY_ANIMATIONS_BY_SIZE = {
  LARGE: [tryAnimation1, tryAnimation2],
  MEDIUM: [tryAnimation3],
  SMALL: [tryAnimation4]
};

// Success animations by size
export const SUCCESS_ANIMATIONS_BY_SIZE = {
  LARGE: [successAnimation1, successAnimation2],
  MEDIUM: [successAnimation3, successAnimation4],
  SMALL: [successAnimation5]
};

// Constants for game logic
export const FAILURES_BEFORE_ANIMATION_CHANGE = 1;