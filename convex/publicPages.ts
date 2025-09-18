import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getCoachPublicPage = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const page = await ctx.db
      .query("publicPages")
      .withIndex("by_coach", (q) => q.eq("coachId", userId))
      .first();

    return page;
  },
});

export const getPublicPageBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("publicPages")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const createOrUpdatePublicPage = mutation({
  args: {
    slug: v.string(),
    title: v.string(),
    theme: v.string(),
    primaryColor: v.string(),
    heroTitle: v.string(),
    heroSubtitle: v.string(),
    aboutText: v.string(),
    testimonials: v.array(v.object({
      name: v.string(),
      text: v.string(),
    })),
    contactEmail: v.string(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const existingPage = await ctx.db
      .query("publicPages")
      .withIndex("by_coach", (q) => q.eq("coachId", userId))
      .first();

    const pageData = {
      coachId: userId,
      slug: args.slug,
      title: args.title,
      theme: args.theme,
      primaryColor: args.primaryColor,
      heroTitle: args.heroTitle,
      heroSubtitle: args.heroSubtitle,
      aboutText: args.aboutText,
      testimonials: args.testimonials,
      clientImages: [],
      contactEmail: args.contactEmail,
      isActive: args.isActive,
    };

    if (existingPage) {
      await ctx.db.patch(existingPage._id, pageData);
      return existingPage._id;
    } else {
      return await ctx.db.insert("publicPages", pageData);
    }
  },
});
