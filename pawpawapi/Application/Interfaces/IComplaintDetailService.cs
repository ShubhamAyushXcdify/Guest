using System;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface IComplaintDetailService
    {
        Task<ComplaintDetailResponseDto> GetByIdAsync(Guid id);
        Task<ComplaintDetailResponseDto> GetByVisitIdAsync(Guid visitId);
        Task<ComplaintDetailResponseDto> CreateAsync(CreateComplaintDetailRequestDto dto);
        Task<ComplaintDetailResponseDto> UpdateAsync(UpdateComplaintDetailRequestDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
} 