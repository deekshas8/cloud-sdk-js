import { createLogger } from '@sap-cloud-sdk/util';
import * as asyncRetry from 'async-retry';
import {
  MiddlewareContext,
  Middleware,
  MiddlewareOptions,
  MiddlewareFunction
} from './middleware';

const logger = createLogger({
  package: 'resilience',
  messageContext: 'retry'
});

const defaultRetries = 3;

/**
 * Helper method to build a retry middleware.
 * @param retries - Number of retry attempts. Default value is 3.
 * @returns The middleware adding a retry to the function.
 */
export function retry<
  ArgumentType,
  ReturnType,
  ContextType extends MiddlewareContext<ArgumentType>
>(
  retries: number = defaultRetries
): Middleware<ArgumentType, ReturnType, ContextType> {
  if (retries < 0) {
    throw new Error('Number of retries must be greater or equal to 0.');
  }

  return function (
    options: MiddlewareOptions<ArgumentType, ReturnType, ContextType>
  ): MiddlewareFunction<ArgumentType, ReturnType> {
    return arg =>
      asyncRetry.default(
        async bail => {
          try {
            return await options.fn(arg);
          } catch (error) {
            // Don't retry on error statuses where a second attempt won't help
            const status = error?.response?.status;
            console.log(`HTTP Status Code is: ${status}`);
            if (!status) {
              console.log(
                'HTTP request failed but error did not contain a response status field as expected. Rethrowing error.'
              );
            }
            if (status.toString().startsWith('4')) {
              console.log(`Inside toString().startsWith('4'): ${status}`);
              bail(new Error(`Request failed with status code ${status}`));
              // We need to return something here but the actual value does not matter
              return undefined as ReturnType;
            }
            console.log(`Outside toString().startsWith('4'): ${status}`);
            throw error;
          }
        },
        { retries }
      );
  };
}
