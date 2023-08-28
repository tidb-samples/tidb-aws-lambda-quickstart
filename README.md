# TiDB Serverless AWS Lambda Function Qucikstart

- Framework: [AWS Lambda TypeScript](https://docs.aws.amazon.com/lambda/latest/dg/typescript-handler.html)
- Driver: [MySQL2](https://github.com/sidorares/node-mysql2)
- Deployment: [AWS Lambda](https://aws.amazon.com/lambda/)

## Prerequisites

- [TiDB Serverless cluster](https://www.pingcap.com/tidb-serverless/)
- [Node.js](https://nodejs.org/en/) >= 18.0.0
- [Yarn](https://yarnpkg.com/) >= 1.22.0
- [AWS Account](https://aws.amazon.com/console/)
- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)

## Steps

### 1. Clone this repo

```bash
git clone git@github.com:tidb-samples/tidb-aws-lambda-quickstart.git
```

### 2. Configure Database Connection

Refer to [`lib/tidb.ts`](lib/tidb.ts)

```typescript
// lib/tidb.ts
import mysql from 'mysql2';

let pool: mysql.Pool | null = null;

function connect() {
  pool = mysql.createPool({
    host: process.env.TIDB_HOST, // TiDB host, for example: {gateway-region}.aws.tidbcloud.com
    port: process.env.TIDB_PORT ? Number(process.env.TIDB_PORT) : 4000, // TiDB port, default: 4000
    user: process.env.TIDB_USER, // TiDB user, for example: {prefix}.root
    password: process.env.TIDB_PASSWORD, // TiDB password
    database: process.env.TIDB_DATABASE || 'test', // TiDB database name, default: test
    ssl: {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: true,
    },
    connectionLimit: 1, // Setting connectionLimit to "1" in a serverless function environment optimizes resource usage, reduces costs, ensures connection stability, and enables seamless scalability.
    maxIdle: 1, // max idle connections, the default value is the same as `connectionLimit`
    enableKeepAlive: true,
  });
}

export function getConnection(): mysql.Pool {
  if (!pool) {
    connect();
  }
  return pool as mysql.Pool;
}
```

### 3. Configure Environment Variables

You need to configure the following environment variables in [`env.json`](env.json):

```json
{
  "Parameters": {
    "TIDB_HOST": "your_tidb_serverless_cluster_endpoint",
    "TIDB_PORT": "4000",
    "TIDB_USER": "your_tidb_serverless_cluster_user",
    "TIDB_PASSWORD": "your_tidb_serverless_cluster_password"
  }
}
```

### 4. Define Database Query

Refer to [`src/dataService.ts#L22`](src/dataService.ts#L22)

```typescript
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
```

### 5. Define Lambda Handler

Refer to [`src/app.ts#L7`](src/app.ts#L7)

### 6. CRUD

#### 6.1 Initialize Database and data

Refer to [`src/dataService.ts#L49`](src/dataService.ts#L49)

```typescript
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
```

Handler: Refer to [`src/app.ts#L16`](src/app.ts#L16)

#### 6.2 Create

Refer to [`src/dataService.ts#L83`](src/dataService.ts#L83)

```typescript
  async createPlayer(coins: number, goods: number) {
    const results = await this.singleQuery(
      `INSERT INTO players (coins, goods) VALUES (?, ?);`,
      [coins, goods]
    );
    return results;
  }
```

Handler: Refer to [`src/app.ts#L23`](src/app.ts#L23)

#### 6.3 Read

Refer to [`src/dataService.ts#L91`](src/dataService.ts#L91)

```typescript
  async getPlayerByID(id: number) {
    const results = await this.singleQuery(
      'SELECT id, coins, goods FROM players WHERE id = ?;',
      [id]
    );
    return results;
  }
```

Handler: Refer to [`src/app.ts#L20`](src/app.ts#L20)

#### 6.4 Update

Refer to [`src/dataService.ts#L99`](src/dataService.ts#L99)

```typescript
  async updatePlayer(playerID: number, incCoins: number, incGoods: number) {
    const results = await this.singleQuery(
      'UPDATE players SET coins = coins + ?, goods = goods + ? WHERE id = ?;',
      [incCoins, incGoods, playerID]
    );
    return results;
  }
```

Handler: Refer to [`src/app.ts#L26`](src/app.ts#L26)

#### 6.5 Delete

Refer to [`src/dataService.ts#L107`](src/dataService.ts#L107)

```typescript
  async deletePlayerByID(id: number) {
    const results = await this.singleQuery(
      'DELETE FROM players WHERE id = ?;',
      [id]
    );
    return results;
  }
```

Handler: Refer to [`src/app.ts#L29`](src/app.ts#L29)

## Local Test

1. Configure **Environment variables** in [`env.json`](env.json)

2. Run the following commands

```bash
# install dependencies
yarn
# build
yarn build

# run local test
## 1. Hello World
sam local invoke --env-vars env.json -e events/event.json "tidbHelloWorldFunction"
## 2. Get TiDB version
sam local invoke --env-vars env.json -e events/event-version.json "tidbHelloWorldFunction"
## 3. CRUD - Initialize Database and data
sam local invoke --env-vars env.json -e events/event-init.json "tidbHelloWorldFunction"
## 4. CRUD - Create
sam local invoke --env-vars env.json -e events/event-crud-post.json "tidbHelloWorldFunction"
## 5. CRUD - Read
sam local invoke --env-vars env.json -e events/event-crud-get.json "tidbHelloWorldFunction"
## 6. CRUD - Update
sam local invoke --env-vars env.json -e events/event-crud-put.json "tidbHelloWorldFunction"
## 7. CRUD - Delete
sam local invoke --env-vars env.json -e events/event-crud-delete.json "tidbHelloWorldFunction"
```

## Deploy

### 1. Build

```bash
# Install dependencies
yarn
# Build
yarn build
# After build, you will see the following files in the dist folder
# - index.js
# - index.js.map
# - index.zip // This is the deployment package
```

### 2. Deploy

1. Visit [AWS Lambda Console](https://console.aws.amazon.com/lambda/home?region=us-west-2#/functions)
2. Click **Create function**
3. Select **Author from scratch**
4. Enter **Function name**
5. Select **Node.js 18.x** as **Runtime**
6. Click **Create function**
7. Click **Upload from** and select **index.zip file**
8. Click **Save**
9. Configure **Environment variables**
