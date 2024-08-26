import { Pool } from 'pg';

const pool = new Pool({
  user: 'candidate', 
  host: 'localhost',
  database: 'candidate', 
  password: '',
  port: 5432,
});

export default {
  query: (text, params) => pool.query(text, params),
};
