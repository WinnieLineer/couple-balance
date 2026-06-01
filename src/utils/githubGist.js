/**
 * GitHub Gist API client utility for Couple Balance App.
 * Uses Fetch API to read and write a secret Gist containing JSON data.
 */

const FILE_NAME = 'couple_balance_data.json';

/**
 * Helper to construct GitHub API headers
 */
function getHeaders(token) {
  return {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github+json',
    'Content-Type': 'application/json',
  };
}

/**
 * Creates a new secret Gist on the user's account and returns the created Gist ID.
 * @param {string} token GitHub Personal Access Token with 'gist' scope
 * @param {object} initialData Initial JSON data to store in the Gist
 * @returns {Promise<string>} Created Gist ID
 */
export async function createSecretGist(token, initialData = {}) {
  try {
    const response = await fetch('https://api.github.com/gists', {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({
        description: '🐾 Couple Balance App Cloud Database (Cute Line Dogs) 🐾',
        public: false,
        files: {
          [FILE_NAME]: {
            content: JSON.stringify(initialData, null, 2)
          }
        }
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `Failed to create Gist (${response.status})`);
    }

    const resData = await response.json();
    return resData.id;
  } catch (error) {
    console.error('Error creating Gist:', error);
    throw error;
  }
}

/**
 * Fetches the database content from an existing GitHub Gist.
 * @param {string} token GitHub Personal Access Token
 * @param {string} gistId The ID of the Gist to fetch
 * @returns {Promise<object>} Parsed database contents
 */
export async function fetchGistData(token, gistId) {
  try {
    const timestamp = Date.now();
    const response = await fetch(`https://api.github.com/gists/${gistId}?t=${timestamp}`, {
      method: 'GET',
      headers: {
        ...getHeaders(token),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `Failed to fetch Gist (${response.status})`);
    }

    const resData = await response.json();
    const file = resData.files[FILE_NAME];

    if (!file) {
      throw new Error(`Data file '${FILE_NAME}' not found in Gist. Make sure you use a Gist created by this App or containing this file.`);
    }

    if (file.truncated) {
      // If the file is truncated, fetch it using raw_url
      const rawTimestamp = Date.now();
      const rawUrlObj = new URL(file.raw_url);
      rawUrlObj.searchParams.set('t', rawTimestamp);
      const rawRes = await fetch(rawUrlObj.toString(), {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        }
      });
      if (!rawRes.ok) throw new Error('Failed to fetch truncated raw file content');
      return await rawRes.json();
    }

    return JSON.parse(file.content);
  } catch (error) {
    console.error('Error fetching Gist:', error);
    throw error;
  }
}

/**
 * Updates the database content in an existing GitHub Gist.
 * @param {string} token GitHub Personal Access Token
 * @param {string} gistId The ID of the Gist to update
 * @param {object} data The full updated database object
 * @returns {Promise<boolean>} Success status
 */
export async function updateGistData(token, gistId, data) {
  try {
    const response = await fetch(`https://api.github.com/gists/${gistId}`, {
      method: 'PATCH',
      headers: getHeaders(token),
      body: JSON.stringify({
        description: '🐾 Couple Balance App Cloud Database (Cute Line Dogs) 🐾',
        files: {
          [FILE_NAME]: {
            content: JSON.stringify(data, null, 2)
          }
        }
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `Failed to update Gist (${response.status})`);
    }

    return true;
  } catch (error) {
    console.error('Error updating Gist:', error);
    throw error;
  }
}
