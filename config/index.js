require('dotenv').config();

module.exports = {
    env:                   process.env.NODE_ENV || 'development',
    port:                  process.env.PORT || 5011,
    baseAPI:               process.env.BASE_API || 'http://localhost/',

    // config database
    DBDialect:             process.env.DB_DIALECT || 'postgres',
    DBHost:                process.env.DB_HOST || '127.0.0.1',
    DBPort:                +process.env.DB_PORT || 5432,
    DBDatabase:            process.env.DB_DATABASE,
    DBUsername:            process.env.DB_USERNAME || 'postgres',
    DBPassword:            process.env.DB_PASSWORD || 'root',
};
