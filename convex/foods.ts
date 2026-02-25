import { v } from "convex/values"

import { Id } from "./_generated/dataModel"
import { mutation, query, MutationCtx } from "./_generated/server"
import { authComponent } from "./auth"

const listFoodsArgs = {
  includeUnsafe: v.optional(v.boolean()),
  category: v.optional(v.string()),
  texture: v.optional(v.string()),
  temperature: v.optional(v.string()),
  inStock: v.optional(v.boolean()),
}

const foodValidator = v.object({
  _id: v.id("foods"),
  _creationTime: v.number(),
  ownerId: v.optional(v.string()),
  name: v.string(),
  description: v.optional(v.string()),
  category: v.string(),
  texture: v.string(),
  temperature: v.string(),
  isSafe: v.boolean(),
  inStock: v.boolean(),
  imageUrl: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
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
  args: listFoodsArgs,
  returns: v.array(foodValidator),
  handler: async (ctx, args) => {
    const ownerId = await requireOwnerId(ctx)
    const includeUnsafe = args.includeUnsafe ?? false

    const dbQuery = !includeUnsafe
      ? ctx.db
          .query("foods")
          .withIndex("by_ownerId_and_isSafe", (q) => q.eq("ownerId", ownerId).eq("isSafe", true))
      : args.category
        ? ctx.db
            .query("foods")
            .withIndex("by_ownerId_and_category", (q) =>
              q.eq("ownerId", ownerId).eq("category", args.category!),
            )
        : args.texture
          ? ctx.db
              .query("foods")
              .withIndex("by_ownerId_and_texture", (q) =>
                q.eq("ownerId", ownerId).eq("texture", args.texture!),
              )
          : args.temperature
            ? ctx.db
                .query("foods")
                .withIndex("by_ownerId_and_temperature", (q) =>
                  q.eq("ownerId", ownerId).eq("temperature", args.temperature!),
                )
            : args.inStock !== undefined
              ? ctx.db
                  .query("foods")
                  .withIndex("by_ownerId_and_inStock", (q) =>
                    q.eq("ownerId", ownerId).eq("inStock", args.inStock!),
                  )
              : ctx.db.query("foods").withIndex("by_ownerId", (q) => q.eq("ownerId", ownerId))

    const items = await dbQuery.collect()

    return items
      .filter((item) => {
        if (item.ownerId !== ownerId) return false
        if (!includeUnsafe && !item.isSafe) return false
        if (args.category && item.category !== args.category) return false
        if (args.texture && item.texture !== args.texture) return false
        if (args.temperature && item.temperature !== args.temperature) return false
        if (args.inStock !== undefined && item.inStock !== args.inStock) return false
        return true
      })
      .sort((a, b) => b.updatedAt - a.updatedAt)
  },
})

export const listAllFoods = query({
  args: {},
  returns: v.array(foodValidator),
  handler: async (ctx) => {
    const ownerId = await requireOwnerId(ctx)
    const items = await ctx.db
      .query("foods")
      .withIndex("by_ownerId", (q) => q.eq("ownerId", ownerId))
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

const setInStockInternal = async (
  ctx: MutationCtx,
  id: Id<"foods">,
  inStock: boolean,
  ownerId: string,
) => {
  const existing = await ctx.db.get(id)
  if (!existing || existing.ownerId !== ownerId) throw new Error("Not found")
  await ctx.db.patch(id, { inStock, updatedAt: Date.now() })
}

export const setInStock = mutation({
  args: { id: v.id("foods"), inStock: v.boolean() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const ownerId = await requireOwnerId(ctx)
    await setInStockInternal(ctx, args.id, args.inStock, ownerId)
    return null
  },
})

export const markOutOfStock = mutation({
  args: { id: v.id("foods") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const ownerId = await requireOwnerId(ctx)
    await setInStockInternal(ctx, args.id, false, ownerId)
    return null
  },
})

export const seedFoods = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const ownerId = await requireOwnerId(ctx)
    const CATEGORIES = ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert", "Drink"]
    const TEXTURES = ["Crunchy", "Soft", "Smooth", "Chewy", "Liquid", "Mixed"]
    const TEMPERATURES = ["Hot", "Cold", "Room Temp"]
    const DISHES = [
      "Pizza",
      "Pasta",
      "Burger",
      "Salad",
      "Sushi",
      "Tacos",
      "Soup",
      "Sandwich",
      "Ice Cream",
      "Cake",
      "Apple",
      "Banana",
      "Chicken",
      "Rice",
      "Steak",
      "Fries",
      "Eggs",
      "Toast",
      "Cereal",
      "Yogurt",
    ]

    for (let i = 0; i < 20; i++) {
      const name = DISHES[i % DISHES.length] + (i >= DISHES.length ? ` ${Math.floor(i / DISHES.length)}` : "")
      await ctx.db.insert("foods", {
        ownerId,
        name,
        description: `Delicious ${name}`,
        category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
        texture: TEXTURES[Math.floor(Math.random() * TEXTURES.length)],
        temperature: TEMPERATURES[Math.floor(Math.random() * TEMPERATURES.length)],
        isSafe: Math.random() > 0.3,
        inStock: Math.random() > 0.2,
        imageUrl: `https://loremflickr.com/300/300/food?lock=${i}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    }
    return null
  },
})
