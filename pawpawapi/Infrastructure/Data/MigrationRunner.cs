using Npgsql;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Data
{
    public static class MigrationRunner
    {
        public static async Task RunMigrationsAsync(string connectionString)
        {
            // Get all SQL files in the DbScripts directory, file have to be set embedded resource
            var assembly = Assembly.GetExecutingAssembly();
            var resourceNames = assembly.GetManifestResourceNames()
                .Where(x => x.EndsWith(".sql"))
                .OrderBy(x => x);

            await using var connection = new NpgsqlConnection(connectionString);
            await connection.OpenAsync();

            foreach (var resourceName in resourceNames)
            {
                Console.WriteLine($"Running migration: {resourceName}");

                using var stream = assembly.GetManifestResourceStream(resourceName);
                using var reader = new StreamReader(stream!);
                var sql = await reader.ReadToEndAsync();

                await using var cmd = new NpgsqlCommand(sql, connection);
                await cmd.ExecuteNonQueryAsync();
            }

            Console.WriteLine("All migrations completed successfully!");
        }
    }
}
