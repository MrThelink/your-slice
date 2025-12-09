"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const pool = new pg_1.Pool(process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        user: 'abdulaljubury',
        host: '127.0.0.1',
        database: 'yourslice',
        port: 5432,
    });
pool.connect()
    .then((client) => {
    console.log('Connected to PostgreSQL database');
    client.release();
})
    .catch((error) => {
    console.log('⚠️  PostgreSQL connection failed - running in development mode without database');
    console.log('To fix: Set up PostgreSQL with correct credentials in .env file');
});
exports.default = pool;
//# sourceMappingURL=db.js.map