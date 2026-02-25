export function normalizeActorError(error: unknown): string {
  if (!error) return 'An unknown error occurred';
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Detect specific error patterns
  if (errorMessage.includes('Canister is busy') || errorMessage.includes('canister is busy')) {
    return 'Canister is busy. Please try again in a moment.';
  }
  
  if (errorMessage.includes('network') || errorMessage.includes('Network')) {
    return 'Network error. Please check your connection.';
  }
  
  if (errorMessage.includes('Unauthorized')) {
    return 'Unauthorized. Please log in again.';
  }
  
  if (errorMessage.includes('Invalid signature')) {
    return 'Invalid signature. Please regenerate your bot identity.';
  }
  
  if (errorMessage.includes('https://')) {
    return 'Bot URL must start with https://';
  }
  
  if (errorMessage.includes('No bot profile')) {
    return 'No bot profile found. Please set up your bot first.';
  }
  
  if (errorMessage.includes('No bot URL')) {
    return 'No bot URL configured. Please set your bot URL.';
  }
  
  // Return a cleaned version of the error
  return errorMessage.length > 100 
    ? errorMessage.substring(0, 100) + '...' 
    : errorMessage;
}
