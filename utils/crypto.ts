/**
 * A simple, non-secure hash function to simulate a tamper-proof log.
 * In a real application, a proper cryptographic hash like SHA-256 would be used.
 * @param data - The string data to hash.
 * @returns A simulated hash string.
 */
export const generateHash = (data: string): string => {
  let hash = 0;
  if (data.length === 0) return "0x00000000";
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `0x${Math.abs(hash).toString(16).padStart(8, '0')}`;
};

/**
 * Simulates generating a hash from a file's content.
 * In a real app, this would use the Web Crypto API (e.g., SHA-256).
 * @param file - The file to hash.
 * @returns A promise that resolves to the simulated hash string.
 */
export const generateFileHash = (file: File): Promise<string> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const dataToHash = `${file.name}-${file.size}-${file.lastModified}`;
            resolve(generateHash(dataToHash));
        }, 500); // Simulate async operation
    });
};
