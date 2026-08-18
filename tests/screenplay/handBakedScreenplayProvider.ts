/** Adapts Calculator's provider-neutral contracts to hand-baked v0.3.0. */
import {
  AbilityToken as HandBakedAbilityToken,
  Cast,
  Interaction,
  Outcome,
  Stage,
  type Actor as HandBakedActor,
} from 'hand-baked-screenplay-pattern';
import type {
  CalculatorAbilityToken,
  CalculatorActivity,
  CalculatorActor,
  CalculatorAnswerable,
  CalculatorProfileAbilities,
  CalculatorProviderProfile,
  CalculatorQuestion,
  CalculatorScenario,
  CalculatorSceneOutcome,
  CalculatorScreenplayProvider,
} from './calculatorScreenplay.js';

class HandBakedActorAdapter implements CalculatorActor {
  constructor(
    private readonly nativeActor: HandBakedActor,
    private readonly nativeTokenFor: <Ability extends object>(
      token: CalculatorAbilityToken<Ability>,
    ) => HandBakedAbilityToken<Ability>,
  ) {}

  get name(): string {
    return this.nativeActor.name;
  }

  abilityTo<Ability extends object>(token: CalculatorAbilityToken<Ability>): Ability {
    return this.nativeActor.abilityTo(this.nativeTokenFor(token));
  }

  async attemptsTo(...activities: CalculatorActivity[]): Promise<void> {
    await this.nativeActor.attemptsTo(
      ...activities.map((candidate) =>
        Interaction.where(candidate.description, async () => {
          await candidate.performAs(this);
        }),
      ),
    );
  }

  async answer<Answer>(answerable: CalculatorAnswerable<Answer>): Promise<Answer> {
    if (isCalculatorQuestion(answerable)) {
      return this.nativeActor.answer({
        answeredBy: () => answerable.answeredBy(this),
        toString: () => answerable.description,
      });
    }
    return answerable;
  }
}

class HandBakedScenarioAdapter implements CalculatorScenario {
  readonly providerName: string;
  private readonly tokens = new Map<
    CalculatorAbilityToken<object>,
    HandBakedAbilityToken<object>
  >();
  private readonly actors = new Map<string, HandBakedActorAdapter>();
  private profile: CalculatorProviderProfile | undefined;
  private stage: Stage | undefined;
  private finished = false;

  constructor(
    providerName: string,
    private readonly description: string,
    private readonly abilities: CalculatorProfileAbilities,
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
    if (!this.stage) {
      this.profile = profile;
      this.stage = this.createStage(profile);
      this.stage.sceneStarts(this.description);
    }

    let actor = this.actors.get(name);
    if (!actor) {
      actor = new HandBakedActorAdapter(
        this.stage.actor(name),
        <Ability extends object>(token: CalculatorAbilityToken<Ability>) =>
          this.nativeTokenFor(token),
      );
      this.actors.set(name, actor);
    }
    return actor;
  }

  finish(outcome: CalculatorSceneOutcome): void {
    if (this.finished || !this.stage) return;
    this.finished = true;
    this.stage.sceneFinishes(
      this.description,
      outcome.status === 'success' ? Outcome.successful() : Outcome.from(outcome.error),
    );
  }

  private createStage(profile: CalculatorProviderProfile): Stage {
    return new Stage(
      Cast.whereEachActorCan(() =>
        this.abilities[profile].map((ability) =>
          this.nativeTokenFor(ability.token).bind(ability.create()),
        ),
      ),
    );
  }

  private nativeTokenFor<Ability extends object>(
    token: CalculatorAbilityToken<Ability>,
  ): HandBakedAbilityToken<Ability> {
    let nativeToken = this.tokens.get(token as unknown as CalculatorAbilityToken<object>);
    if (!nativeToken) {
      nativeToken = HandBakedAbilityToken.named<object>(token.name);
      this.tokens.set(token as unknown as CalculatorAbilityToken<object>, nativeToken);
    }
    return nativeToken as HandBakedAbilityToken<Ability>;
  }
}

export class HandBakedScreenplayProvider implements CalculatorScreenplayProvider {
  readonly name = 'hand-baked-v0.3.0';

  createScenario(
    description: string,
    abilities: CalculatorProfileAbilities,
  ): CalculatorScenario {
    return new HandBakedScenarioAdapter(this.name, description, abilities);
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
