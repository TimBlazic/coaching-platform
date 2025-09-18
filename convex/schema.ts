import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  // Forms
  forms: defineTable({
    coachId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    fields: v.array(
      v.object({
        id: v.string(),
        type: v.union(
          v.literal("text"),
          v.literal("textarea"),
          v.literal("select"),
          v.literal("radio"),
          v.literal("checkbox"),
          v.literal("file")
        ),
        label: v.string(),
        required: v.boolean(),
        options: v.optional(v.array(v.string())),
        placeholder: v.optional(v.string()),
      })
    ),
    isActive: v.boolean(),
  }).index("by_coach", ["coachId"]),

  formSubmissions: defineTable({
    formId: v.id("forms"),
    responses: v.record(v.string(), v.string()), // Dynamic responses based on form fields
    submitterEmail: v.optional(v.string()),
    submitterName: v.optional(v.string()),
    status: v.union(
      v.literal("new"),
      v.literal("contacted"),
      v.literal("converted"),
      v.literal("cancelled")
    ),
    notes: v.optional(v.string()),
  }).index("by_form", ["formId"]),

  // Public Pages
  publicPages: defineTable({
    coachId: v.id("users"),
    slug: v.string(),
    title: v.string(),
    theme: v.string(),
    primaryColor: v.string(),
    logo: v.optional(v.id("_storage")),
    heroTitle: v.string(),
    heroSubtitle: v.string(),
    aboutText: v.string(),
    testimonials: v.array(
      v.object({
        name: v.string(),
        text: v.string(),
        image: v.optional(v.id("_storage")),
      })
    ),
    clientImages: v.array(v.id("_storage")),
    contactEmail: v.string(),
    isActive: v.boolean(),
  })
    .index("by_coach", ["coachId"])
    .index("by_slug", ["slug"]),

  // Pricing Plans
  pricingPlans: defineTable({
    coachId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    billingPeriod: v.union(
      v.literal("weekly"),
      v.literal("monthly"),
      v.literal("yearly")
    ),
    features: v.array(v.string()),
    isActive: v.boolean(),
  }).index("by_coach", ["coachId"]),

  // Exercises
  exercises: defineTable({
    coachId: v.id("users"),
    name: v.string(),
    description: v.string(),
    muscleGroups: v.array(v.string()),
    equipment: v.array(v.string()),
    instructions: v.array(v.string()),
    cues: v.array(v.string()),
    video: v.optional(v.id("_storage")),
    images: v.array(v.id("_storage")),
    difficulty: v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced")
    ),
  }).index("by_coach", ["coachId"]),

  // Workouts
  workouts: defineTable({
    coachId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    exercises: v.array(
      v.object({
        exerciseId: v.id("exercises"),
        sets: v.number(),
        reps: v.optional(v.string()), // Can be "8-12" or "AMRAP"
        weight: v.optional(v.string()),
        restTime: v.optional(v.string()),
        notes: v.optional(v.string()),
      })
    ),
    estimatedDuration: v.optional(v.number()), // in minutes
    isTemplate: v.boolean(),
  }).index("by_coach", ["coachId"]),

  // Workout Splits
  workoutSplits: defineTable({
    coachId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    schedule: v.array(
      v.object({
        day: v.number(), // 0-6 (Sunday-Saturday)
        workoutId: v.optional(v.id("workouts")),
        isRestDay: v.boolean(),
        notes: v.optional(v.string()),
      })
    ),
    isTemplate: v.boolean(),
  }).index("by_coach", ["coachId"]),

  // Meals
  meals: defineTable({
    coachId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    ingredients: v.array(
      v.object({
        name: v.string(),
        amount: v.string(),
        unit: v.string(),
      })
    ),
    instructions: v.array(v.string()),
    macros: v.object({
      calories: v.number(),
      protein: v.number(),
      carbs: v.number(),
      fat: v.number(),
    }),
    images: v.array(v.id("_storage")),
    prepTime: v.optional(v.number()), // in minutes
    cookTime: v.optional(v.number()), // in minutes
    servings: v.number(),
  }).index("by_coach", ["coachId"]),

  // Meal Plans
  mealPlans: defineTable({
    coachId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    meals: v.array(
      v.object({
        mealId: v.id("meals"),
        mealType: v.union(
          v.literal("breakfast"),
          v.literal("lunch"),
          v.literal("dinner"),
          v.literal("snack")
        ),
        servings: v.number(),
      })
    ),
    totalMacros: v.object({
      calories: v.number(),
      protein: v.number(),
      carbs: v.number(),
      fat: v.number(),
    }),
    isTemplate: v.boolean(),
  }).index("by_coach", ["coachId"]),

  // Clients
  clients: defineTable({
    coachId: v.id("users"),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    status: v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("paused")
    ),
    startDate: v.number(),
    currentWorkoutSplit: v.optional(v.id("workoutSplits")),
    currentMealPlan: v.optional(v.id("mealPlans")),
    currentPricingPlan: v.optional(v.id("pricingPlans")),
    goals: v.array(v.string()),
    notes: v.optional(v.string()),
    paymentStatus: v.union(
      v.literal("paid"),
      v.literal("pending"),
      v.literal("overdue")
    ),
    monthlyRate: v.optional(v.number()),
  }).index("by_coach", ["coachId"]),

  // Client Progress
  clientProgress: defineTable({
    clientId: v.id("clients"),
    date: v.number(),
    weight: v.optional(v.number()),
    bodyFat: v.optional(v.number()),
    measurements: v.optional(
      v.object({
        chest: v.optional(v.number()),
        waist: v.optional(v.number()),
        hips: v.optional(v.number()),
        arms: v.optional(v.number()),
        thighs: v.optional(v.number()),
      })
    ),
    photos: v.array(v.id("_storage")),
    notes: v.optional(v.string()),
    mood: v.optional(v.number()), // 1-10 scale
    energy: v.optional(v.number()), // 1-10 scale
  }).index("by_client", ["clientId"]),

  // Check-ins
  checkIns: defineTable({
    clientId: v.id("clients"),
    formId: v.optional(v.id("forms")),
    responses: v.record(v.string(), v.string()),
    coachNotes: v.optional(v.string()),
    status: v.union(v.literal("pending"), v.literal("reviewed")),
  }).index("by_client", ["clientId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
