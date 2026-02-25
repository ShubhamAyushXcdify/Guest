using System;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface IExpenseService
    {
        Task<ExpenseResponseDto?> GetByIdAsync(Guid id);
        Task<PaginatedResponseDto<ExpenseResponseDto>> GetAllAsync(ExpenseFilterRequestDto filter);
        Task<ExpenseResponseDto> CreateAsync(CreateExpenseRequestDto dto);
        Task<ExpenseResponseDto> UpdateAsync(Guid id,UpdateExpenseRequestDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}