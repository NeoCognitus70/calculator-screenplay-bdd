/**
 * Deliberately small, independent Promise-native Calculator provider.
 *
 * It imports only Calculator-owned contracts: no hand-baked runtime classes,
 * Playwright runtime, reporter, Stage, Actor, Task or Question implementation.
 */
import type {
  CalculatorAbilityToken,
  CalculatorActivity,
  CalculatorActor,
  CalculatorAnswerable,
  CalculatorExecutionExtension,
  CalculatorLifecycleEvent,
  CalculatorProfileAbilities,
  CalculatorProviderProfile,
  CalculatorQuestion,
  CalculatorScenario,
  CalculatorScenarioOptions,
  CalculatorSceneOutcome,
  CalculatorScreenplayProvider,
} from './calculatorScreenplay.js';

type PromiseNativeEvent =
  | {
      readonly kind: 'activityStarted' | 'activityFinished';
      readonly actorName: string;
      readonly activityDescription: string;
    }
  | {
      readonly kind: 'activityFailed';
      readonly actorName: string;
      readonly activityDescription: string;
      readonly cause: Error;
    }
  | {
      readonly kind: 'scenarioStarted';
      readonly scenarioDescription: string;
      readonly extension?: CalculatorExecutionExtension;
    }
  | {
      readonly kind: 'scenarioFinished';
      readonly scenarioDescription: string;
      readonly outcome: CalculatorSceneOutcome;
      readonly extension?: CalculatorExecutionExtension;
    };

class PromiseNativeActor implements CalculatorActor {
  private readonly abilities = new Map<CalculatorAbilityToken<object>, object>();

  constructor(
    readonly name: string,
    providers: CalculatorProfileAbilities[CalculatorProviderProfile],
    private readonly scenario: PromiseNativeScenario,
  ) {
    for (const provider of providers) {
      this.abilities.set(provider.token, provider.create());
    }
  }

  abilityTo<Ability extends object>(token: CalculatorAbilityToken<Ability>): Ability {
    const ability = this.abilities.get(
      token as unknown as CalculatorAbilityToken<object>,
    );
    if (!ability) {
      throw new Error(`${this.name} is missing the ability to ${token.name}.`);
    }
    return ability as Ability;
  }

  async attemptsTo(...activities: CalculatorActivity[]): Promise<void> {
    for (const activity of activities) {
      this.scenario.record({
        kind: 'activityStarted',
        actorName: this.name,
        activityDescription: activity.description,
      });
      try {
        await activity.performAs(this);
        this.scenario.record({
          kind: 'activityFinished',
          actorName: this.name,
          activityDescription: activity.description,
        });
      } catch (error) {
        this.scenario.record({
          kind: 'activityFailed',
          actorName: this.name,
          activityDescription: activity.description,
          cause: asError(error),
        });
        throw error;
      }
    }
  }

  async answer<Answer>(answerable: CalculatorAnswerable<Answer>): Promise<Answer> {
    return isCalculatorQuestion(answerable)
      ? answerable.answeredBy(this)
      : answerable;
  }
}

class PromiseNativeScenario implements CalculatorScenario {
  readonly providerName: string;
  private readonly actors = new Map<string, PromiseNativeActor>();
  private readonly nativeEvents: PromiseNativeEvent[] = [];
  private profile: CalculatorProviderProfile | undefined;
  private started = false;
  private finished = false;

  constructor(
    providerName: string,
    private readonly description: string,
    private readonly abilities: CalculatorProfileAbilities,
    private readonly lifecycle: 'automatic' | 'manual',
  ) {
    this.providerName = providerName;
  }

  actor(name: string, profile: CalculatorProviderProfile): CalculatorActor {
    if (this.finished) {
      throw new Error(`Calculator scenario '${this.description}' has already finished.`);
    }
    if (this.profile && this.profile !== profile) {
      throw new Error(
        `Calculator scenario '${this.description}' already uses the ${this.profile} profile; ` +
          `native provider objects cannot be mixed with ${profile}.`,
      );
    }
    this.profile = profile;
    if (this.lifecycle === 'automatic') this.start();

    let actor = this.actors.get(name);
    if (!actor) {
      actor = new PromiseNativeActor(name, this.abilities[profile], this);
      this.actors.set(name, actor);
    }
    return actor;
  }

  start(extension?: CalculatorExecutionExtension): void {
    if (this.started) return;
    this.started = true;
    this.record(
      extension
        ? {
            kind: 'scenarioStarted',
            scenarioDescription: this.description,
            extension,
          }
        : { kind: 'scenarioStarted', scenarioDescription: this.description },
    );
  }

  finish(
    outcome: CalculatorSceneOutcome,
    extension?: CalculatorExecutionExtension,
  ): void {
    if (this.finished) return;
    if (!this.started) this.start();
    this.finished = true;
    this.record(
      extension
        ? {
            kind: 'scenarioFinished',
            scenarioDescription: this.description,
            outcome,
            extension,
          }
        : {
            kind: 'scenarioFinished',
            scenarioDescription: this.description,
            outcome,
          },
    );
  }

  events(): readonly CalculatorLifecycleEvent[] {
    return this.nativeEvents.map(calculatorEventFrom);
  }

  record(event: PromiseNativeEvent): void {
    this.nativeEvents.push(event);
  }
}

export class PromiseNativeScreenplayProvider implements CalculatorScreenplayProvider {
  readonly name = 'calculator-promise-native';

  createScenario(
    description: string,
    abilities: CalculatorProfileAbilities,
    options: CalculatorScenarioOptions = {},
  ): CalculatorScenario {
    return new PromiseNativeScenario(
      this.name,
      description,
      abilities,
      options.lifecycle ?? 'automatic',
    );
  }
}

function calculatorEventFrom(event: PromiseNativeEvent): CalculatorLifecycleEvent {
  switch (event.kind) {
    case 'activityStarted':
      return {
        type: 'activity:starts',
        actor: event.actorName,
        description: event.activityDescription,
      };
    case 'activityFinished':
      return {
        type: 'activity:finishes',
        actor: event.actorName,
        description: event.activityDescription,
      };
    case 'activityFailed':
      return {
        type: 'activity:fails',
        actor: event.actorName,
        description: event.activityDescription,
        error: event.cause,
      };
    case 'scenarioStarted':
      return event.extension
        ? {
            type: 'scene:starts',
            description: event.scenarioDescription,
            extension: event.extension,
          }
        : { type: 'scene:starts', description: event.scenarioDescription };
    case 'scenarioFinished':
      return event.extension
        ? {
            type: 'scene:finishes',
            description: event.scenarioDescription,
            outcome: event.outcome,
            extension: event.extension,
          }
        : {
            type: 'scene:finishes',
            description: event.scenarioDescription,
            outcome: event.outcome,
          };
  }
}

function isCalculatorQuestion<Answer>(
  answerable: CalculatorAnswerable<Answer>,
): answerable is CalculatorQuestion<Answer> {
  return (
    typeof answerable === 'object' &&
    answerable !== null &&
    'description' in answerable &&
    'answeredBy' in answerable
  );
}

function asError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}
