import nock = require('nock');
import { v4 as uuid } from 'uuid';
import { createUriConverter } from '@sap-cloud-sdk/odata-common/internal';
import {
  defaultDestination,
  mockGetRequest
} from '../../../../test-resources/test/test-util/request-mocker';
import {
  createOriginalTestEntityData1,
  createOriginalTestEntityDataWithLinks,
  createTestEntity,
  testEntityResourcePath
} from '../../../../test-resources/test/test-util/test-data';
import { defaultDeSerializers } from '../de-serializers';
import { testEntityApi } from '../../test/test-util';
import { GetByKeyRequestBuilder } from './get-by-key-request-builder';

const uriConverter = createUriConverter(defaultDeSerializers);

describe('GetByKeyRequestBuilder', () => {
  describe('url', () => {
    it('returns correct url with appendPath', async () => {
      const entityData = createOriginalTestEntityData1();
      const entity = createTestEntity(entityData);
      const expected =
        /^\/testination\/sap\/opu\/odata\/sap\/API_TEST_SRV\/A_TestEntity\(KeyPropertyGuid=guid'\w{8}-\w{4}-\w{4}-\w{4}-\w{12}',KeyPropertyString='ABCDE'\)\/to_SingleLink\/to_MultiLink\/\?\$format=json$/;

      const actual = await new GetByKeyRequestBuilder(testEntityApi, {
        KeyPropertyGuid: entity.keyPropertyGuid,
        KeyPropertyString: entity.keyPropertyString
      })
        .appendPath('/to_SingleLink', '/to_MultiLink/')
        .url(defaultDestination);
      expect(actual).toMatch(expected);
    });
  });

  describe('execute', () => {
    it('returns entity by key', async () => {
      const entityData = createOriginalTestEntityData1();
      const expected = createTestEntity(entityData);

      mockGetRequest(
        {
          path: testEntityResourcePath(
            expected.keyPropertyGuid,
            expected.keyPropertyString,
            uriConverter
          ),
          responseBody: { d: entityData }
        },
        testEntityApi
      );

      const actual = await new GetByKeyRequestBuilder(testEntityApi, {
        KeyPropertyGuid: expected.keyPropertyGuid,
        KeyPropertyString: expected.keyPropertyString
      }).execute(defaultDestination);
      expect(actual).toEqual(expected);
      expect(actual.versionIdentifier).toBeUndefined();
    });

    it('ETag should be pulled from __metadata', async () => {
      const entityData = createOriginalTestEntityData1();
      const versionIdentifier = 'etagInMetadata';
      entityData['__metadata'] = { etag: versionIdentifier };
      const expected = createTestEntity(entityData);

      mockGetRequest(
        {
          path: testEntityResourcePath(
            expected.keyPropertyGuid,
            expected.keyPropertyString,
            uriConverter
          ),
          responseBody: { d: entityData }
        },
        testEntityApi
      );

      const actual = await new GetByKeyRequestBuilder(testEntityApi, {
        KeyPropertyGuid: expected.keyPropertyGuid,
        KeyPropertyString: expected.keyPropertyString
      }).execute(defaultDestination);
      expected.setVersionIdentifier(versionIdentifier);
      expect(actual).toEqual(expected);
    });

    it('ETag should be pulled from response header when __metadata has no ETag property', async () => {
      const entityData = createOriginalTestEntityData1();
      const expected = createTestEntity(entityData);
      const versionIdentifier = 'etagInHeader';
      expected.setVersionIdentifier(versionIdentifier);

      mockGetRequest(
        {
          path: testEntityResourcePath(
            expected.keyPropertyGuid,
            expected.keyPropertyString,
            uriConverter
          ),
          responseBody: { d: entityData },
          responseHeaders: { Etag: versionIdentifier }
        },
        testEntityApi
      );

      const actual = await new GetByKeyRequestBuilder(testEntityApi, {
        KeyPropertyGuid: expected.keyPropertyGuid,
        KeyPropertyString: expected.keyPropertyString
      }).execute(defaultDestination);
      expect(actual).toEqual(expected);
    });

    it('can handle the C4C response format', async () => {
      const entityData = createOriginalTestEntityData1();
      const expected = createTestEntity(entityData);

      mockGetRequest(
        {
          path: testEntityResourcePath(
            expected.keyPropertyGuid,
            expected.keyPropertyString,
            uriConverter
          ),
          responseBody: { d: { results: entityData } }
        },
        testEntityApi
      );

      const actual = await new GetByKeyRequestBuilder(testEntityApi, {
        KeyPropertyGuid: expected.keyPropertyGuid,
        KeyPropertyString: expected.keyPropertyString
      }).execute(defaultDestination);
      expect(actual).toEqual(expected);
      expect(actual.versionIdentifier).toBeUndefined();
    });
  });

  describe('executeRaw', () => {
    it('returns request and raw response', async () => {
      const entityData = createOriginalTestEntityData1();
      const expected = createTestEntity(entityData);

      mockGetRequest(
        {
          path: testEntityResourcePath(
            expected.keyPropertyGuid,
            expected.keyPropertyString,
            uriConverter
          ),
          responseBody: { d: entityData }
        },
        testEntityApi
      );

      const actual = await new GetByKeyRequestBuilder(testEntityApi, {
        KeyPropertyGuid: expected.keyPropertyGuid,
        KeyPropertyString: expected.keyPropertyString
      }).executeRaw(defaultDestination);
      expect(actual.data.d).toEqual(entityData);
      expect(actual.request.method).toBe('GET');
    });

    it('builds a URL with appended paths', async () => {
      const entityData = createOriginalTestEntityDataWithLinks();
      const entity = createTestEntity(entityData);

      mockGetRequest(
        {
          path: `${testEntityResourcePath(
            entity.keyPropertyGuid,
            entity.keyPropertyString,
            uriConverter
          )}/to_SingleLink/to_MultiLink`
        },
        testEntityApi
      );

      const response = await new GetByKeyRequestBuilder(testEntityApi, {
        KeyPropertyGuid: entity.keyPropertyGuid,
        KeyPropertyString: entity.keyPropertyString
      })
        .appendPath('/to_SingleLink', '/to_MultiLink')
        .executeRaw(defaultDestination);
      expect(response.status).toEqual(200);
    });
  });

  it('throws a useful error when request execution fails', async () => {
    nock(/.*/).get(/.*/).reply(500);

    const getByKeyRequest = new GetByKeyRequestBuilder(testEntityApi, {
      KeyPropertyGuid: uuid(),
      KeyPropertyString: 'test'
    }).execute(defaultDestination);
    await expect(getByKeyRequest).rejects.toThrowErrorMatchingSnapshot();
  });
});