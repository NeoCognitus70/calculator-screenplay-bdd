/**
 * Calculator-owned Screenplay contracts and domain-neutral building blocks.
 *
 * Domain Tasks, Questions and interactions depend on this seam rather than a
 * concrete provider. Provider adapters translate these structural contracts
 * to their native Actor, Activity, Question and lifecycle objects.
 */

const abilityType = Symbol('calculator-screenplay-ability-type');

export interface CalculatorAbilityToken<Ability extends object> {
  readonly name: string;
  readonly [abilityType]: (ability: Ability) => Ability;
}

export interface CalculatorAbilityProvider {
  readonly token: CalculatorAbilityToken<object>;
  create(): object;
}

export interface CalculatorActivity {
  readonly description: string;
  performAs(actor: CalculatorActor): Promise<void> | void;
}

export interface CalculatorQuestion<Answer> {
  readonly description: string;
  answeredBy(actor: CalculatorActor): Promise<Answer> | Answer;
}

export type CalculatorAnswerable<Answer> =
  | CalculatorQuestion<Answer>
  | Promise<Answer>
  | Answer;

export interface CalculatorActor {
  readonly name: string;
  abilityTo<Ability extends object>(token: CalculatorAbilityToken<Ability>): Ability;
  attemptsTo(...activities: CalculatorActivity[]): Promise<void>;
  answer<Answer>(answerable: CalculatorAnswerable<Answer>): Promise<Answer>;
}

export type CalculatorProviderProfile = 'rest' | 'browser';

export type CalculatorSceneOutcome =
  | { readonly status: 'success' }
  | { readonly status: 'failure'; readonly error: Error };

export interface CalculatorScenario {
  readonly providerName: string;
  actor(name: string, profile: CalculatorProviderProfile): CalculatorActor;
  finish(outcome: CalculatorSceneOutcome): void;
}

export type CalculatorProfileAbilities = Readonly<
  Record<CalculatorProviderProfile, readonly CalculatorAbilityProvider[]>
>;

export interface CalculatorScreenplayProvider {
  readonly name: string;
  createScenario(
    description: string,
    abilities: CalculatorProfileAbilities,
  ): CalculatorScenario;
}

export function calculatorAbilityToken<Ability extends object>(
  name: string,
): CalculatorAbilityToken<Ability> {
  return {
    name,
    [abilityType]: (ability: Ability) => ability,
  };
}

export function provideCalculatorAbility<Ability extends object>(
  token: CalculatorAbilityToken<Ability>,
  create: () => Ability,
): CalculatorAbilityProvider {
  return {
    token: token as unknown as CalculatorAbilityToken<object>,
    create,
  };
}

export function task(
  description: string,
  ...activities: CalculatorActivity[]
): CalculatorActivity {
  return activity(description, async (actor) => {
    await actor.attemptsTo(...activities);
  });
}

export function interaction(
  description: string,
  body: (actor: CalculatorActor) => Promise<void> | void,
): CalculatorActivity {
  return activity(description, body);
}

export function question<Answer>(
  description: string,
  body: (actor: CalculatorActor) => Promise<Answer> | Answer,
): CalculatorQuestion<Answer> {
  return { description, answeredBy: body };
}

export interface CalculatorExpectation<Actual> {
  readonly description: string;
  isMetFor(actual: Actual): boolean;
}

export function ensure<Actual>(
  actual: CalculatorAnswerable<Actual>,
  expectation: CalculatorExpectation<Actual>,
): CalculatorActivity {
  return interaction(
    `#actor ensures that the value does ${expectation.description}`,
    async (actor) => {
      const resolved = await actor.answer(actual);
      if (!expectation.isMetFor(resolved)) {
        throw new CalculatorAssertionError(
          `Expected ${format(resolved)} to ${expectation.description}`,
        );
      }
    },
  );
}

export function equals<Actual>(expected: Actual): CalculatorExpectation<Actual> {
  return {
    description: `equal ${format(expected)}`,
    isMetFor: (actual) => deepEqual(actual, expected),
  };
}

export function includes<Item>(
  expected: Item,
): CalculatorExpectation<string | readonly Item[]> {
  return {
    description: `include ${format(expected)}`,
    isMetFor: (actual) =>
      typeof actual === 'string'
        ? actual.includes(String(expected))
        : actual.includes(expected),
  };
}

export type CalculatorHttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS';

export interface CalculatorHttpRequest {
  readonly method: CalculatorHttpMethod;
  readonly url: string;
  readonly headers?: Readonly<Record<string, string>>;
  readonly body?: unknown;
}

export interface CalculatorHttpResponse<Body = unknown> {
  readonly status: number;
  readonly headers: Readonly<Record<string, string>>;
  readonly body: Body;
}

