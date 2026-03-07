/**
 * Main entry-point for Vitest test setup.
 *
 * Vitest imports this before each test file (i.e. importing this file has the side effect
 * of setting up the tests).
 */

import { resetAll, setDefaults, verifyAll } from "strong-mock"
import { afterEach, expect } from "vitest"

import { MapMatchers } from "./matchers/mapMatchers"
import { SetMatchers } from "./matchers/setMatchers"
import { TableEqualityTester } from "./testers/tableEqualityTester"
import { TextEqualityTester } from "./testers/textEqualityTester"

/**
 * Runs for each test file.
 */
export function initialize(): void {
  initializeMockingConfig()
  initializeMatchers()
  initializeTesters()
  initializeMocking()
}

/**
 * Increases strictness of `strong-mock` mocks.
 */
const initializeMockingConfig = function (): void {
  setDefaults({ exactParams: true })
}

/**
 * Adds additional matchers.
 */
const initializeMatchers = function (): void {
  expect.extend(MapMatchers)
  expect.extend(SetMatchers)
}

/**
 * Adds additional testers.
 */
const initializeTesters = function (): void {
  expect.addEqualityTesters([TableEqualityTester, TextEqualityTester])
}

/**
 * Verifies and resets all mocks after each test, allowing for mock re-use and brevity.
 */
const initializeMocking = function (): void {
  afterEach(() => {
    verifyAll()
    resetAll()
  })
}

// Setup side effect
initialize()
