import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getCoachPricingPlans = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db
      .query("pricingPlans")
      .withIndex("by_coach", (q) => q.eq("coachId", userId))
      .collect();
  },
});

export const createPricingPlan = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    billingPeriod: v.union(v.literal("weekly"), v.literal("monthly"), v.literal("yearly")),
    features: v.array(v.string()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("pricingPlans", {
      coachId: userId,
      name: args.name,
      description: args.description,
      price: args.price,
      billingPeriod: args.billingPeriod,
      features: args.features,
      isActive: args.isActive,
    });
  },
});
