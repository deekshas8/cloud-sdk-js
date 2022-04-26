import nock from 'nock';

interface MockHeaderRequestParams {
  request;
  host?: string;
  responseHeaders?: Record<string, any>;
  path?: string;
}

export const defaultBasicCredentials = 'Basic dXNlcm5hbWU6cGFzc3dvcmQ=';
export const defaultRequestHeaders = {
  authorization: defaultBasicCredentials,
  cookie: 'mocked-cookie-0;mocked-cookie-2',
  'content-type': 'application/json',
  accept: 'application/json',
  'sap-client': '123'
};
export const defaultDestinationName = 'Testination';
export const defaultHost = 'http://localhost';
export const defaultCsrfToken = 'mocked-x-csrf-token';
export const defaultDestination = {
  name: defaultDestinationName,
  url: '/testination',
  username: 'username',
  password: 'password',
  sapClient: '123',
  authTokens: [],
  originalProperties: {}
};

export const mockedBuildHeaderResponse = {
  'x-csrf-token': defaultCsrfToken,
  'set-cookie': ['mocked-cookie-0;mocked-cookie-1', 'mocked-cookie-2']
};

export function mockHeaderRequest({
  request,
  host = defaultHost,
  responseHeaders = mockedBuildHeaderResponse,
  path
}: MockHeaderRequestParams) {
  return nock(host)
    .head(path ? `${request.serviceUrl()}/${path}` : request.serviceUrl())
    .reply(200, undefined, responseHeaders);
}

export function mockCsrfTokenRequest(
  host: string,
  sapClient: string,
  servicePath = '/sap/opu/odata/sap/API_TEST_SRV',
  username = 'username',
  password = 'password',
  csrfToken = 'CSRFTOKEN'
) {
  nock(host, {
    reqheaders: {
      authorization:
        'Basic ' + Buffer.from(`${username}:${password}`).toString('base64'),
      'x-csrf-token': 'Fetch',
      'sap-client': sapClient
    }
  })
    .get(servicePath)
    .reply(200, '', {
      'x-csrf-token': csrfToken,
      'Set-Cookie': ['key1=val1', 'key2=val2', 'key3=val3']
    });
}

export function mockDestinationsEnv(...destinations) {
  process.env.destinations = JSON.stringify([...destinations]);
}

export function unmockDestinationsEnv() {
  delete process.env.destinations;
}
