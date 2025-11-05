import { v } from "convex/values";
import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Not authenticated");
  }

  const profile = await ctx.db
    .query("userProfiles")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .unique();

  if (!profile || profile.role !== "admin") {
    throw new Error("Admin access required");
  }

  return profile;
}

export const getRandomActiveAd = query({
  args: {},
  handler: async (ctx) => {
    const ads = await ctx.db
      .query("advertisements")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    if (ads.length === 0) {
      return null;
    }

    const randomAd = ads[Math.floor(Math.random() * ads.length)];

    return {
      ...randomAd,
      imageUrl: randomAd.imageId ? await ctx.storage.getUrl(randomAd.imageId) : null,
    };
  },
});

export const getAllActiveAds = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("advertisements"),
      _creationTime: v.number(),
      title: v.string(),
      imageId: v.optional(v.id("_storage")),
      link: v.optional(v.string()),
      isActive: v.boolean(),
      imageUrl: v.union(v.string(), v.null()),
    })
  ),
  handler: async (ctx) => {
    // Cette fonction est publique et peut être appelée sans authentification
    const ads = await ctx.db
      .query("advertisements")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    return Promise.all(
      ads.map(async (ad) => ({
        ...ad,
        imageUrl: ad.imageId ? await ctx.storage.getUrl(ad.imageId) : null,
      }))
    );
  },
});

export const listAllAds = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const ads = await ctx.db.query("advertisements").collect();

    return Promise.all(
      ads.map(async (ad) => ({
        ...ad,
        imageUrl: ad.imageId ? await ctx.storage.getUrl(ad.imageId) : null,
      }))
    );
  },
});

export const createAd = mutation({
  args: {
    title: v.string(),
    imageId: v.optional(v.id("_storage")),
    link: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    return await ctx.db.insert("advertisements", {
      ...args,
      isActive: args.isActive ?? true,
    });
  },
});

export const updateAd = mutation({
  args: {
    id: v.id("advertisements"),
    title: v.string(),
    imageId: v.optional(v.id("_storage")),
    link: v.optional(v.string()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const deleteAd = mutation({
  args: {
    id: v.id("advertisements"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});
