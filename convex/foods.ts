import { v } from "convex/values"
import { Id } from "./_generated/dataModel"
import { mutation, query, MutationCtx } from "./_generated/server"
import { authComponent } from "./auth"

const listFoodsArgs = {
  includeUnsafe: v.optional(v.boolean()),
  inStock: v.optional(v.boolean()),
}

const foodValidator = v.object({
  _id: v.id("foods"),
  _creationTime: v.number(),
  ownerId: v.optional(v.string()),
  name: v.string(),
  description: v.optional(v.string()),
  isSafe: v.boolean(),
  inStock: v.boolean(),
  imageUrl: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
  prepTime: v.optional(v.array(v.string())),
  stockStatus: v.optional(v.array(v.string())),
  createdAt: v.number(),
  updatedAt: v.number(),
})

const requireOwnerId = async (ctx: any) => {
  const user = (await authComponent.getAuthUser(ctx)) as any
  const ownerId = user?.userId ?? user?._id
  if (!ownerId) throw new Error("Unauthorized")
  return String(ownerId)
}

export const listFoods = query({
  args: {
    includeUnsafe: v.optional(v.boolean()),
    inStock: v.optional(v.boolean()),
  },
  returns: v.array(foodValidator),
  handler: async (ctx, args) => {
    const ownerId = await requireOwnerId(ctx)
    const includeUnsafe = args.includeUnsafe ?? false

    let dbQuery

    if (!includeUnsafe && args.inStock !== undefined) {
      // filter by ownerId, isSafe, and inStock
      dbQuery = ctx.db
        .query("foods")
        .withIndex("by_ownerId_and_inStock", q =>
          q.eq("ownerId", ownerId).eq("inStock", args.inStock!)
        )
    } else if (!includeUnsafe) {
      // filter by ownerId and isSafe
      dbQuery = ctx.db
        .query("foods")
        .withIndex("by_ownerId_and_isSafe", q =>
          q.eq("ownerId", ownerId).eq("isSafe", true)
        )
    } else if (args.inStock !== undefined) {
      // filter by ownerId and inStock
      dbQuery = ctx.db
        .query("foods")
        .withIndex("by_ownerId_and_inStock", q =>
          q.eq("ownerId", ownerId).eq("inStock", args.inStock!)
        )
    } else {
      // just ownerId
      dbQuery = ctx.db
        .query("foods")
        .withIndex("by_ownerId", q =>
          q.eq("ownerId", ownerId)
        )
    }

    const items = await dbQuery.collect()
    return items.sort((a, b) => b.updatedAt - a.updatedAt)
  },
})

export const listAllFoods = query({
  args: {},
  returns: v.array(foodValidator),
  handler: async (ctx) => {
    const ownerId = await requireOwnerId(ctx)
    const items = await ctx.db
      .query("foods")
      .withIndex("by_ownerId", q => q.eq("ownerId", ownerId))
      .collect()
    return items.sort((a, b) => b.updatedAt - a.updatedAt)
  },
})

export const getFoodById = query({
  args: { id: v.id("foods") },
  returns: v.union(foodValidator, v.null()),
  handler: async (ctx, args) => {
    const ownerId = await requireOwnerId(ctx)
    const item = await ctx.db.get(args.id)
    if (!item || item.ownerId !== ownerId) return null
    return item
  },
})

const addFoodArgs = {
  name: v.string(),
  isSafe: v.boolean(),
  inStock: v.boolean(),
  imageUrl: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
  prepTime: v.optional(v.array(v.string())),
  stockStatus: v.optional(v.array(v.string())),
  description: v.optional(v.string()),
}

export const addFood = mutation({
  args: addFoodArgs,
  returns: v.id("foods"),
  handler: async (ctx, args) => {
    const ownerId = await requireOwnerId(ctx)
    const now = Date.now()
    return ctx.db.insert("foods", {
      ownerId,
      ...args,
      createdAt: now,
      updatedAt: now,
    })
  },
})

const updateFoodArgs = {
  id: v.id("foods"),
  name: v.optional(v.string()),
  isSafe: v.optional(v.boolean()),
  inStock: v.optional(v.boolean()),
  imageUrl: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
  prepTime: v.optional(v.array(v.string())),
  stockStatus: v.optional(v.array(v.string())),
  description: v.optional(v.string()),
}

export const updateFood = mutation({
  args: updateFoodArgs,
  returns: v.null(),
  handler: async (ctx, args) => {
    const ownerId = await requireOwnerId(ctx)
    const existing = await ctx.db.get(args.id)
    if (!existing || existing.ownerId !== ownerId) throw new Error("Not found")

    const { id, ...updates } = args
    await ctx.db.patch(id, { ...updates, updatedAt: Date.now() })
    return null
  },
})

export const deleteFood = mutation({
  args: { id: v.id("foods") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const ownerId = await requireOwnerId(ctx)
    const existing = await ctx.db.get(args.id)
    if (!existing || existing.ownerId !== ownerId) throw new Error("Not found")
    await ctx.db.delete(args.id)
    return null
  },
})

export const setInStock = mutation({
  args: { id: v.id("foods"), inStock: v.boolean() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const ownerId = await requireOwnerId(ctx)
    const existing = await ctx.db.get(args.id)
    if (!existing || existing.ownerId !== ownerId) throw new Error("Not found")

    await ctx.db.patch(args.id, {
      inStock: args.inStock,
      updatedAt: Date.now(),
    })
    return null
  },
})

export const markOutOfStock = mutation({
  args: { id: v.id("foods") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const ownerId = await requireOwnerId(ctx)
    const existing = await ctx.db.get(args.id)
    if (!existing || existing.ownerId !== ownerId) throw new Error("Not found")

    await ctx.db.patch(args.id, {
      inStock: false,
      updatedAt: Date.now(),
    })
    return null
  },
})


export const seedFoods = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const ownerId = await requireOwnerId(ctx)
    const DISHES = [
      "Pizza", "Pasta", "Burger", "Salad", "Sushi", "Tacos",
      "Soup", "Sandwich", "Ice Cream", "Cake", "Apple",
      "Banana", "Chicken", "Rice", "Steak", "Fries",
      "Eggs", "Toast", "Cereal", "Yogurt",
    ]

    const SENSORY = ["sweet", "savory", "crunchy", "soft", "chewy", "creamy"]
    const PREP = ["minimal prep", "moderate prep", "full prep"]
    const STOCK = ["in stock", "low stock", "out of stock"]

    for (let i = 0; i < 20; i++) {
      const name = DISHES[i % DISHES.length]
      await ctx.db.insert("foods", {
        ownerId,
        name,
        description: `Delicious ${name}`,
        isSafe: Math.random() > 0.3,
        inStock: Math.random() > 0.2,
        imageUrl: `https://loremflickr.com/300/300/food?lock=${i}`,
        // optional:
        // tags: [...],
        // prepTime: [...],
        // stockStatus: [...],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    }
    return null
  },
})

