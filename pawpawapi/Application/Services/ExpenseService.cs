using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Core.Interfaces;
using Core.Models;
using System.Linq;

namespace Application.Services
{
    public class ExpenseService : IExpenseService
    {
        private readonly IExpenseRepository _expenseRepository;
        private readonly IClinicService _clinicService;
        private readonly IMapper _mapper;

        public ExpenseService(IExpenseRepository expenseRepository, IClinicService clinicService, IMapper mapper)
        {
            _expenseRepository = expenseRepository ?? throw new ArgumentNullException(nameof(expenseRepository));
            _clinicService = clinicService ?? throw new ArgumentNullException(nameof(clinicService));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        }

        public async Task<ExpenseResponseDto?> GetByIdAsync(Guid id)
        {
            try
            {
                var expense = await _expenseRepository.GetByIdAsync(id);
                if (expense == null)
                    throw new KeyNotFoundException($"Expense with ID {id} not found.");
                
                var expenseDto = _mapper.Map<ExpenseResponseDto>(expense);
                
                // Fetch clinic details if ClinicId is available
                if (expense.ClinicId.HasValue)
                {
                    try
                    {
                        var clinic = await _clinicService.GetByIdAsync(expense.ClinicId.Value);
                        if (clinic != null)
                        {
                            expenseDto.ClinicDetail = clinic;
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error fetching clinic details for expense {id}: {ex.Message}");
                        // Continue without clinic details if there's an error
                    }
                }
                
                return expenseDto;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetByIdAsync: {ex.Message}");
                throw;
            }
        }

        public async Task<PaginatedResponseDto<ExpenseResponseDto>> GetAllAsync(ExpenseFilterRequestDto requestDto)
        {
            var filter = _mapper.Map<ExpenseFilter>(requestDto);

            var (items, totalCount) = await _expenseRepository.GetAllAsync(filter);

            var dtos = _mapper.Map<IEnumerable<ExpenseResponseDto>>(items).ToList();

            return new PaginatedResponseDto<ExpenseResponseDto>
            {
                Items = dtos,
                TotalCount = totalCount,
                PageNumber = filter.PageNumber,
                PageSize = filter.PageSize,
                TotalPages = (int)Math.Ceiling(totalCount / (double)filter.PageSize),
                HasPreviousPage = filter.PageNumber > 1,
                HasNextPage = filter.PageNumber < (int)Math.Ceiling(totalCount / (double)filter.PageSize)
            };
        }
        public async Task<ExpenseResponseDto> CreateAsync(CreateExpenseRequestDto dto)
        {
            try
            {
                if (dto == null)
                    throw new ArgumentNullException(nameof(dto));

                if (string.IsNullOrWhiteSpace(dto.Category))
                    throw new ArgumentException("Expense category is required");

                if (string.IsNullOrWhiteSpace(dto.PaymentMode))
                    throw new ArgumentException("Payment mode is required");

                if (string.IsNullOrWhiteSpace(dto.PaidTo))
                    throw new ArgumentException("Paid to field is required");

                //if (string.IsNullOrWhiteSpace(dto.Status))
                //    throw new ArgumentException("Status is required");

                if (dto.ClinicId.HasValue)
                {
                    var clinic = await _clinicService.GetByIdAsync(dto.ClinicId.Value);
                    if (clinic == null)
                        throw new ArgumentException($"Clinic with ID {dto.ClinicId} does not exist");
                }

                var expense = _mapper.Map<Expense>(dto);
                expense.CreatedAt = DateTimeOffset.UtcNow;
                expense.UpdatedAt = DateTimeOffset.UtcNow;

                var createdExpense = await _expenseRepository.AddAsync(expense);
                return _mapper.Map<ExpenseResponseDto>(createdExpense);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in CreateAsync: {ex.Message}");
                throw;
            }
        }

        public async Task<ExpenseResponseDto> UpdateAsync(Guid id, UpdateExpenseRequestDto dto)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            var existingExpense = await _expenseRepository.GetByIdAsync(id);
            if (existingExpense == null)
                throw new KeyNotFoundException($"Expense with ID {id} not found.");

            if (string.IsNullOrWhiteSpace(dto.Category))
                throw new ArgumentException("Expense category is required");

            if (string.IsNullOrWhiteSpace(dto.PaymentMode))
                throw new ArgumentException("Payment mode is required");

            if (string.IsNullOrWhiteSpace(dto.PaidTo))
                throw new ArgumentException("Paid to field is required");

            var expense = _mapper.Map<Expense>(dto);
            expense.Id = id; // 🔑 ensure route ID is used
            expense.UpdatedAt = DateTimeOffset.UtcNow;

            var updatedExpense = await _expenseRepository.UpdateAsync(id, expense);

            var responseDto = _mapper.Map<ExpenseResponseDto>(updatedExpense);

            if (updatedExpense.ClinicId.HasValue)
            {
                var clinicDto = await _clinicService.GetByIdAsync(updatedExpense.ClinicId.Value);
                responseDto.ClinicDetail = clinicDto;
            }
            return responseDto;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            try
            {
                var existingExpense = await _expenseRepository.GetByIdAsync(id);
                if (existingExpense == null)
                    throw new KeyNotFoundException($"Expense with ID {id} not found.");

                return await _expenseRepository.DeleteAsync(id);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in DeleteAsync: {ex.Message}");
                throw;
            }
        }
    }
}