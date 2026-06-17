# Responsibility: describe calculator REST behavior in examples a stakeholder
# can read without knowing Playwright or HTTP implementation details.
#
# Pedagogical decision: these scenarios sit above API integration tests. They
# prove externally meaningful outcomes while the Screenplay layer keeps the
# automation vocabulary domain-oriented.
#
# Rejection-contract convention: "reject the calculation with ..." denotes a
# *well-formed but unsupported* request -> HTTP 422 Unprocessable Content (e.g.
# division by zero), asserted by Calculate.shouldHaveBeenRejectedAsUnsupported()
# in tests/calculatorTasks.ts. This is deliberately distinct from a *malformed*
# request -> HTTP 400 Bad Request (e.g. an unknown operator or a non-JSON body),
# which the server returns on a separate path (src/calculatorHttpServer.ts). The
# 400 path is covered at the API-integration layer (tests/api.spec.ts), keeping
# the two rejection kinds distinguishable without overloading one Gherkin step.
Feature: Calculator REST API

  Rule: Supported calculations produce a numeric result

    Scenario: Add two numbers through the REST API
      When Ada calculates 7 plus 5 using the REST API
      Then the API result should be 12

  Rule: Valid requests can still be unsupported calculations

    Scenario: Reject division by zero through the REST API
      When Ada calculates 7 divided by 0 using the REST API
      Then the API should reject the calculation with "Division by zero is undefined."
