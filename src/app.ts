import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { DataService, queryResultType } from './dataService';

// https://docs.aws.amazon.com/lambda/latest/dg/typescript-handler.html
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const { requestContext } = event;
  const { method: httpMethod, path } = (requestContext as any).http;
  const dataService = new DataService();

  try {
    let data;
    if (httpMethod === 'GET' && path === '/init') {
      data = initDB(dataService);
    } else if (httpMethod === 'GET' && path === '/version') {
      data = getTiDBVersion(dataService);
    } else if (httpMethod === 'GET' && path === '/player') {
      const id = Number(event.queryStringParameters?.id);
      data = getPlayer(dataService, id);
    } else if (httpMethod === 'POST' && path === '/player') {
      const { coins, goods } = JSON.parse(event.body || '{}');
      data = createPlayer(dataService, coins, goods);
    } else if (httpMethod === 'PUT' && path === '/player') {
      const { id, coins, goods } = JSON.parse(event.body || '{}');
      data = updatePlayer(dataService, id, coins, goods);
    } else if (httpMethod === 'DELETE' && path === '/player') {
      const id = Number(event.queryStringParameters?.id);
      data = deletePlayer(dataService, id);
    }
    if (data) {
      const { results } = (await data) as queryResultType;
      return wrapResponse(results);
    }
    const { results } = (await dataService.singleQuery(
      'SELECT "Hello World";'
    )) as queryResultType;
    return wrapResponse(results);
  } catch (err: any) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err,
      }),
    };
  }
};

const wrapResponse = (results: queryResultType) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      results,
    }),
  };
};

const initDB = async (service: DataService) => {
  await service.createTable();
  const results = await service.insert();
  return results;
};

const getTiDBVersion = async (service: DataService) => {
  const results = await service.getTiDBVersion();
  return results;
};

const getPlayer = async (service: DataService, id: number) => {
  const results = await service.getPlayerByID(id);
  return results;
};

const createPlayer = async (
  service: DataService,
  coins: number,
  goods: number
) => {
  const results = await service.createPlayer(coins, goods);
  return results;
};

const updatePlayer = async (
  service: DataService,
  id: number,
  coins: number,
  goods: number
) => {
  const results = await service.updatePlayer(id, coins, goods);
  return results;
};

const deletePlayer = async (service: DataService, id: number) => {
  const results = await service.deletePlayerByID(id);
  return results;
};
