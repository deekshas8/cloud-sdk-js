# Local E2E Tests

## Status

proposed

## Context

Currently, we do the following for our E2E tests:

- Create a application containing test code
- Create a space on CF with everything e.g. approuter, services
- Deploy the application
- Create subscription to application in separate CF account
- Cypress is triggering application endpoints which execute the actual test
- Http response is evaluated success/failed

This approach has many problems:

- In the application logs all tests are cluttered together
- The feedback cycle is super long: adjust the application code, deploy it, call endpoints
- The application is based on templates (v1,v2,...) which is error-prone because no static code check in IDE
- Debugging is almost impossible because we do not ship the type mappings
- The various external systems lead to flaky tests so quick re-execution is key
- If developers want to investigate/adjust test a own deployment is needed to avoid side effects

## Decision

The application and full deployment adds not much value and adds time and indirection.
We will restructure the E2E:

- Application and infrastructure is just a entry-point:
  - provides VCAP_SERVICES (destination, xsuaa, connectivity)
  - provides SSH tunnel to on-premise proxy (connectivity)
  - provides JWT (approuter,xsuaa)
- Tests are executed `locally` using the util methods investigated [here](https://github.tools.sap/cloudsdk/sdk-js/pull/155/files) and [jest runner](https://jestjs.io/).
- Application contains limited `smoke` test to get a few business parnter from a on-premise system to ensure our E2E value preposition
- SDK in the Forntend is not really supported anyhow and tests are not executed for the time being.

### Details

- **JS Space** We will have a stable space with the entry-point application running in it.
- **Deploy Script** The old deploy script will remain to rebuild the whole landscape or deploy the application alone.
  In case a developer needs a private space, this can also be used as well.
- **Utils** will: receive JWTs, open SSH tunnels and receive the VCAP_SERVICE variables.
- **Sanity Util** will run in the `before step` of tests and check: Can I open the tunnel, Can I get the JWT, ... and give good hints in case of errors.
- **Test Package v2 canary** This package contains tests checking all authentication flows for provider/subscribe scenarios.
  Use the `executeHttpRequest` method to retrieve data E2E and avoid client generation (tested in OS).
  This ensures we do not break something by a new release.
- **Test Packages v1/v2 latest** This package contains a few tests provider/subscriber cloud, onPrem to ensure nothing is broken for customers
  This ensures everything is working. Number of tests is small and use published clients from npm.
- **Smoke Test** Single test provided by the deployed application testing provider cloud/onPrem triggered via an endpoint.

## Consequences

The test execution time in the pipeline is highly reduced as well as the overview which tests fail.
If tests fail consistency and the logs are not conclusive, local investigation can start directly and changes take imediate effect.
