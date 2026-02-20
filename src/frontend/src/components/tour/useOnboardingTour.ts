import { useContext } from 'react';
import { useOnboardingTour as useOnboardingTourContext } from './OnboardingTourProvider';

export function useOnboardingTour() {
  return useOnboardingTourContext();
}
