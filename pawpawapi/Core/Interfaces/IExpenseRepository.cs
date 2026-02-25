using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;

namespace Core.Interfaces
{
    public interface IExpenseRepository
    {
        Task<Expense?> GetByIdAsync(Guid id);
        Task<(IEnumerable<Expense> Items, int TotalCount)> GetAllAsync(ExpenseFilter filter);
        Task<Expense> AddAsync(Expense expense);
        Task<Expense> UpdateAsync(Guid id,Expense expense);
        Task<bool> DeleteAsync(Guid id);
    }
}