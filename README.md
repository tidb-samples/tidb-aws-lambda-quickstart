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

Refer to [`src/dataService.ts#L8`](src/dataService.ts#L8)

```typescript
import mysql from 'mysql2';

const pool = mysql.createPool({
  host, // TiDB Serverless cluster endpoint
  port, // TiDB Serverless cluster port, 4000 is the default
  user, // TiDB Serverless cluster user
  password, // TiDB Serverless cluster password
  database, // TiDB Serverless cluster database, 'test' is the default
  ssl: {  // TiDB Serverless cluster SSL config(required)
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true,
  },
  ... // other mysql2 config
});
```

### 3. Configure Environment Variables

You need to configure the following environment variables:

```bash
TIDB_HOST="your_tidb_serverless_cluster_endpoint"
TIDB_PORT=4000
TIDB_USER="your_tidb_serverless_cluster_user"
TIDB_PASSWORD="your_tidb_serverless_cluster_password"
```

### 4. Define Database Query

Refer to [`src/dataService.ts#L41`](src/dataService.ts#L41)

```javascript
  singleQuery(sql) {
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
```

### 5. Define Lambda Handler

Refer to [`src/app.ts#L7`](src/app.ts#L7)

## Local Test

1. Configure **Environment variables** in [`env.json`](env.json)

2. Run the following commands

```bash
# install dependencies
yarn
# build
yarn build
# run local test
sam local invoke --env-vars env.json -e event.json "tidbHelloWorldFunction"
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
