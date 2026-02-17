import { v } from "convex/values"
import { mutation, query, MutationCtx } from "./_generated/server"
import { Id } from "./_generated/dataModel"

const listFoodsArgs = {
  includeUnsafe: v.optional(v.boolean()),
  inStock: v.optional(v.boolean()),
}

export const listFoods = query({
  args: listFoodsArgs,
  handler: async (ctx, args) => {
    const includeUnsafe = args.includeUnsafe ?? false

    let dbQuery = ctx.db.query("foods")

    if (!includeUnsafe) {
      dbQuery = dbQuery.withIndex("by_isSafe", q => q.eq("isSafe", true))
    }

    if (args.inStock !== undefined) {
      dbQuery = dbQuery.withIndex("by_inStock", q => q.eq("inStock", args.inStock))
    }

    const items = await dbQuery.order("desc").collect()

    return items.filter((item) => {
      if (!includeUnsafe && !item.isSafe) return false
      if (args.inStock !== undefined && item.inStock !== args.inStock) return false
      return true
    })
  },
})

export const listAllFoods = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query("foods").order("desc").collect()
  },
})

export const getFoodById = query({
  args: { id: v.id("foods") },
  handler: async (ctx, args) => {
    return ctx.db.get(args.id)
  },
})

const addFoodArgs = {
  name: v.string(),
  isSafe: v.boolean(),
  inStock: v.boolean(),
  imageUrl: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
}

export const addFood = mutation({
  args: addFoodArgs,
  handler: async (ctx, args) => {
    const now = Date.now()
    return ctx.db.insert("foods", {
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
}

export const updateFood = mutation({
  args: updateFoodArgs,
  handler: async (ctx, args) => {
    const { id, ...updates } = args
    await ctx.db.patch(id, { ...updates, updatedAt: Date.now() })
  },
})

export const deleteFood = mutation({
  args: { id: v.id("foods") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
  },
})

const setInStockInternal = async (
  ctx: MutationCtx,
  id: Id<"foods">,
  inStock: boolean,
) => {
  await ctx.db.patch(id, { inStock, updatedAt: Date.now() })
}

export const setInStock = mutation({
  args: { id: v.id("foods"), inStock: v.boolean() },
  handler: async (ctx, args) => {
    await setInStockInternal(ctx, args.id, args.inStock)
  },
})

export const markOutOfStock = mutation({
  args: { id: v.id("foods") },
  handler: async (ctx, args) => {
    await setInStockInternal(ctx, args.id, false)
  },
})
