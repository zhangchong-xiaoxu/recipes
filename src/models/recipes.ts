import fs from 'fs';
import { DuckDBConnection } from "@duckdb/node-api";

export interface Recipe {
  recipe_id: number;
  title: string;
  ingredients: string[];
  steps: string[];
  time: string;
  category: string;
  difficulty: string;
  tags: string[];
  created_at: string;
}

export class Recipes {
  private recipes: Recipe[] = [];

  constructor() {
    // 可以在这里加载初始数据
    this.recipes = this.loadInitialRecipes();
  }

  private loadInitialRecipes(): Recipe[] {
    // 这里可以加载一些初始数据，或者从文件中读取
    return [];
  }

  // 初始化表结构
  async init(connection: DuckDBConnection) {
    await connection.run(`
      CREATE SEQUENCE IF NOT EXISTS recipe_id_seq;
      CREATE TABLE IF NOT EXISTS recipes (
        recipe_id INTEGER DEFAULT nextval('recipe_id_seq') PRIMARY KEY,
        title VARCHAR NOT NULL,
        ingredients VARCHAR NOT NULL,
        steps VARCHAR NOT NULL,
        time VARCHAR NOT NULL,
        category VARCHAR NOT NULL,
        difficulty VARCHAR NOT NULL,
        tags VARCHAR NOT NULL,
        created_at TIMESTAMP
      );
    `);
  }

  /**
   * Load recipes from a JSON file and insert them into the DuckDB database.
   * @param connection DuckDBConnection instance
   * @param jsonPath Path to the JSON file
   */
  async loadRecipesFromJson(connection: DuckDBConnection, jsonPath: string) {
    if (!fs.existsSync(jsonPath)) {
      throw new Error(`File not found: ${jsonPath}`);
    }
    const data = fs.readFileSync(jsonPath, 'utf-8');
    let recipes: Recipe[];
    try {
      recipes = JSON.parse(data);
      if (!Array.isArray(recipes)) {
        throw new Error('JSON is not an array');
      }
    } catch (e) {
      throw new Error('Invalid JSON file');
    }

    for (const recipe of recipes) {
      await connection.run(
        `INSERT INTO recipes 
          (title, ingredients, steps, time, category, difficulty, tags, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          recipe.title,
          JSON.stringify(recipe.ingredients),
          JSON.stringify(recipe.steps),
          recipe.time,
          recipe.category,
          recipe.difficulty,
          JSON.stringify(recipe.tags),
          recipe.created_at
        ]
      );
    }
  }

  async listRecipes(connection: DuckDBConnection): Promise<Recipe[]> {
    const result = await connection.runAndReadAll(`
      SELECT 
        recipe_id, 
        title, 
        ingredients, 
        steps, 
        time, 
        category, 
        difficulty, 
        tags, 
        created_at 
      FROM recipes
    `);
    console.log(`Found ${result.getRows().length} recipes in the database.`);
    
    return result.getRows().map(row => {
      // 按列顺序解包
      const [recipe_id, title, ingredients, steps, time, category, difficulty, tags, created_at] = row;
      return {
        recipe_id: typeof recipe_id === 'bigint' ? Number(recipe_id) : recipe_id as number,
        title: title as string,
        ingredients: JSON.parse(ingredients as string),
        steps: JSON.parse(steps as string),
        time: time as string,
        category: category as string,
        difficulty: difficulty as string,
        tags: JSON.parse(tags as string),
        created_at: created_at as string
      };
    });
  }

  all(): Recipe[] {
    return this.recipes;
  }

  findById(id: number): Recipe | undefined {
    return this.recipes.find(r => r.recipe_id === id);
  }
}
