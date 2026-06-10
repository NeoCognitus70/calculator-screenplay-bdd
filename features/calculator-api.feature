# Responsibility: describe calculator REST behavior in examples a stakeholder
# can read without knowing Playwright or HTTP implementation details.
#
# Pedagogical decision: these scenarios sit above API integration tests. They
# prove externally meaningful outcomes while the Screenplay layer keeps the
# automation vocabulary domain-oriented.
Feature: Calculator REST API

  Rule: Supported calculations produce a numeric result

    Scenario: Add two numbers through the REST API
      When Ada calculates 7 plus 5 using the REST API
      Then the API result should be 12

  Rule: Valid requests can still be unsupported calculations

    Scenario: Reject division by zero through the REST API
      When Ada calculates 7 divided by 0 using the REST API
      Then the API should reject the calculation with "Division by zero is undefined."
