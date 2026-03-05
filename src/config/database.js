const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
        dialect: 'postgres',

        logging: process.env.DB_LOGGING === 'true' ? console.log : false,

        ...(process.env.DB_SSL === 'true'
        ? {
            dialectOptions: {
                ssl: {
                    require: true,
                    rejectUnauthorized: false,
                },
            },
        }
      : {}),
    }
);

if (process.env.NODE_ENV !== 'production') {
    console.log(`📡 Connecting to ${(process.env.NODE_ENV || 'development')} DB...`);
}

module.exports = sequelize;