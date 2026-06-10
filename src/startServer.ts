/**
 * Responsibility: start the calculator HTTP server from typed environment
 * configuration.
 *
 * Pedagogical decision: keeping startup tiny makes the application usable from
 * Playwright's webServer hook while preserving testable server construction in
 * `calculatorHttpServer.ts`.
 */
import { createCalculatorServer } from './calculatorHttpServer.js';
import { readCalculatorEnvironment } from './environment.js';

const environment = readCalculatorEnvironment();
const calculatorServer = createCalculatorServer(environment);

await calculatorServer.listen();

console.log(`Calculator running at http://${environment.host}:${environment.port}`);
