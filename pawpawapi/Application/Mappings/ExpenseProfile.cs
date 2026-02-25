using AutoMapper;
using Core.Models;
using Application.DTOs;

namespace Application.Mappings
{
    public class ExpenseProfile : Profile
    {
        public ExpenseProfile()
        {
            CreateMap<ExpenseFilterRequestDto, ExpenseFilter>();
            CreateMap<Expense, ExpenseResponseDto>();
            CreateMap<CreateExpenseRequestDto, Expense>();
            CreateMap<UpdateExpenseRequestDto, Expense>();
        }
    }
}