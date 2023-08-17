import mysql from 'mysql2';

export type queryResultType = {
  results: any;
  fields: any;
};

export class DataService {
  private readonly pool: mysql.Pool;

  constructor(
    protected readonly host = process.env.TIDB_HOST || 'localhost',
    protected readonly port = process.env.TIDB_PORT
      ? parseInt(process.env.TIDB_PORT)
      : 4000,
    protected readonly user = process.env.TIDB_USER || 'root',
    protected readonly password = process.env.TIDB_PASSWORD || '',
    protected readonly database = 'test'
  ) {
    const pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true,
      },
      waitForConnections: true,
      connectionLimit: 1,
      maxIdle: 1, // max idle connections, the default value is the same as `connectionLimit`
      idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });
    this.pool = pool;
  }

  singleQuery(sql: string): Promise<queryResultType | mysql.QueryError> {
    return new Promise((resolve, reject) => {
      this.pool.query(sql, (err, results, fields) => {
        if (err) {
          reject(err);
        } else {
          resolve({ results, fields });
        }
      });
    });
  }
}
