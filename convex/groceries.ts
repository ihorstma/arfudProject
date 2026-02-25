import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { authComponent } from "./auth"

const requireOwnerId = async (ctx: any) => {
  const user = (await authComponent.getAuthUser(ctx)) as any
  const ownerId = user?.userId ?? user?._id
  if (!ownerId) throw new Error("Unauthorized")
  return String(ownerId)
}

export const listGroceries = query({
  args: {
    sortBy: v.optional(v.string()), // category, alphabetical, date, safe, unchecked
  },
  handler: async (ctx, args) => {
    const ownerId = await requireOwnerId(ctx)
    const items = await ctx.db
      .query("groceryItems")
      .withIndex("by_ownerId", (q) => q.eq("ownerId", ownerId))
      .collect()

    // Default sorting logic based on the image requirements
    return items.sort((a, b) => {
      if (args.sortBy === "alphabetical") return a.name.localeCompare(b.name)
      if (args.sortBy === "date") return b.createdAt - a.createdAt
      if (args.sortBy === "safe") {
        if (a.isSafeFood && !b.isSafeFood) return -1
        if (!a.isSafeFood && b.isSafeFood) return 1
      }
      if (args.sortBy === "unchecked") {
        if (!a.isCompleted && b.isCompleted) return -1
        if (a.isCompleted && !b.isCompleted) return 1
      }
      // Default: by category then name
      const catComp = a.category.localeCompare(b.category)
      if (catComp !== 0) return catComp
      return a.name.localeCompare(b.name)
    })
  },
})

export const addItem = mutation({
  args: {
    name: v.string(),
    category: v.string(),
    quantity: v.optional(v.string()),
    isSafeFood: v.boolean(),
  },
  handler: async (ctx, args) => {
    const ownerId = await requireOwnerId(ctx)
    return await ctx.db.insert("groceryItems", {
      ownerId,
      ...args,
      isCompleted: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
  },
})

export const toggleItem = mutation({
  args: { id: v.id("groceryItems") },
  handler: async (ctx, args) => {
    const ownerId = await requireOwnerId(ctx)
    const item = await ctx.db.get(args.id)
    if (!item || item.ownerId !== ownerId) throw new Error("Not found")
    await ctx.db.patch(args.id, {
      isCompleted: !item.isCompleted,
      updatedAt: Date.now(),
    })
  },
})

export const deleteItem = mutation({
  args: { id: v.id("groceryItems") },
  handler: async (ctx, args) => {
    const ownerId = await requireOwnerId(ctx)
    const item = await ctx.db.get(args.id)
    if (!item || item.ownerId !== ownerId) throw new Error("Not found")
    await ctx.db.delete(args.id)
  },
})

export const clearCompleted = mutation({
  args: {},
  handler: async (ctx) => {
    const ownerId = await requireOwnerId(ctx)
    const items = await ctx.db
      .query("groceryItems")
      .withIndex("by_ownerId_and_isCompleted", (q) => q.eq("ownerId", ownerId).eq("isCompleted", true))
      .collect()
    for (const item of items) {
      await ctx.db.delete(item._id)
    }
  },
})

export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    const ownerId = await requireOwnerId(ctx)
    const items = await ctx.db
      .query("groceryItems")
      .withIndex("by_ownerId", (q) => q.eq("ownerId", ownerId))
      .collect()
    for (const item of items) {
      await ctx.db.delete(item._id)
    }
  },
})

export const seedGroceries = mutation({
  args: {},
  handler: async (ctx) => {
    const ownerId = await requireOwnerId(ctx)
    const SEED_DATA = [
      { name: "donuts", category: "bakery & bread", quantity: "x 2", isSafeFood: true },
      { name: "croissant", category: "bakery & bread", quantity: "x 2", isSafeFood: false },
      { name: "yogurt", category: "dairy", isSafeFood: true },
      { name: "parmesan cheese", category: "dairy", isSafeFood: false },
      { name: "onion", category: "produce", quantity: "x 3", isSafeFood: false },
      { name: "radish", category: "produce", quantity: "x 10", isSafeFood: true },
      { name: "bacon", category: "meat", isSafeFood: true },
      { name: "prosciutto", category: "meat", isSafeFood: false },
    ]

    for (const item of SEED_DATA) {
      await ctx.db.insert("groceryItems", {
        ownerId,
        ...item,
        isCompleted: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    }
  },
})
