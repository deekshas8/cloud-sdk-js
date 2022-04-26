import nock from 'nock';
import {
  EntityApi,
  EntityBase,
  GetAllRequestBuilderBase,
  ODataCreateRequestConfig,
  ODataDeleteRequestConfig,
  ODataGetAllRequestConfig,
  ODataRequest,
  ODataUpdateRequestConfig
} from '@sap-cloud-sdk/odata-common/internal';
import { createODataUri } from '../../src/internal';
import { Destination } from '@sap-cloud-sdk/connectivity';
import {
  defaultDestination,
  defaultHost,
  defaultRequestHeaders,
  defaultCsrfToken,
  mockHeaderRequest
} from '@sap-cloud-sdk/connectivity/internal';

export interface MockRequestParams {
  host?: string;
  destination?: Destination;
  path?: string;
  statusCode?: number;
  additionalHeaders?: Record<string, any>;
  body?: Record<string, any>;
  responseBody?: Record<string, any>;
  responseHeaders?: Record<string, any>;
  query?: Record<string, any>;
  method?: string;
  headers?: Record<string, any>;
  delay?: number;
}

export function mockCreateRequest<T extends EntityApi<EntityBase, any>>(
  params: MockRequestParams,
  entityApi: T
) {
  const requestConfig = new ODataCreateRequestConfig(
    entityApi,
    createODataUri(entityApi.deSerializers)
  );
  return mockRequest(requestConfig, {
    ...params,
    statusCode: params.statusCode || 200,
    method: params.method || 'post',
    responseBody: { d: params.responseBody || params.body }
  });
}

export function mockDeleteRequest<T extends EntityApi<EntityBase, any>>(
  params: MockRequestParams,
  entityApi: T
) {
  const requestConfig = new ODataDeleteRequestConfig(
    entityApi,
    createODataUri(entityApi.deSerializers)
  );
  return mockRequest(requestConfig, {
    ...params,
    statusCode: params.statusCode || 202,
    method: params.method || 'delete'
  });
}

export function mockUpdateRequest<T extends EntityApi<EntityBase, any>>(
  params: MockRequestParams,
  entityApi: T
) {
  const requestConfig = new ODataUpdateRequestConfig(
    entityApi,
    createODataUri(entityApi.deSerializers)
  );
  return mockRequest(requestConfig, {
    ...params,
    statusCode: params.statusCode || 204,
    method: params.method || 'patch'
  });
}

export function mockCountRequest(
  destination: Destination,
  count: number,
  getAllRequest: GetAllRequestBuilderBase<EntityBase, any>
) {
  const servicePath =
    getAllRequest._entityApi.entityConstructor._defaultServicePath;
  const entityName = getAllRequest._entityApi.entityConstructor._entityName;
  return nock(defaultHost)
    .get(`${destination.url}${servicePath}/${entityName}/$count`)
    .reply(200, count.toString());
}

export function mockGetRequest<T extends EntityApi<EntityBase, any>>(
  params: MockRequestParams,
  entityApi: T
) {
  const requestConfig = new ODataGetAllRequestConfig(
    entityApi,
    createODataUri(entityApi.deSerializers)
  );
  return mockRequest(requestConfig, {
    ...params,
    statusCode: params.statusCode || 200,
    method: params.method || 'get',
    query: params.query
  });
}

function mockRequest(
  requestConfig,
  {
    host = defaultHost,
    destination = defaultDestination,
    path = '',
    statusCode = 200,
    delay = 0,
    additionalHeaders,
    method = 'get',
    body,
    query = {},
    responseBody,
    responseHeaders,
    headers
  }: MockRequestParams
) {
  const request = new ODataRequest(requestConfig, destination);

  mockHeaderRequest({ request, path });

  return nock(host, getRequestHeaders(method, additionalHeaders, headers))
    [method](
      path ? `${request.serviceUrl()}/${path}` : request.resourceUrl(),
      body
    )
    .query(query)
    .delay(delay)
    .reply(statusCode, responseBody, responseHeaders);
}

function getRequestHeaders(
  method: string,
  additionalHeaders?: Record<string, any>,
  headers?: Record<string, any>
) {
  if (headers) {
    return { reqheaders: headers };
  }

  if (additionalHeaders) {
    const initialHeaders =
      method === 'get'
        ? defaultRequestHeaders
        : { ...defaultRequestHeaders, 'x-csrf-token': defaultCsrfToken };
    return { reqheaders: { ...initialHeaders, ...additionalHeaders } };
  }
}
