export function getEnv(key: string): string {
  const value = process.env[key];

  if (!value) {
    console.error(`Environment variable "${key}" is not set.`);
    throw new Error(`Environment variable "${key}" is not set.`);
  }

  return value;
}
