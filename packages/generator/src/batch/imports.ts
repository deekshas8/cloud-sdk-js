import { ImportDeclarationStructure, StructureKind } from 'ts-morph';
import { unique } from '@sap-cloud-sdk/util';
import { odataImportDeclarationTsMorph } from '../imports';
import { VdmServiceMetadata } from '../vdm-types';

/**
 * @internal
 */
export function importBatchDeclarations(
  service: VdmServiceMetadata
): ImportDeclarationStructure[] {
  return [
    odataImportDeclarationTsMorph(
      [
        'CreateRequestBuilder',
        'DeleteRequestBuilder',
        'DeSerializers',
        'GetAllRequestBuilder',
        'GetByKeyRequestBuilder',
        'ODataBatchRequestBuilder',
        'UpdateRequestBuilder',
        ...(service.functionImports.length
          ? ['FunctionImportRequestBuilder']
          : []),
        ...(service.actionImports?.length
          ? ['ActionImportRequestBuilder']
          : []),
        'BatchChangeSet'
      ],
      service.oDataVersion
    ),
    {
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier: '@sap-cloud-sdk/util',
      namedImports: ['transformVariadicArgumentToArray']
    },
    {
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier: './index',
      namedImports: getNamedImports(service)
    }
  ];
}

function getNamedImports(service: VdmServiceMetadata): string[] {
  const actionsAndFunctions = [
    ...service.functionImports,
    ...(service.actionImports ?? [])
  ];
  const complexReturnTypesOfActionImports = actionsAndFunctions
    .filter(
      ({ returnType }) => returnType.returnTypeCategory === 'complex-type'
    )
    .map(withComplex => withComplex.returnType.returnType);

  return unique([
    ...service.entities.map(e => e.className),
    ...service.functionImports.map(f => f.parametersTypeName),
    ...(service.actionImports?.map(a => a.parametersTypeName) ?? []),
    ...complexReturnTypesOfActionImports
  ]);
}
