import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getCoachForms = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db
      .query("forms")
      .withIndex("by_coach", (q) => q.eq("coachId", userId))
      .collect();
  },
});

export const getForm = query({
  args: { formId: v.id("forms") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.formId);
  },
});

export const createForm = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("forms", {
      coachId: userId,
      title: args.title,
      description: args.description,
      fields: args.fields,
      isActive: true,
    });
  },
});

export const getFormSubmissions = query({
  args: { formId: v.id("forms") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const form = await ctx.db.get(args.formId);
    if (!form || form.coachId !== userId) {
      return [];
    }

    return await ctx.db
      .query("formSubmissions")
      .withIndex("by_form", (q) => q.eq("formId", args.formId))
      .order("desc")
      .collect();
  },
});

export const submitForm = mutation({
  args: {
    formId: v.id("forms"),
    responses: v.record(v.string(), v.string()),
    submitterEmail: v.optional(v.string()),
    submitterName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const form = await ctx.db.get(args.formId);
    if (!form || !form.isActive) {
      throw new Error("Form not found or inactive");
    }

    return await ctx.db.insert("formSubmissions", {
      formId: args.formId,
      responses: args.responses,
      submitterEmail: args.submitterEmail,
      submitterName: args.submitterName,
      status: "new",
    });
  },
});

export const updateSubmissionStatus = mutation({
  args: {
    submissionId: v.id("formSubmissions"),
    status: v.union(
      v.literal("new"),
      v.literal("contacted"),
      v.literal("converted"),
      v.literal("cancelled")
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const submission = await ctx.db.get(args.submissionId);
    if (!submission) {
      throw new Error("Submission not found");
    }

    const form = await ctx.db.get(submission.formId);
    if (!form || form.coachId !== userId) {
      throw new Error("Access denied");
    }

    await ctx.db.patch(args.submissionId, {
      status: args.status,
      notes: args.notes,
    });
  },
});
