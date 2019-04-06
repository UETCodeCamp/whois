module.exports = {
	apps : [
	{
		name: 'whois-api',
		script: 'index.js',
		instances: 1,
		autorestart: true,
		env: {
		  NODE_ENV: 'production'
		}
	},
	{
		name: 'whois-worker',
		script: 'worker.js',
		instances: 1,
		autorestart: true,
		env: {
		  NODE_ENV: 'production'
		}
	}
	]
};
