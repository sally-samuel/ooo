const SANITY_CONFIG = {
    projectId: 'wrtxyfej',
    dataset: 'production',
    apiVersion: 'v2025-06-01',
    token: '',
    cdnUrl: null
};

if (!SANITY_CONFIG.cdnUrl) {
    SANITY_CONFIG.cdnUrl = `https://${SANITY_CONFIG.projectId}.apicdn.sanity.io/${SANITY_CONFIG.apiVersion}`;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SANITY_CONFIG;
}
