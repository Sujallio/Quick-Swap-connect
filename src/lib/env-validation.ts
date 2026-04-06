/**
 * Validates that all required environment variables are present
 * Throws an error if any are missing
 */
export function validateEnv(): void {
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_PUBLISHABLE_KEY',
  ];

  const missing: string[] = [];

  requiredVars.forEach((varName) => {
    if (!import.meta.env[varName]) {
      missing.push(varName);
    }
  });

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
      `Please check your .env file and ensure all variables are set.`
    );
  }
}

/**
 * Gets environment variable with optional default
 */
export function getEnv(key: string, defaultValue?: string): string {
  const value = import.meta.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value || defaultValue || '';
}
