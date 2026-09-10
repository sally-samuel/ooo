class SanityClient {
    constructor(config = {}) {
        this.projectId = config.projectId || 'wrtxyfej';
        this.dataset = config.dataset || 'production';
        this.apiVersion = config.apiVersion || 'v2025-06-01';
        this.token = config.token || '';
        this.apiUrl = `https://${this.projectId}.apicdn.sanity.io/v${this.apiVersion}`;
    }

    async fetch(query, params = {}) {
        try {
            const queryString = this.buildQueryString(query, params);
            const url = `${this.apiUrl}/data/query/${this.dataset}?${queryString}`;
            
            const headers = {
                'Content-Type': 'application/json'
            };

            if (this.token) {
                headers['Authorization'] = `Bearer ${this.token}`;
            }

            const response = await fetch(url, { headers });

            if (!response.ok) {
                throw new Error(`Sanity API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(`Sanity query error: ${data.error.description}`);
            }

            return data.result;
        } catch (error) {
            console.error('Sanity fetch error:', error);
            throw error;
        }
    }

    buildQueryString(query, params) {
        const encodedQuery = encodeURIComponent(query);
        let queryString = `query=${encodedQuery}`;

        for (const [key, value] of Object.entries(params)) {
            if (value !== null && value !== undefined) {
                queryString += `&$${key}=${encodeURIComponent(JSON.stringify(value))}`;
            }
        }

        return queryString;
    }

    // Management methods
    async getManagement(limit = 100) {
        const query = `
            *[_type == "management"] | order(displayOrder asc) [0...${limit}] {
                _id,
                name,
                position,
                bio,
                image,
                displayOrder,
                linkedin,
                _createdAt
            }
        `;
        return this.fetch(query);
    }

    async getManagementById(id) {
        const query = `
            *[_type == "management" && _id == $id] {
                _id,
                name,
                position,
                bio,
                image,
                displayOrder,
                linkedin
            }
        `;
        const result = await this.fetch(query, { id });
        return result.length > 0 ? result[0] : null;
    }

    getImageUrl(image, width = 800, height = 600) {
        if (!image || !image.asset) {
            return null;
        }
        
        const assetId = image.asset._ref;
        return `https://cdn.sanity.io/images/${this.projectId}/${this.dataset}/${assetId}?w=${width}&h=${height}&fit=crop`;
    }
}

let sanityClient;

function initSanityClient(config) {
    const mergedConfig = {
        ...window.SANITY_CONFIG || {},
        ...config
    };
    sanityClient = new SanityClient(mergedConfig);
    return sanityClient;
}

if (typeof window !== 'undefined') {
    if (window.SANITY_CONFIG) {
        initSanityClient(window.SANITY_CONFIG);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SanityClient, initSanityClient };
}
