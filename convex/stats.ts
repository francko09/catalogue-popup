import { query, QueryCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

async function requireAdmin(ctx: QueryCtx) {
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

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const products = await ctx.db.query("products").collect();
    const ads = await ctx.db.query("advertisements").collect();
    
    const recentLogins = await ctx.db
      .query("loginStats")
      .withIndex("by_time")
      .order("desc")
      .take(10);

    const loginsByRole = recentLogins.reduce((acc, login) => {
      acc[login.role] = (acc[login.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalProducts: products.length,
      activeProducts: products.filter(p => p.isActive).length,
      totalAds: ads.length,
      activeAds: ads.filter(a => a.isActive).length,
      recentLogins: recentLogins.length,
      loginsByRole,
      lastLogins: recentLogins.slice(0, 5).map(login => ({
        role: login.role,
        time: new Date(login.loginTime).toLocaleString(),
      })),
    };
  },
});