export interface CalculatorHttpClient {
  send(request: CalculatorHttpRequest): Promise<CalculatorHttpResponse>;
}

interface RequestAbility {
  send(request: CalculatorHttpRequest): Promise<CalculatorHttpResponse>;
  mostRecentResponse(): CalculatorHttpResponse;
}

interface MemoryAbility {
  set(name: string, value: unknown): void;
  get<Stored>(name: string): Stored | undefined;
}

const Requests = calculatorAbilityToken<RequestAbility>('make Calculator HTTP requests');
const Memory = calculatorAbilityToken<MemoryAbility>('use Calculator scenario memory');

export function requestAbilityProvider(
  client: CalculatorHttpClient,
): CalculatorAbilityProvider {
  return provideCalculatorAbility(Requests, () => new CalculatorRequests(client));
}

export function memoryAbilityProvider(): CalculatorAbilityProvider {
  return provideCalculatorAbility(Memory, () => new CalculatorMemory());
}

export function send(
  request: CalculatorAnswerable<CalculatorHttpRequest>,
): CalculatorActivity {
  const description = isHttpRequest(request)
    ? `#actor sends a ${request.method} request to ${request.url}`
    : '#actor sends an HTTP request';

  return interaction(description, async (actor) => {
    const resolved = await actor.answer(request);
    await actor.abilityTo(Requests).send(resolved);
  });
}

export function lastResponseStatus(): CalculatorQuestion<number> {
  return question(
    'the status of the last response',
    (actor) => actor.abilityTo(Requests).mostRecentResponse().status,
  );
}

export function lastResponseBody<Body = unknown>(): CalculatorQuestion<Body> {
  return question(
    'the body of the last response',
    (actor) => actor.abilityTo(Requests).mostRecentResponse().body as Body,
  );
}

export function remember(
  name: string,
  value: CalculatorAnswerable<unknown>,
): CalculatorActivity {
  return interaction(`#actor remembers '${name}'`, async (actor) => {
    actor.abilityTo(Memory).set(name, await actor.answer(value));
  });
}

export function recall<Stored = unknown>(name: string): CalculatorQuestion<Stored> {
  return question(
    `what is remembered about '${name}'`,
    (actor) => actor.abilityTo(Memory).get<Stored>(name) as Stored,
  );
}

class CalculatorRequests implements RequestAbility {
  private lastResponse: CalculatorHttpResponse | undefined;

  constructor(private readonly client: CalculatorHttpClient) {}

  async send(request: CalculatorHttpRequest): Promise<CalculatorHttpResponse> {
    this.lastResponse = await this.client.send(request);
    return this.lastResponse;
  }

  mostRecentResponse(): CalculatorHttpResponse {
    if (!this.lastResponse) {
      throw new Error(
        'No response is available yet. Make sure the actor has sent a request first.',
      );
    }
    return this.lastResponse;
  }
}

class CalculatorMemory implements MemoryAbility {
  private readonly values = new Map<string, unknown>();

  set(name: string, value: unknown): void {
    this.values.set(name, value);
  }

  get<Stored>(name: string): Stored | undefined {
    return this.values.get(name) as Stored | undefined;
  }
}

class CalculatorAssertionError extends Error {
  override readonly name = 'CalculatorAssertionError';
}

function activity(
  description: string,
  body: (actor: CalculatorActor) => Promise<void> | void,
): CalculatorActivity {
  return { description, performAs: body };
}

function isHttpRequest(
  request: CalculatorAnswerable<CalculatorHttpRequest>,
): request is CalculatorHttpRequest {
  return (
    typeof request === 'object' &&
    request !== null &&
    'method' in request &&
    'url' in request
  );
}

function format(value: unknown): string {
  if (typeof value === 'string') return `'${value}'`;
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

function deepEqual(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true;
  if (left instanceof Date && right instanceof Date) {
    return left.getTime() === right.getTime();
  }
  if (
    typeof left !== 'object' ||
    typeof right !== 'object' ||
    left === null ||
    right === null
  ) {
    return false;
  }
  if (Array.isArray(left) || Array.isArray(right)) {
    return (
      Array.isArray(left) &&
      Array.isArray(right) &&
      left.length === right.length &&
      left.every((item, index) => deepEqual(item, right[index]))
    );
  }

  const leftRecord = left as Record<string, unknown>;
  const rightRecord = right as Record<string, unknown>;
  const leftKeys = Object.keys(leftRecord);
  const rightKeys = Object.keys(rightRecord);
  return (
    leftKeys.length === rightKeys.length &&
    leftKeys.every(
      (key) =>
        Object.prototype.hasOwnProperty.call(rightRecord, key) &&
        deepEqual(leftRecord[key], rightRecord[key]),
    )
  );
}
