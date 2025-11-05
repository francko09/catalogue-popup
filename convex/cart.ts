import { v } from "convex/values";
import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

async function requireAuth(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Not authenticated");
  }
  return userId;
}

export const getCart = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("cartItems"),
      _creationTime: v.number(),
      userId: v.id("users"),
      productId: v.id("products"),
      quantity: v.number(),
      product: v.object({
        _id: v.id("products"),
        name: v.string(),
        description: v.string(),
        price: v.number(),
        category: v.string(),
        imageUrl: v.union(v.string(), v.null()),
      }),
    })
  ),
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);

    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return Promise.all(
      cartItems.map(async (item) => {
        const product = await ctx.db.get(item.productId);
        if (!product) {
          throw new Error("Product not found");
        }

        return {
          ...item,
          product: {
            _id: product._id,
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            imageUrl: product.imageId
              ? await ctx.storage.getUrl(product.imageId)
              : null,
          },
        };
      })
    );
  },
});

export const addToCart = mutation({
  args: {
    productId: v.id("products"),
    quantity: v.optional(v.number()),
  },
  returns: v.id("cartItems"),
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    // Vérifier que le produit existe et est actif
    const product = await ctx.db.get(args.productId);
    if (!product || !product.isActive) {
      throw new Error("Product not found or not active");
    }

    const quantity = args.quantity ?? 1;

    // Vérifier si le produit est déjà dans le panier
    const existingItem = await ctx.db
      .query("cartItems")
      .withIndex("by_user_and_product", (q) =>
        q.eq("userId", userId).eq("productId", args.productId)
      )
      .unique();

    if (existingItem) {
      // Mettre à jour la quantité
      await ctx.db.patch(existingItem._id, {
        quantity: existingItem.quantity + quantity,
      });
      return existingItem._id;
    } else {
      // Ajouter un nouvel article au panier
      return await ctx.db.insert("cartItems", {
        userId,
        productId: args.productId,
        quantity,
      });
    }
  },
});

export const removeFromCart = mutation({
  args: {
    cartItemId: v.id("cartItems"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    const cartItem = await ctx.db.get(args.cartItemId);
    if (!cartItem || cartItem.userId !== userId) {
      throw new Error("Cart item not found or access denied");
    }

    await ctx.db.delete(args.cartItemId);
    return null;
  },
});

export const updateCartItemQuantity = mutation({
  args: {
    cartItemId: v.id("cartItems"),
    quantity: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    if (args.quantity <= 0) {
      throw new Error("Quantity must be greater than 0");
    }

    const cartItem = await ctx.db.get(args.cartItemId);
    if (!cartItem || cartItem.userId !== userId) {
      throw new Error("Cart item not found or access denied");
    }

    await ctx.db.patch(args.cartItemId, {
      quantity: args.quantity,
    });
    return null;
  },
});

export const clearCart = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);

    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const item of cartItems) {
      await ctx.db.delete(item._id);
    }

    return null;
  },
});

export const getCartItemCount = query({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return 0;
    }

    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return cartItems.reduce((total, item) => total + item.quantity, 0);
  },
});

