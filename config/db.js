import pkg from 'pg'
import dotenv from 'dotenv'
dotenv.config();

const url = process.env.DATABASE_URL
const {Pool} = pkg;

const pool = new Pool({
    connectionString: url,
    ssl:{
        rejectUnauthorized: false,
    },
    keepAlive: true
});

pool.connect().then(()=> console.log('connected')).catch((err)=>console.log(err));

export default pool;