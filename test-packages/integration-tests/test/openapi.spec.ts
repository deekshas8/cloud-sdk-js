import nock from 'nock';
import * as httpClient from '@sap-cloud-sdk/http-client';
import {
  expectAllMocksUsed,
  certificateMultipleResponse,
  certificateSingleResponse,
  mockInstanceDestinationsCall,
  mockServiceBindings,
  mockSingleDestinationCall,
  mockSubaccountDestinationsCall,
  onlyIssuerServiceToken,
  onlyIssuerXsuaaUrl,
  providerXsuaaUrl,
  providerServiceToken
} from '@sap-cloud-sdk/connectivity/src/test-util';
import {
  parseDestination,
  sanitizeDestination
} from '@sap-cloud-sdk/connectivity';
import { wrapJwtInHeader } from '@sap-cloud-sdk/connectivity/internal';
import { encodeTypedClientRequest } from '@sap-cloud-sdk/http-client/internal';
import { OpenApiRequestBuilder } from '@sap-cloud-sdk/openapi';

const destination = {
  url: 'http://example.com'
};

const httpSpy = jest.spyOn(httpClient, 'executeHttpRequest');
const dummyResponse = 'dummy response';

describe('Openapi ISS Token', () => {
  beforeEach(() => {
    nock(destination.url).get(/.*/).reply(200, dummyResponse);
    nock(destination.url).post(/.*/).reply(200);
  });
  afterEach(() => {
    httpSpy.mockClear();
  });

  it('executes a request using the (iss) to build a token instead of a user JWT', async () => {
    mockServiceBindings();

    const nocks = [
      nock(onlyIssuerXsuaaUrl)
        .post('/oauth/token')
        .times(1)
        .reply(200, { access_token: onlyIssuerServiceToken }),
      nock(providerXsuaaUrl)
        .post('/oauth/token')
        .times(1)
        .reply(200, { access_token: providerServiceToken }),
      mockInstanceDestinationsCall(nock, [], 200, onlyIssuerServiceToken),
      mockSubaccountDestinationsCall(
        nock,
        certificateMultipleResponse,
        200,
        onlyIssuerServiceToken
      ),
      mockSingleDestinationCall(
        nock,
        certificateSingleResponse,
        200,
        'ERNIE-UND-CERT',
        wrapJwtInHeader(onlyIssuerServiceToken).headers
      ),
      nock(certificateSingleResponse.destinationConfiguration.URL)
        .get(/.*/)
        .reply(200, 'iss token used on the way')
    ];
    const requestBuilder = new OpenApiRequestBuilder('get', '/test', {
      body: {
        limit: 100
      }
    });
    const response = await requestBuilder.executeRaw({
      destinationName: 'ERNIE-UND-CERT',
      iss: onlyIssuerXsuaaUrl
    });
    expectAllMocksUsed(nocks);
    expect(httpSpy).toHaveBeenLastCalledWith(
      sanitizeDestination(parseDestination(certificateSingleResponse)),
      {
        method: 'get',
        url: '/test',
        headers: { requestConfig: {} },
        params: { requestConfig: {} },
        parameterEncoder: encodeTypedClientRequest,
        data: {
          limit: 100
        }
      },
      { fetchCsrfToken: false }
    );
    expect(response.data).toBe('iss token used on the way');
  });
});
