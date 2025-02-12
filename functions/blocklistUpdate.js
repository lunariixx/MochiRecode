const axios = require("axios");
const logger = require("../utils/logger.js");
const axiosRetry = require("axios-retry");
const readline = require("readline");
const Database = require("better-sqlite3");

const db = new Database("./db/database.sqlite");

// Define blocklist sources with corresponding types
const BLOCKLIST_SOURCES = [
    { url: "https://raw.githubusercontent.com/blocklistproject/Lists/refs/heads/master/alt-version/crypto-nl.txt", type: "crypto" },
    { url: "https://raw.githubusercontent.com/blocklistproject/Lists/refs/heads/master/alt-version/gambling-nl.txt", type: "gambling" },
    { url: "https://raw.githubusercontent.com/blocklistproject/Lists/refs/heads/master/alt-version/phishing-nl.txt", type: "phishing" },
    { url: "https://raw.githubusercontent.com/blocklistproject/Lists/refs/heads/master/alt-version/ransomware-nl.txt", type: "ransomware" },
    { url: "https://raw.githubusercontent.com/blocklistproject/Lists/refs/heads/master/alt-version/scam-nl.txt", type: "scam" },
    { url: "https://raw.githubusercontent.com/blocklistproject/Lists/refs/heads/master/alt-version/porn-nl.txt", type: "porn" },
    { url: "https://raw.githubusercontent.com/blocklistproject/Lists/refs/heads/master/alt-version/malware-nl.txt", type: "malware" },
    { url: "https://raw.githubusercontent.com/blocklistproject/Lists/refs/heads/master/alt-version/abuse-nl.txt", type: "abuse" },
    { url: "https://raw.githubusercontent.com/sjhgvr/oisd/refs/heads/main/abp_nsfw.txt", type: "porn" },
    { url: "https://malware-filter.gitlab.io/malware-filter/phishing-filter-domains.txt", type: "phishing" },
];

const axiosConfig = {
    timeout: 20000,
};

axiosRetry(axios, {
    retries: 3,
    retryDelay: axiosRetry.exponentialDelay,
    shouldRetry: (error) => error.response && error.response.status >= 500,
});

// Prepare bulk insert statement
const insertUrl = db.prepare(`
    INSERT INTO url_blocklist (url, type)
    VALUES (?, ?)
    ON CONFLICT(url) DO UPDATE SET type = excluded.type;
`);
const insertMany = db.transaction((entries) => {
    for (const { url, type } of entries) {
        insertUrl.run(url, type);
    }
});

const fetchBlocklists = async () => {
    try {
        logger.info("[Auto Moderator] Fetching blocklists...");

        const requests = BLOCKLIST_SOURCES.map(async ({ url, type }) => {
            try {
                const { data } = await axios.get(url, { ...axiosConfig, responseType: "stream" });
                const rl = readline.createInterface({
                    input: data,
                    crlfDelay: Infinity,
                });

                let batch = [];
                const BATCH_SIZE = 500; // Adjust based on system performance

                for await (const line of rl) {
                    const trimmedLine = line.trim();
                    if (trimmedLine && !trimmedLine.startsWith("#") && !trimmedLine.startsWith("!") && !trimmedLine.startsWith("[")) {
                        let domain = trimmedLine.replace(/^(\|\|)/, "").trim();
                        if (domain.endsWith("^")) {
                            domain = domain.slice(0, -1);
                        }

                        batch.push({ url: domain, type });

                        // Insert in batches for performance
                        if (batch.length >= BATCH_SIZE) {
                            insertMany(batch);
                            batch = [];
                        }
                    }
                }

                // Insert remaining items
                if (batch.length > 0) {
                    insertMany(batch);
                }

            } catch (err) {
                logger.error(`[Auto Moderator] Failed to fetch from ${url}: ${err.message}`);
            }
        });

        await Promise.all(requests);
        logger.info("[Auto Moderator] Blocklist updated in database.");
    } catch (error) {
        logger.error(`[Auto Moderator] Fetching blocklists failed: ${error.message}`);
    }
};

module.exports = {
    name: "blocklistUpdater",
    async execute() {
        await fetchBlocklists();
    }
};
