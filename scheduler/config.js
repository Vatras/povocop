module.exports = {
    dbName: process.env.dbName || 'povocop_1',
    dbUser: process.env.dbUser || 'postgres',
    dbPassword: process.env.dbPassword || 'povocop',
    dbHost: process.env.dbHost || '127.0.0.1',
    dbLogging: process.env.dbLogging == "true",
    cachedInputDataSize: parseInt(process.env.cachedInputDataSize) || 150,
    secretToSignJWT: process.env.secretToSignJWT || 'abXcdEF96412',
    minimumCachedInputDataSize : parseInt(process.env.minimumCachedInputDataSize) || 130
}