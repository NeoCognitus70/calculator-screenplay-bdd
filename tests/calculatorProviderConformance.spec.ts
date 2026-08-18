/** Runs the provider package's exported semantic cases against both Calculator adapters. */
import { expect, test } from '@playwright/test';
import {
  providerConformanceCases,
  type ConformanceActivity,
  type ConformanceActor,
  type ConformanceEvent,
  type ConformanceMemory,
  type ConformanceProvider,
  type ConformanceQuestion,
  type ConformanceScenario,
  type ConformanceSceneOutcome,
  type ExecutionExtension,
} from 'hand-baked-screenplay-pattern';
import {
  calculatorAbilityToken,
  provideCalculatorAbility,
  type CalculatorActor,
  type CalculatorExecutionExtension,
  type CalculatorLifecycleEvent,
  type CalculatorProfileAbilities,
  type CalculatorScenario,
  type CalculatorScreenplayProvider,
} from './screenplay/calculatorScreenplay.js';
import { providerContractProfile } from './screenplay/providerContractProfile.js';

const ConformanceMemoryToken = calculatorAbilityToken<ConformanceMemory>('memory');

class CalculatorConformanceMemory implements ConformanceMemory {
  private readonly values = new Map<string, unknown>();

  set(key: string, value: unknown): void {
    this.values.set(key, value);
  }

  get<Value>(key: string): Value | undefined {
    return this.values.get(key) as Value | undefined;
  }
}

class CalculatorConformanceActor implements ConformanceActor {
  private readonly missingTokens = new Map<
    string,
    ReturnType<typeof calculatorAbilityToken<object>>
  >();

  constructor(private readonly calculatorActor: CalculatorActor) {}

  get name(): string {
    return this.calculatorActor.name;
  }

  abilityTo<Ability extends object>(name: string): Ability {
    if (name === ConformanceMemoryToken.name) {
      return this.calculatorActor.abilityTo(ConformanceMemoryToken) as Ability;
    }
    let token = this.missingTokens.get(name);
    if (!token) {
      token = calculatorAbilityToken<object>(name);
      this.missingTokens.set(name, token);
    }
    return this.calculatorActor.abilityTo(token) as Ability;
  }

  attemptsTo(...activities: ConformanceActivity[]): Promise<void> {
    return this.calculatorActor.attemptsTo(
      ...activities.map((activity) => ({
        description: activity.description,
        performAs: () => activity.performAs(this),
      })),
    );
  }

  answer<Answer>(question: ConformanceQuestion<Answer>): Promise<Answer> {
    return this.calculatorActor.answer({
      description: question.description,
      answeredBy: () => question.answeredBy(this),
    });
  }
}

class CalculatorConformanceScenario implements ConformanceScenario {
  private readonly actors = new Map<string, CalculatorConformanceActor>();

  constructor(private readonly scenario: CalculatorScenario) {}

  actor(name: string): ConformanceActor {
    let actor = this.actors.get(name);
    if (!actor) {
      actor = new CalculatorConformanceActor(this.scenario.actor(name, 'rest'));
      this.actors.set(name, actor);
    }
    return actor;
  }

  start(extension?: ExecutionExtension): void {
    this.scenario.start(extension);
  }

  finish(outcome: ConformanceSceneOutcome): void {
    const canonical =
      outcome.status === 'success'
        ? { status: 'success' as const }
        : { status: 'failure' as const, error: outcome.error };
    this.scenario.finish(canonical, outcome.extension);
  }

  events(): readonly ConformanceEvent[] {
    return this.scenario.events().map(conformanceEventFrom);
  }
}

class CalculatorConformanceProvider implements ConformanceProvider {
  readonly name: string;

  constructor(private readonly provider: CalculatorScreenplayProvider) {
    this.name = provider.name;
  }

  createScenario(description: string): ConformanceScenario {
    const abilities = conformanceAbilities();
    return new CalculatorConformanceScenario(
      this.provider.createScenario(description, abilities, { lifecycle: 'manual' }),
    );
  }
}

const providers = providerContractProfile.providers.map(
  (entry) => new CalculatorConformanceProvider(entry.create()),
);

for (const provider of providers) {
  test.describe(`${provider.name} Calculator adapter conformance`, () => {
    for (const conformanceCase of providerConformanceCases) {
      test(conformanceCase.name, async () => {
        await expect(conformanceCase.run(provider)).resolves.toBeUndefined();
      });
    }
  });
}

function conformanceAbilities(): CalculatorProfileAbilities {
  const profile = () => [
    provideCalculatorAbility(
      ConformanceMemoryToken,
      () => new CalculatorConformanceMemory(),
    ),
  ];
  return { rest: profile(), browser: profile() };
}

function conformanceEventFrom(event: CalculatorLifecycleEvent): ConformanceEvent {
  switch (event.type) {
    case 'activity:starts':
    case 'activity:finishes':
      return {
        type: event.type,
        actor: event.actor,
        description: event.description,
      };
    case 'activity:fails':
      return {
        type: event.type,
        actor: event.actor,
        description: event.description,
        error: event.error,
      };
    case 'scene:starts':
      return event.extension
        ? {
            type: event.type,
            description: event.description,
            extension: asExecutionExtension(event.extension),
          }
        : { type: event.type, description: event.description };
    case 'scene:finishes': {
      const outcome: ConformanceSceneOutcome =
        event.outcome.status === 'success'
          ? event.extension
            ? {
                status: 'success',
                extension: asExecutionExtension(event.extension),
              }
            : { status: 'success' }
          : event.extension
            ? {
                status: 'failure',
                error: event.outcome.error,
                extension: asExecutionExtension(event.extension),
              }
            : { status: 'failure', error: event.outcome.error };
      return {
        type: event.type,
        description: event.description,
        outcome,
      };
    }
  }
}

function asExecutionExtension(
  extension: CalculatorExecutionExtension,
): ExecutionExtension {
  return extension;
}
