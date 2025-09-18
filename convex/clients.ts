import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getCoachClients = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db
      .query("clients")
      .withIndex("by_coach", (q) => q.eq("coachId", userId))
      .collect();
  },
});

export const getClient = query({
  args: { clientId: v.id("clients") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const client = await ctx.db.get(args.clientId);
    if (!client || client.coachId !== userId) {
      return null;
    }

    return client;
  },
});

export const createClient = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    goals: v.array(v.string()),
    notes: v.optional(v.string()),
    monthlyRate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("clients", {
      coachId: userId,
      name: args.name,
      email: args.email,
      phone: args.phone,
      status: "active",
      startDate: Date.now(),
      goals: args.goals,
      notes: args.notes,
      paymentStatus: "pending",
      monthlyRate: args.monthlyRate,
    });
  },
});

export const updateClient = mutation({
  args: {
    clientId: v.id("clients"),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"), v.literal("paused"))),
    paymentStatus: v.optional(v.union(v.literal("paid"), v.literal("pending"), v.literal("overdue"))),
    currentWorkoutSplit: v.optional(v.id("workoutSplits")),
    currentMealPlan: v.optional(v.id("mealPlans")),
    currentPricingPlan: v.optional(v.id("pricingPlans")),
    monthlyRate: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const client = await ctx.db.get(args.clientId);
    if (!client || client.coachId !== userId) {
      throw new Error("Client not found or access denied");
    }

    const updates: any = {};
    if (args.status !== undefined) updates.status = args.status;
    if (args.paymentStatus !== undefined) updates.paymentStatus = args.paymentStatus;
    if (args.currentWorkoutSplit !== undefined) updates.currentWorkoutSplit = args.currentWorkoutSplit;
    if (args.currentMealPlan !== undefined) updates.currentMealPlan = args.currentMealPlan;
    if (args.currentPricingPlan !== undefined) updates.currentPricingPlan = args.currentPricingPlan;
    if (args.monthlyRate !== undefined) updates.monthlyRate = args.monthlyRate;
    if (args.notes !== undefined) updates.notes = args.notes;

    await ctx.db.patch(args.clientId, updates);
  },
});

export const getClientProgress = query({
  args: { clientId: v.id("clients") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const client = await ctx.db.get(args.clientId);
    if (!client || client.coachId !== userId) {
      return [];
    }

    return await ctx.db
      .query("clientProgress")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .order("desc")
      .collect();
  },
});

export const addClientProgress = mutation({
  args: {
    clientId: v.id("clients"),
    weight: v.optional(v.number()),
    bodyFat: v.optional(v.number()),
    measurements: v.optional(v.object({
      chest: v.optional(v.number()),
      waist: v.optional(v.number()),
      hips: v.optional(v.number()),
      arms: v.optional(v.number()),
      thighs: v.optional(v.number()),
    })),
    photos: v.array(v.id("_storage")),
    notes: v.optional(v.string()),
    mood: v.optional(v.number()),
    energy: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const client = await ctx.db.get(args.clientId);
    if (!client || client.coachId !== userId) {
      throw new Error("Client not found or access denied");
    }

    return await ctx.db.insert("clientProgress", {
      clientId: args.clientId,
      date: Date.now(),
      weight: args.weight,
      bodyFat: args.bodyFat,
      measurements: args.measurements,
      photos: args.photos,
      notes: args.notes,
      mood: args.mood,
      energy: args.energy,
    });
  },
});
