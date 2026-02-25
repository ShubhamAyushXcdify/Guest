using System;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface IIntakeDetailService
    {
        Task<IntakeDetailResponseDto> GetByIdAsync(Guid id);
        Task<IntakeDetailResponseDto> GetByVisitIdAsync(Guid visitId);
        Task<IntakeDetailResponseDto> CreateAsync(CreateIntakeDetailRequestDto dto);
        Task<IntakeDetailResponseDto> UpdateAsync(UpdateIntakeDetailRequestDto dto);
        Task<bool> DeleteAsync(Guid id);
        Task<DeleteFileResponseDto> DeleteFileAsync(Guid fileId);
    }
} 