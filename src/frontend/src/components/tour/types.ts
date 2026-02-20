export type TourStep = {
  id: string;
  screen: 'dashboard' | 'trades' | 'overview' | 'settings' | 'admin' | 'payment-success' | 'payment-failure' | 'all';
  targetId: string;
  title: string;
  description: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  adminOnly?: boolean;
  navigationHint?: string;
};

export type TourState = {
  isActive: boolean;
  currentStepIndex: number;
  completedSteps: string[];
  dismissedAt: number | null;
};
