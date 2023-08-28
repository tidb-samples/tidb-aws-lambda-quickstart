import mysql from 'mysql2';
import { getConnection } from '../lib/tidb';

export type queryResultType = {
  results: any;
  fields: any;
};

export type Player = {
  id: number;
  coins: number;
  goods: number;
};

export class DataService {
  private readonly pool: mysql.Pool;

  constructor() {
    this.pool = getConnection();
  }

  singleQuery(
    sql: string,
    ...args: any[]
  ): Promise<queryResultType | mysql.QueryError> {
    return new Promise((resolve, reject) => {
      this.pool.query(sql, ...args, (err: any, results: any, fields: any) => {
        if (err) {
          reject(err);
        } else {
          resolve({ results, fields });
        }
      });
    });
  }

  async close() {
    return new Promise<void>((resolve, reject) => {
      this.pool.end((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async createTable() {
    const sql = `CREATE TABLE IF NOT EXISTS players (
      id INT(11) NOT NULL AUTO_INCREMENT COMMENT 'The unique ID of the player.',
      coins INT(11) COMMENT 'The number of coins that the player had.',
      goods INT(11) COMMENT 'The number of goods that the player had.',
      PRIMARY KEY (\`id\`)
  )`;
    await this.singleQuery(sql);
  }

  async insert() {
    const sql = `INSERT INTO
    players (\`id\`, \`coins\`, \`goods\`)
    VALUES
        (1, 1, 1024),
        (2, 2, 512),
        (3, 3, 256),
        (4, 4, 128),
        (5, 5, 64),
        (6, 6, 32),
        (7, 7, 16),
        (8, 8, 8),
        (9, 9, 4),
        (10, 10, 2),
        (11, 11, 1);`;
    const results = await this.singleQuery(sql);
    return results;
  }

  async getTiDBVersion() {
    const results = await this.singleQuery('SELECT VERSION() AS tidb_version;');
    return results;
  }

  async createPlayer(coins: number, goods: number) {
    const results = await this.singleQuery(
      `INSERT INTO players (coins, goods) VALUES (?, ?);`,
      [coins, goods]
    );
    return results;
  }

  async getPlayerByID(id: number) {
    const results = await this.singleQuery(
      'SELECT id, coins, goods FROM players WHERE id = ?;',
      [id]
    );
    return results;
  }

  async updatePlayer(playerID: number, incCoins: number, incGoods: number) {
    const results = await this.singleQuery(
      'UPDATE players SET coins = coins + ?, goods = goods + ? WHERE id = ?;',
      [incCoins, incGoods, playerID]
    );
    return results;
  }

  async deletePlayerByID(id: number) {
    const results = await this.singleQuery(
      'DELETE FROM players WHERE id = ?;',
      [id]
    );
    return results;
  }
}
