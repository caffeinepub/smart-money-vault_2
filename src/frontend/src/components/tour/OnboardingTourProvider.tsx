import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TourStep, TourState } from './types';
import { useIsCallerAdmin } from '../../hooks/useAdmin';

type TourContextType = {
  startTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  completeTour: () => void;
  tourState: TourState;
  currentStep: TourStep | null;
  registerSteps: (steps: TourStep[]) => void;
  currentScreen: string;
};

const TourContext = createContext<TourContextType | null>(null);

export function useOnboardingTour() {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useOnboardingTour must be used within OnboardingTourProvider');
  }
  return context;
}

interface OnboardingTourProviderProps {
  children: ReactNode;
  currentScreen: string;
}

const TOUR_STORAGE_KEY = 'smart-money-vault-tour-state';

export function OnboardingTourProvider({ children, currentScreen }: OnboardingTourProviderProps) {
  const { data: isAdmin } = useIsCallerAdmin();
  const [allSteps, setAllSteps] = useState<TourStep[]>([]);
  const [tourState, setTourState] = useState<TourState>(() => {
    const stored = localStorage.getItem(TOUR_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return { isActive: false, currentStepIndex: 0, completedSteps: [], dismissedAt: null };
      }
    }
    return { isActive: false, currentStepIndex: 0, completedSteps: [], dismissedAt: null };
  });

  useEffect(() => {
    localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify(tourState));
  }, [tourState]);

  const registerSteps = useCallback((steps: TourStep[]) => {
    setAllSteps((prev) => {
      const newSteps = steps.filter((s) => !prev.some((p) => p.id === s.id));
      return [...prev, ...newSteps];
    });
  }, []);

  const getFilteredSteps = useCallback(() => {
    return allSteps.filter((step) => {
      if (step.adminOnly && !isAdmin) return false;
      if (step.screen === 'all') return true;
      return step.screen === currentScreen;
    });
  }, [allSteps, currentScreen, isAdmin]);

  const startTour = useCallback(() => {
    setTourState({
      isActive: true,
      currentStepIndex: 0,
      completedSteps: [],
      dismissedAt: null,
    });
  }, []);

  const nextStep = useCallback(() => {
    const filtered = getFilteredSteps();
    setTourState((prev) => {
      const nextIndex = prev.currentStepIndex + 1;
      if (nextIndex >= filtered.length) {
        return {
          ...prev,
          isActive: false,
          completedSteps: [...prev.completedSteps, filtered[prev.currentStepIndex]?.id].filter(Boolean),
        };
      }
      return {
        ...prev,
        currentStepIndex: nextIndex,
        completedSteps: [...prev.completedSteps, filtered[prev.currentStepIndex]?.id].filter(Boolean),
      };
    });
  }, [getFilteredSteps]);

  const prevStep = useCallback(() => {
    setTourState((prev) => ({
      ...prev,
      currentStepIndex: Math.max(0, prev.currentStepIndex - 1),
    }));
  }, []);

  const skipTour = useCallback(() => {
    setTourState((prev) => ({
      ...prev,
      isActive: false,
      dismissedAt: Date.now(),
    }));
  }, []);

  const completeTour = useCallback(() => {
    const filtered = getFilteredSteps();
    setTourState((prev) => ({
      ...prev,
      isActive: false,
      completedSteps: [...prev.completedSteps, ...filtered.map((s) => s.id)],
    }));
  }, [getFilteredSteps]);

  const filteredSteps = getFilteredSteps();
  const currentStep = tourState.isActive && filteredSteps[tourState.currentStepIndex] ? filteredSteps[tourState.currentStepIndex] : null;

  useEffect(() => {
    if (tourState.isActive && currentStep) {
      const targetElement = document.getElementById(currentStep.targetId);
      if (!targetElement) {
        nextStep();
      }
    }
  }, [currentStep, tourState.isActive, nextStep]);

  return (
    <TourContext.Provider
      value={{
        startTour,
        nextStep,
        prevStep,
        skipTour,
        completeTour,
        tourState,
        currentStep,
        registerSteps,
        currentScreen,
      }}
    >
      {children}
      {tourState.isActive && currentStep && <TourOverlay step={currentStep} />}
    </TourContext.Provider>
  );
}

function TourOverlay({ step }: { step: TourStep }) {
  const { nextStep, prevStep, skipTour, tourState } = useOnboardingTour();
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const targetElement = document.getElementById(step.targetId);
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      const placement = step.placement || 'bottom';
      
      let top = 0;
      let left = 0;

      switch (placement) {
        case 'bottom':
          top = rect.bottom + window.scrollY + 12;
          left = rect.left + window.scrollX + rect.width / 2;
          break;
        case 'top':
          top = rect.top + window.scrollY - 12;
          left = rect.left + window.scrollX + rect.width / 2;
          break;
        case 'left':
          top = rect.top + window.scrollY + rect.height / 2;
          left = rect.left + window.scrollX - 12;
          break;
        case 'right':
          top = rect.top + window.scrollY + rect.height / 2;
          left = rect.right + window.scrollX + 12;
          break;
      }

      setPosition({ top, left });
      setVisible(true);

      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      setVisible(false);
    }
  }, [step]);

  if (!visible) return null;

  return (
    <>
      <div className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm" onClick={skipTour} />
      <div
        className="fixed z-[9999] w-[90vw] max-w-sm rounded-xl border border-white/10 bg-[#121212] p-6 shadow-2xl sm:w-auto"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          transform: 'translate(-50%, 0)',
        }}
      >
        <button
          onClick={skipTour}
          className="absolute right-3 top-3 rounded-lg p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-4">
          <h3 className="mb-2 text-lg font-semibold text-white">{step.title}</h3>
          <p className="text-sm leading-relaxed text-white/70">{step.description}</p>
          {step.navigationHint && (
            <p className="mt-2 text-xs italic text-white/50">{step.navigationHint}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-white/40">
            Step {tourState.currentStepIndex + 1}
          </span>
          <div className="flex space-x-2">
            {tourState.currentStepIndex > 0 && (
              <Button
                onClick={prevStep}
                variant="outline"
                size="sm"
                className="border-white/10 bg-white/5 text-white hover:bg-white/10"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            <Button
              onClick={nextStep}
              size="sm"
              className="bg-profit text-black hover:bg-profit/90"
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
