const axios = require("axios");
const fs = require("fs");
const logger = require("../utils/logger.js");
const axiosRetry = require('axios-retry');
const readline = require("readline");

const BLOCKLIST_FILE = "./config/urlBlocklist.json";
const BLOCKLIST_URLS = [
	"https://raw.githubusercontent.com/blocklistproject/Lists/refs/heads/master/alt-version/crypto-nl.txt",
	"https://raw.githubusercontent.com/blocklistproject/Lists/refs/heads/master/alt-version/gambling-nl.txt",
	"https://raw.githubusercontent.com/blocklistproject/Lists/refs/heads/master/alt-version/phishing-nl.txt",
	"https://raw.githubusercontent.com/blocklistproject/Lists/refs/heads/master/alt-version/ransomware-nl.txt",
	"https://raw.githubusercontent.com/blocklistproject/Lists/refs/heads/master/alt-version/scam-nl.txt",
	"https://raw.githubusercontent.com/blocklistproject/Lists/refs/heads/master/alt-version/porn-nl.txt",
	"https://raw.githubusercontent.com/blocklistproject/Lists/refs/heads/master/alt-version/malware-nl.txt",
	"https://raw.githubusercontent.com/blocklistproject/Lists/refs/heads/master/alt-version/abuse-nl.txt",
	"https://raw.githubusercontent.com/sjhgvr/oisd/refs/heads/main/abp_nsfw.txt",
	"https://malware-filter.gitlab.io/malware-filter/phishing-filter-domains.txt",
];

const axiosConfig = {
	timeout: 20000,
};

axiosRetry(axios, {
    retries: 3, 
    retryDelay: axiosRetry.exponentialDelay,
    shouldRetry: (error) => {
        return error.response && error.response.status >= 500; 
    },
});

const fetchBlocklists = async () => {
	try {
		logger.info("[Auto Moderator] Fetching blocklists...");
		let allDomains = new Set();

		const requests = BLOCKLIST_URLS.map(async (url) => {
			try {
				const { data } = await axios.get(url, { ...axiosConfig, responseType: 'stream' });
				const rl = readline.createInterface({
					input: data,
					crlfDelay: Infinity, 
				});

				for await (const line of rl) {
					const trimmedLine = line.trim();
					if (trimmedLine && !trimmedLine.startsWith("#") && !trimmedLine.startsWith("!") && !trimmedLine.startsWith("[")) {
						let domain = trimmedLine.replace(/^(\|\|)/, '').trim(); 
						if (domain.endsWith('^')) {
							domain = domain.slice(0, -1);
						}
						allDomains.add(domain);
					}
				}

			} catch (err) {
				if (err.response) {
					logger.error(`[Auto Moderator] Failed to fetch from ${url}: ${err.response.status} - ${err.response.statusText}`);
				} else if (err.request) {
					logger.error(`[Auto Moderator] No response received from ${url}`);
				} else {
					logger.error(`[Auto Moderator] Error occurred with URL ${url}:`, err.message);
				}
			}
		});

		await Promise.all(requests);

		fs.writeFileSync(BLOCKLIST_FILE, JSON.stringify(Array.from(allDomains), null, 2));
		logger.info("[Auto Moderator] Blocklist updated.");

		return Array.from(allDomains);
	} catch (error) {
		logger.error("[Auto Moderator] Fetching blocklists failed:", error);
		return [];
	}
};

module.exports = {
	name: "blocklistUpdater",
	async execute() {
		await fetchBlocklists();
	}
};
