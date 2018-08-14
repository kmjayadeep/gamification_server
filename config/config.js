module.exports = {
    database: {
        name: process.env.DATABASE_NAME || 'gamification',
        username: process.env.DATABASE_USERNAME || 'root',
        password: process.env.DATABASE_PASSWORD || '',
        host: process.env.DATABASE_HOST || 'localhost'
    }
}