using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Interfaces;
using Core.Models;
using Infrastructure.Data;
using Dapper;
using System.Linq;

namespace Infrastructure.Repositories
{
    public class ExpenseRepository : IExpenseRepository
    {
        private readonly DapperDbContext _dbContext;

        public ExpenseRepository(DapperDbContext dbContext)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
        }

        public async Task<Expense?> GetByIdAsync(Guid id)
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                const string sql = "SELECT * FROM expenses WHERE id = @Id";
                return await connection.QueryFirstOrDefaultAsync<Expense>(sql, new { Id = id });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetByIdAsync: {ex.Message}");
                throw;
            }
        }

        public async Task<(IEnumerable<Expense> Items, int TotalCount)> GetAllAsync(ExpenseFilter filter)
        {
            using var connection = _dbContext.GetConnection();

            var whereClauses = new List<string>();
            var parameters = new DynamicParameters();

            if (filter.ClinicIds != null && filter.ClinicIds.Any())
            {
                whereClauses.Add("e.clinic_id = ANY(@ClinicIds)");
                parameters.Add("ClinicIds", filter.ClinicIds);
            }

            if (filter.CompanyId.HasValue)
            {
                whereClauses.Add("c.company_id = @CompanyId");
                parameters.Add("CompanyId", filter.CompanyId.Value);
            }

            if (filter.StartDate.HasValue)
            {
                whereClauses.Add("DATE(e.date_of_expense) >= DATE(@StartDate)");
                parameters.Add("StartDate", filter.StartDate.Value);
            }

            if (filter.EndDate.HasValue)
            {
                whereClauses.Add("DATE(e.date_of_expense) <= DATE(@EndDate)");
                parameters.Add("EndDate", filter.EndDate.Value);
            }

            var whereClause = whereClauses.Any() ? "WHERE " + string.Join(" AND ", whereClauses) : "";
            var offset = (filter.PageNumber - 1) * filter.PageSize;

            var countSql = $@"SELECT COUNT(*) FROM expenses e
                      LEFT JOIN clinics c ON e.clinic_id = c.id
                      {whereClause}";

            var totalCount = await connection.ExecuteScalarAsync<int>(countSql, parameters);

            var sql = $@"
   SELECT 
    e.*, 
    c.id AS Id, 
    c.name AS Name, 
    c.company_id AS CompanyId
FROM expenses e
LEFT JOIN clinics c ON e.clinic_id = c.id
{whereClause}
ORDER BY e.date_of_expense DESC
LIMIT @PageSize OFFSET @Offset

";

            parameters.Add("PageSize", filter.PageSize);
            parameters.Add("Offset", offset);

            var expenseDict = new Dictionary<Guid, Expense>();

            var items = await connection.QueryAsync<Expense, Clinic, Expense>(
                sql,
                (expense, clinic) =>
                {
                    if (!expenseDict.TryGetValue(expense.Id, out var expEntry))
                    {
                        expEntry = expense;
                        expenseDict.Add(expense.Id, expEntry);
                    }

                    expEntry.ClinicDetail = clinic;
                    return expEntry;
                },
                parameters,
                splitOn: "id" // this tells Dapper when to map Clinic
            );

            return (expenseDict.Values, totalCount);

        }


        public async Task<Expense> AddAsync(Expense expense)
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                // Generate new ID if not provided
                if (expense.Id == Guid.Empty)
                {
                    expense.Id = Guid.NewGuid();
                }

                const string sql = @"
                    INSERT INTO expenses (
                        id, clinic_id, date_of_expense, category, amount, payment_mode, paid_to,
                        description, created_at, updated_at
                    ) VALUES (
                        @Id, @ClinicId, @DateOfExpense, @Category, @Amount, @PaymentMode, @PaidTo,
                        @Description, @CreatedAt, @UpdatedAt
                    )
                    RETURNING *;";
                
                return await connection.QuerySingleAsync<Expense>(sql, expense);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in AddAsync: {ex.Message}");
                throw new InvalidOperationException(ex.Message, ex);
            }
        }

        public async Task<Expense> UpdateAsync(Guid id, Expense expense)
        {
            using var connection = _dbContext.GetConnection();

            var existingExpense = await GetByIdAsync(id);
            if (existingExpense == null)
                throw new KeyNotFoundException("Expense not found.");

            var setClauses = new List<string>();
            var parameters = new DynamicParameters();
            parameters.Add("Id", id);

            if (expense.ClinicId != existingExpense.ClinicId)
            {
                setClauses.Add("clinic_id = @ClinicId");
                parameters.Add("ClinicId", expense.ClinicId);
            }
            if (expense.DateOfExpense != existingExpense.DateOfExpense)
            {
                setClauses.Add("date_of_expense = @DateOfExpense");
                parameters.Add("DateOfExpense", expense.DateOfExpense);
            }
            if (expense.Category != existingExpense.Category)
            {
                setClauses.Add("category = @Category");
                parameters.Add("Category", expense.Category);
            }
            if (expense.Amount != existingExpense.Amount)
            {
                setClauses.Add("amount = @Amount");
                parameters.Add("Amount", expense.Amount);
            }
            if (expense.PaymentMode != existingExpense.PaymentMode)
            {
                setClauses.Add("payment_mode = @PaymentMode");
                parameters.Add("PaymentMode", expense.PaymentMode);
            }
            if (expense.PaidTo != existingExpense.PaidTo)
            {
                setClauses.Add("paid_to = @PaidTo");
                parameters.Add("PaidTo", expense.PaidTo);
            }
            if (expense.Description != existingExpense.Description)
            {
                setClauses.Add("description = @Description");
                parameters.Add("Description", expense.Description);
            }

            if (setClauses.Count == 0)
                return existingExpense;

            setClauses.Add("updated_at = @UpdatedAt");
            parameters.Add("UpdatedAt", DateTimeOffset.UtcNow);

            var sql = $"UPDATE expenses SET {string.Join(", ", setClauses)} WHERE id = @Id RETURNING *;";
            var result = await connection.QuerySingleOrDefaultAsync<Expense>(sql, parameters);
            if (result == null)
                throw new KeyNotFoundException("Expense not found.");

            return result;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                const string sql = "DELETE FROM expenses WHERE id = @Id";
                var rowsAffected = await connection.ExecuteAsync(sql, new { Id = id });
                return rowsAffected > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in DeleteAsync: {ex.Message}");
                throw;
            }
        }
    }
}