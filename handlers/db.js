const { Pool } = require('pg')
const fs = require('fs')
let { config, logger } = bot;

logger.info(`[Database] Setting up connection with database...`)

const pool = new Pool({
	connectionString: config.database,
	connectionTimeoutMillis: 5000,
	idleTimeoutMillis: 10000,
	max: 20,
	min: 4,
	ssl: false,
})

pool.on('connect', client => {
	logger.info(`[Database] Connected to database!`)
})

pool.on('error', (err, client) => {
	logger.error(`[Database] Unexpected error on idle client: ${err.message}`)
	setTimeout(() => {
		logger.info('[Database] Attempting to reconnect to the PostgreSQL database...')
		pool.connect()
			.then(() => {
				logger.info('[Database] Reconnected to the PostgreSQL database.')
			})
			.catch(reconnectError => {
				logger.error(`[Database] Reconnection failed: ${reconnectError.message}`)
			})
	}, 5000)
})

async function performQuery() {
	const client = await pool.connect()
	try {
		const res = await client.query('SELECT NOW()')
	} catch (err) {
		logger.error('[Database] Error executing query', err.stack)
	} finally {
		client.release()
	}
}

performQuery()

module.exports = { pool }
