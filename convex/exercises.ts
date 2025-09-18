import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getCoachExercises = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db
      .query("exercises")
      .withIndex("by_coach", (q) => q.eq("coachId", userId))
      .collect();
  },
});

export const createExercise = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    muscleGroups: v.array(v.string()),
    equipment: v.array(v.string()),
    instructions: v.array(v.string()),
    cues: v.array(v.string()),
    difficulty: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("exercises", {
      coachId: userId,
      name: args.name,
      description: args.description,
      muscleGroups: args.muscleGroups,
      equipment: args.equipment,
      instructions: args.instructions,
      cues: args.cues,
      difficulty: args.difficulty,
      images: [],
    });
  },
});

export const getCoachWorkouts = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db
      .query("workouts")
      .withIndex("by_coach", (q) => q.eq("coachId", userId))
      .collect();
  },
});

export const createWorkout = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    exercises: v.array(v.object({
      exerciseId: v.id("exercises"),
      sets: v.number(),
      reps: v.optional(v.string()),
      weight: v.optional(v.string()),
      restTime: v.optional(v.string()),
      notes: v.optional(v.string()),
    })),
    estimatedDuration: v.optional(v.number()),
    isTemplate: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("workouts", {
      coachId: userId,
      name: args.name,
      description: args.description,
      exercises: args.exercises,
      estimatedDuration: args.estimatedDuration,
      isTemplate: args.isTemplate,
    });
  },
});

export const getCoachWorkoutSplits = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db
      .query("workoutSplits")
      .withIndex("by_coach", (q) => q.eq("coachId", userId))
      .collect();
  },
});

export const createWorkoutSplit = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    schedule: v.array(v.object({
      day: v.number(),
      workoutId: v.optional(v.id("workouts")),
      isRestDay: v.boolean(),
      notes: v.optional(v.string()),
    })),
    isTemplate: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("workoutSplits", {
      coachId: userId,
      name: args.name,
      description: args.description,
      schedule: args.schedule,
      isTemplate: args.isTemplate,
    });
  },
});
