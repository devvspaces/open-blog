
/**
 * Extracts the username from a GitHub URL
 * @param url 
 */
export function extractGithubUsername(url: string): string {
  const match = url.match(/github.com\/([^\/]+)/);
  return match ? match[1] : "";
}

/**
 * Converts a nano timestamp to milliseconds
 * @param nano 
 */
export function nano2mill(nano: string): number {
  return parseInt(nano) / 1000000;
}