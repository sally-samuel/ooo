const SANITY_BASE = 'https://wrtxyfej.apicdn.sanity.io/v2025-06-01';
const DATASET     = 'production';

/**
 * Run a GROQ query against the Sanity CDN.
 * @param {string} query  - GROQ query string
 * @param {object} params - optional query parameters
 * @returns {Promise<any>} - parsed result array/object
 */
async function sanityFetch(query, params = {}) {
  const encodedQuery = encodeURIComponent(query);
  let url = `${SANITY_BASE}/data/query/${DATASET}?query=${encodedQuery}`;

  // Append any named $params
  for (const [key, val] of Object.entries(params)) {
    url += `&${encodeURIComponent('$' + key)}=${encodeURIComponent(JSON.stringify(val))}`;
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Sanity fetch failed: ${res.status}`);
  const json = await res.json();
  return json.result;
}

/**
 * Fetch all management team members ordered by displayOrder
 */
function fetchManagement() {
  return sanityFetch(`*[_type == "management"] | order(displayOrder asc) {
    _id, name, slug, position, bio, image, displayOrder, linkedin
  }`);
}

/**
 * Fetch a single management team member by slug
 * @param {string} slug
 */
function fetchManagementBySlug(slug) {
  return sanityFetch(
    `*[_type == "management" && slug.current == $slug][0]{
      _id, name, slug, position, bio, image, displayOrder, linkedin
    }`,
    {slug}
  );
}

export {
  sanityFetch,
  fetchManagement,
  fetchManagementBySlug,
};