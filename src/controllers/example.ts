import { DuckDBConnection } from '@duckdb/node-api';
import type { MojoContext } from '@mojojs/core';
import { Recipe } from '../models/recipes.js';

export default class Controller {
  // Render template "example/welcome.html.tmpl" with message
  async recipes(ctx: MojoContext): Promise<void> {
    console.log('Loading recipes...');
    let recipes: Recipe[] = [];
    await ctx.app.models.database.connection(async (connection: DuckDBConnection) => {
      recipes = await ctx.app.models.recipes.listRecipes(connection);
    });
    // Now recipes is set
    console.log(`Loaded ${recipes.length} recipes`);
    ctx.stash.recipes = recipes;
    ctx.stash.title = 'Recipes List';
    await ctx.render({ view: 'example/recipes' });
  }

  async recipe(ctx: MojoContext): Promise<void> {
    const id = ctx.stash.id;
    let recipes: Recipe[] = [];
    await ctx.app.models.database.connection(async (connection: DuckDBConnection) => {
      recipes = await ctx.app.models.recipes.listRecipes(connection);
    });
    let recipe = recipes.find(r => r.recipe_id == id);
    console.log(`Recipe info: ${JSON.stringify(recipe, (_, v) => typeof v === 'bigint' ? v.toString() : v)}`);

    ctx.stash.recipe = recipe;
    await ctx.render({ view: 'example/recipe' });
  }
}
