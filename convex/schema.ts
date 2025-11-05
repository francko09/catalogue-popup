import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  products: defineTable({
    name: v.string(),
    description: v.string(),
    price: v.number(),
    imageId: v.optional(v.id("_storage")),
    category: v.string(),
    isActive: v.boolean(),
  })
    .index("by_category", ["category"])
    .index("by_active", ["isActive"])
    .searchIndex("search_products", {
      searchField: "name",
      filterFields: ["category", "isActive"],
    }),

  advertisements: defineTable({
    title: v.string(),
    imageId: v.optional(v.id("_storage")),
    link: v.optional(v.string()),
    isActive: v.boolean(),
  }).index("by_active", ["isActive"]),

  userProfiles: defineTable({
    userId: v.id("users"),
    role: v.union(v.literal("client"), v.literal("admin")),
    lastLogin: v.number(),
  }).index("by_user", ["userId"]),

  loginStats: defineTable({
    userId: v.id("users"),
    loginTime: v.number(),
    role: v.string(),
  }).index("by_time", ["loginTime"]),

  cartItems: defineTable({
    userId: v.id("users"),
    productId: v.id("products"),
    quantity: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_product", ["userId", "productId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
