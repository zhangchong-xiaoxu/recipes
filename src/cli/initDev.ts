import { DuckDBConnection } from "@duckdb/node-api";
import { MojoApp } from "@mojojs/core";

export default async function initDev(app: MojoApp, args: string[]) {
    await app.models.database.connection(async (connection: DuckDBConnection) => {

        // Create tables if needed
        await app.models.users.init(connection)
        await app.models.recipes.init(connection) // 新增，创建 recipes 表

        // Allow for an alternative source of cats
        const csvPath = args.length > 1 ? args[1] : "test_data/users.csv";
        console.info("Importing users from", csvPath);
        await app.models.users.loadUsersFromCsv(connection, csvPath);

        // 导入 recipes
        const recipesJsonPath = "test_data/recipes.json";
        console.info("Importing recipes from", recipesJsonPath);
        await app.models.recipes.loadRecipesFromJson(connection, recipesJsonPath);

        const users = await app.models.users.listUsers(connection);
        console.table(users);

        const recipes = await app.models.recipes.listRecipes(connection);
        console.table(recipes);

        console.info("Initialisation of development environment complete.")
    });

}

initDev.description = 'Import a development dataset and find placeholder assets.';
initDev.usage = `Usage: APPLICATION initDev [csv_import_path]

  node index.js initDev

Options:
  -h, --help   Show this summary of available options
`;
