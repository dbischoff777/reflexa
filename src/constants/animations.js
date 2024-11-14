/* import successAnimation1 from '../assets/animations/success/successPurple.gif';
import successAnimation2 from '../assets/animations/success/snacksMix.gif';
import successAnimation3 from '../assets/animations/success/successBlue.gif';
import successAnimation4 from '../assets/animations/success/successBrownSilver.gif';
import successAnimation5 from '../assets/animations/success/successMix.gif'; */
import successAnimation1 from '../assets/animations/success/Success_Object 1.gif';
import successAnimation2 from '../assets/animations/success/Success_Object 2.gif';
import successAnimation3 from '../assets/animations/success/Success_Object 3.gif';
import successAnimation4 from '../assets/animations/success/Success_Object 4.gif';
import successAnimation5 from '../assets/animations/success/Success_Object 5.gif';
/* import tryAnimation1 from '../assets/animations/try/Try.gif';
import tryAnimation2 from '../assets/animations/try/tryBrownSilver.gif';
import tryAnimation3 from '../assets/animations/try/tryMix.gif';
import tryAnimation4 from '../assets/animations/try/tryMix2.gif'; */
import tryAnimation1 from '../assets/animations/try/Object_1.gif';
import tryAnimation2 from '../assets/animations/try/Object_2.gif';
import tryAnimation3 from '../assets/animations/try/Object_3.gif';
import tryAnimation4 from '../assets/animations/try/Object_4.gif';
import tryAnimation5 from '../assets/animations/try/Object_5.gif';

// Animation durations in milliseconds
export const ANIMATION_DURATIONS = {
  LONG: 3000,   // 3 seconds
  MEDIUM: 2000, // 2 seconds
  SHORT: 1000   // 1 seconds
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
  SMALL: [successAnimation5]
};

// Constants for game logic
export const FAILURES_BEFORE_ANIMATION_CHANGE = 1;