import { faker } from "@faker-js/faker"
import { v } from "convex/values"

import { internalMutation } from "./_generated/server"

export const generateFoods = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const SENSORY = [
      "sweet", "savory", "crunchy", "firm", "soft", "chewy",
      "creamy", "sticky", "dry", "warm", "hot", "cool", "cold", "crumbly",
    ]

    const PREP = ["minimal prep", "moderate prep", "full prep"]
    const STOCK = ["in stock", "low stock", "out of stock"]

    for (let i = 0; i < 20; i++) {
      await ctx.db.insert("foods", {
        name: faker.food.dish(),
        description: faker.food.description(),
        isSafe: faker.datatype.boolean(),
        inStock: faker.helpers.arrayElement([
          "in stock",
          "low stock",
          "out of stock",
        ]),
        imageUrl: faker.image.urlLoremFlickr({ category: "food", width: 300, height: 300 }),

        // UI-compatible fields
        tags: faker.helpers.arrayElements(SENSORY, { min: 1, max: 3 }),
        prepTime: [faker.helpers.arrayElement(PREP)],
        stockStatus: [faker.helpers.arrayElement(STOCK)],

        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    }

    console.log("Successfully added 20 fake food items!")
    return null
  },
})
