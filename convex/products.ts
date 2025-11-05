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

export const listProducts = query({
  args: {
    category: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("products").withIndex("by_active", (q) => q.eq("isActive", true));

    if (args.search) {
      const searchResults = await ctx.db
        .query("products")
        .withSearchIndex("search_products", (q) =>
          q.search("name", args.search!).eq("isActive", true)
        )
        .collect();

      return Promise.all(
        searchResults
          .filter((product) => !args.category || product.category === args.category)
          .map(async (product) => ({
            ...product,
            imageUrl: product.imageId ? await ctx.storage.getUrl(product.imageId) : null,
          }))
      );
    }

    if (args.category) {
      query = ctx.db
        .query("products")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .filter((q) => q.eq(q.field("isActive"), true));
    }

    const products = await query.collect();

    return Promise.all(
      products.map(async (product) => ({
        ...product,
        imageUrl: product.imageId ? await ctx.storage.getUrl(product.imageId) : null,
      }))
    );
  },
});

export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    const categories = [...new Set(products.map((p) => p.category))];
    return categories.sort();
  },
});

export const createProduct = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    price: v.number(),
    imageId: v.optional(v.id("_storage")),
    category: v.string(),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    return await ctx.db.insert("products", {
      ...args,
      isActive: args.isActive ?? true,
    });
  },
});

export const updateProduct = mutation({
  args: {
    id: v.id("products"),
    name: v.string(),
    description: v.string(),
    price: v.number(),
    imageId: v.optional(v.id("_storage")),
    category: v.string(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const deleteProduct = mutation({
  args: {
    id: v.id("products"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
  },
});

export const listAllProducts = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const products = await ctx.db.query("products").collect();

    return Promise.all(
      products.map(async (product) => ({
        ...product,
        imageUrl: product.imageId ? await ctx.storage.getUrl(product.imageId) : null,
      }))
    );
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});
