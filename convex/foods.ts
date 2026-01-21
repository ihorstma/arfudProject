import { v } from "convex/values"
import { mutation, query, MutationCtx } from "./_generated/server"
import { Id } from "./_generated/dataModel"

const listFoodsArgs = {
  includeUnsafe: v.optional(v.boolean()),
  category: v.optional(v.string()),
  texture: v.optional(v.string()),
  temperature: v.optional(v.string()),
  inStock: v.optional(v.boolean()),
}

export const listFoods = query({
  args: listFoodsArgs,
  handler: async (ctx, args) => {
    const includeUnsafe = args.includeUnsafe ?? false

    const dbQuery = !includeUnsafe
      ? ctx.db.query("foods").withIndex("by_isSafe", (q) => q.eq("isSafe", true))
      : args.category
      ? ctx.db.query("foods").withIndex("by_category", (q) => q.eq("category", args.category!))
      : args.texture
      ? ctx.db.query("foods").withIndex("by_texture", (q) => q.eq("texture", args.texture!))
      : args.temperature
      ? ctx.db.query("foods").withIndex("by_temperature", (q) => q.eq("temperature", args.temperature!))
      : args.inStock !== undefined
      ? ctx.db.query("foods").withIndex("by_inStock", (q) => q.eq("inStock", args.inStock!))
      : ctx.db.query("foods")

    const items = await dbQuery.order("desc").collect()

    return items.filter((item) => {
      if (!includeUnsafe && !item.isSafe) return false
      if (args.category && item.category !== args.category) return false
      if (args.texture && item.texture !== args.texture) return false
      if (args.temperature && item.temperature !== args.temperature) return false
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
  description: v.optional(v.string()),
  category: v.string(),
  texture: v.string(),
  temperature: v.string(),
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
  description: v.optional(v.string()),
  category: v.optional(v.string()),
  texture: v.optional(v.string()),
  temperature: v.optional(v.string()),
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
