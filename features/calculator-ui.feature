# Responsibility: describe user-visible calculator behavior in Gherkin.
#
# Pedagogical decision: the UI scenarios are intentionally few. The test
# pyramid keeps broad arithmetic coverage in unit and API tests while BDD checks
# that the browser workflow represents the product behavior correctly.
Feature: Calculator browser interface

  Rule: Users can calculate from the browser

    Scenario: Multiply two numbers in the browser
      When Ada calculates 8 times 6 using the browser interface
      Then the displayed result should be "8 * 6 = 48"

    Scenario: See an explanation when dividing by zero
      When Ada calculates 8 divided by 0 using the browser interface
      Then the displayed error should include "Division by zero is undefined."
