import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getCoachMeals = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db
      .query("meals")
      .withIndex("by_coach", (q) => q.eq("coachId", userId))
      .collect();
  },
});

export const createMeal = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    ingredients: v.array(v.object({
      name: v.string(),
      amount: v.string(),
      unit: v.string(),
    })),
    instructions: v.array(v.string()),
    macros: v.object({
      calories: v.number(),
      protein: v.number(),
      carbs: v.number(),
      fat: v.number(),
    }),
    prepTime: v.optional(v.number()),
    cookTime: v.optional(v.number()),
    servings: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("meals", {
      coachId: userId,
      name: args.name,
      description: args.description,
      ingredients: args.ingredients,
      instructions: args.instructions,
      macros: args.macros,
      images: [],
      prepTime: args.prepTime,
      cookTime: args.cookTime,
      servings: args.servings,
    });
  },
});

export const getCoachMealPlans = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db
      .query("mealPlans")
      .withIndex("by_coach", (q) => q.eq("coachId", userId))
      .collect();
  },
});

export const createMealPlan = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    meals: v.array(v.object({
      mealId: v.id("meals"),
      mealType: v.union(v.literal("breakfast"), v.literal("lunch"), v.literal("dinner"), v.literal("snack")),
      servings: v.number(),
    })),
    totalMacros: v.object({
      calories: v.number(),
      protein: v.number(),
      carbs: v.number(),
      fat: v.number(),
    }),
    isTemplate: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("mealPlans", {
      coachId: userId,
      name: args.name,
      description: args.description,
      meals: args.meals,
      totalMacros: args.totalMacros,
      isTemplate: args.isTemplate,
    });
  },
});
