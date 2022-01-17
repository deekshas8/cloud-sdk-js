/*
 * Copyright (c) 2022 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import { TestEntityApi } from './TestEntityApi';
import { TestEntityLinkApi } from './TestEntityLinkApi';
import {
  concatStrings,
  getAll,
  getByKey,
  returnCollection,
  returnInt,
  returnSapCloudSdk,
  ConcatStringsParameters,
  GetAllParameters,
  GetByKeyParameters,
  ReturnCollectionParameters,
  ReturnIntParameters,
  ReturnSapCloudSdkParameters
} from './function-imports';
import {
  createTestEntityById,
  createTestEntityByIdReturnId,
  CreateTestEntityByIdParameters,
  CreateTestEntityByIdReturnIdParameters
} from './action-imports';
import { BigNumber } from 'bignumber.js';
import { batch } from './BatchRequest';
import { Moment, Duration } from 'moment';
import {
  defaultDeSerializers,
  DeSerializers,
  DefaultDeSerializers,
  mergeDefaultDeSerializersWith,
  Time
} from '@sap-cloud-sdk/odata-v4';

export function testService<
  BinaryT = string,
  BooleanT = boolean,
  ByteT = number,
  DecimalT = BigNumber,
  DoubleT = number,
  FloatT = number,
  Int16T = number,
  Int32T = number,
  Int64T = BigNumber,
  GuidT = string,
  SByteT = number,
  SingleT = number,
  StringT = string,
  AnyT = any,
  DateTimeOffsetT = Moment,
  DateT = Moment,
  DurationT = Duration,
  TimeOfDayT = Time
>(
  deSerializers: Partial<
    DeSerializers<
      BinaryT,
      BooleanT,
      ByteT,
      DecimalT,
      DoubleT,
      FloatT,
      Int16T,
      Int32T,
      Int64T,
      GuidT,
      SByteT,
      SingleT,
      StringT,
      AnyT,
      DateTimeOffsetT,
      DateT,
      DurationT,
      TimeOfDayT
    >
  > = defaultDeSerializers as any
): TestService<
  DeSerializers<
    BinaryT,
    BooleanT,
    ByteT,
    DecimalT,
    DoubleT,
    FloatT,
    Int16T,
    Int32T,
    Int64T,
    GuidT,
    SByteT,
    SingleT,
    StringT,
    AnyT,
    DateTimeOffsetT,
    DateT,
    DurationT,
    TimeOfDayT
  >
> {
  return new TestService(mergeDefaultDeSerializersWith(deSerializers));
}
export class TestService<
  DeSerializersT extends DeSerializers = DefaultDeSerializers
> {
  private apis: Record<string, any> = {};
  private deSerializers: DeSerializersT;

  constructor(deSerializers: DeSerializersT) {
    this.deSerializers = deSerializers;
  }

  private initApi(key: string, ctor: new (...args: any[]) => any): any {
    if (!this.apis[key]) {
      this.apis[key] = new ctor(this.deSerializers);
    }
    return this.apis[key];
  }

  get testEntityApi(): TestEntityApi<DeSerializersT> {
    const api = this.initApi('testEntityApi', TestEntityApi);
    const linkedApis = [this.initApi('testEntityLinkApi', TestEntityLinkApi)];
    api._addNavigationProperties(linkedApis);
    return api;
  }

  get testEntityLinkApi(): TestEntityLinkApi<DeSerializersT> {
    return this.initApi('testEntityLinkApi', TestEntityLinkApi);
  }

  get functionImports() {
    return {
      concatStrings: (parameter: ConcatStringsParameters<DeSerializersT>) =>
        concatStrings(parameter, this.deSerializers),
      getAll: (parameter: GetAllParameters<DeSerializersT>) =>
        getAll(parameter, this.deSerializers),
      getByKey: (parameter: GetByKeyParameters<DeSerializersT>) =>
        getByKey(parameter, this.deSerializers),
      returnCollection: (
        parameter: ReturnCollectionParameters<DeSerializersT>
      ) => returnCollection(parameter, this.deSerializers),
      returnInt: (parameter: ReturnIntParameters<DeSerializersT>) =>
        returnInt(parameter, this.deSerializers),
      returnSapCloudSdk: (
        parameter: ReturnSapCloudSdkParameters<DeSerializersT>
      ) => returnSapCloudSdk(parameter, this.deSerializers)
    };
  }

  get actionImports() {
    return {
      createTestEntityById: (
        parameter: CreateTestEntityByIdParameters<DeSerializersT>
      ) => createTestEntityById(parameter, this.deSerializers),
      createTestEntityByIdReturnId: (
        parameter: CreateTestEntityByIdReturnIdParameters<DeSerializersT>
      ) => createTestEntityByIdReturnId(parameter, this.deSerializers)
    };
  }

  get batch(): typeof batch {
    return batch;
  }
}