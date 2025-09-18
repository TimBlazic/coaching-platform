/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as clients from "../clients.js";
import type * as exercises from "../exercises.js";
import type * as forms from "../forms.js";
import type * as http from "../http.js";
import type * as meals from "../meals.js";
import type * as pricingPlans from "../pricingPlans.js";
import type * as publicPages from "../publicPages.js";
import type * as router from "../router.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  clients: typeof clients;
  exercises: typeof exercises;
  forms: typeof forms;
  http: typeof http;
  meals: typeof meals;
  pricingPlans: typeof pricingPlans;
  publicPages: typeof publicPages;
  router: typeof router;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
