/**
 * GitHub URL validation utility.
 * Validates that a URL matches the expected public GitHub repository format.
 */

const GITHUB_URL_REGEX =
  /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+\/?$/;

export interface ValidationResult {
  valid: boolean;
  owner?: string;
  repo?: string;
  error?: string;
}

/**
 * Validates a GitHub repository URL.
 * Rejects branch URLs, PR links, file paths, and non-GitHub URLs.
 */
export function validateGithubUrl(input: string): ValidationResult {
  const trimmed = input.trim();

  if (!trimmed) {
    return { valid: false };
  }

  // Reject obviously non-GitHub URLs
  if (!trimmed.includes('github.com')) {
    return { valid: false, error: 'Please enter a GitHub repository URL.' };
  }

  // Add https:// if missing
  let url = trimmed;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  // Test against the pattern
  if (!GITHUB_URL_REGEX.test(url)) {
    // Check for common rejected patterns with helpful messages
    if (url.includes('/tree/') || url.includes('/blob/')) {
      return {
        valid: false,
        error: 'Please enter the repository root URL, not a branch or file path.',
      };
    }
    if (url.includes('/pull/') || url.includes('/issues/')) {
      return {
        valid: false,
        error: 'Please enter the repository root URL, not a PR or issue link.',
      };
    }
    return {
      valid: false,
      error: 'URL format: https://github.com/owner/repository',
    };
  }

  // Extract owner and repo from valid URL
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts.length >= 2) {
      return {
        valid: true,
        owner: parts[0],
        repo: parts[1],
      };
    }
  } catch {
    // URL parsing failed
  }

  return { valid: false, error: 'Could not parse the repository URL.' };
}
