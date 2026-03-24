import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  foods: defineTable({
    ownerId: v.optional(v.string()),
    name: v.string(),
    description: v.optional(v.string()),
    isSafe: v.boolean(),
    inStock: v.optional(v.string()), // "in_stock", "low_stock", "out_of_stock"
    imageUrl: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),        // sensory tags
    prepTime: v.optional(v.array(v.string())),    // prep time tags
    stockStatus: v.optional(v.array(v.string())), // stock tags
    createdAt: v.number(),
    updatedAt: v.number(),
    recipes: v.optional(
      v.array(
        v.object({
          ingredients: v.array(
            v.object({
              name: v.string(),
              quantity: v.string(),
            })
          ),
          instructions: v.string(),
        })
      )
    )
  })
    .index("by_ownerId", ["ownerId"])
    .index("by_ownerId_and_isSafe", ["ownerId", "isSafe"])
    .index("by_ownerId_and_inStock", ["ownerId", "inStock"])
    .index("by_isSafe", ["isSafe"])
    .index("by_inStock", ["inStock"])
    .index("by_isSafe_inStock", ["isSafe", "inStock"]),

  groceryItems: defineTable({
    ownerId: v.string(),
    name: v.string(),
    category: v.string(),
    quantity: v.optional(v.string()),
    isCompleted: v.boolean(),
    isSafeFood: v.boolean(),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_ownerId", ["ownerId"])
    .index("by_ownerId_and_isCompleted", ["ownerId", "isCompleted"]),
})
