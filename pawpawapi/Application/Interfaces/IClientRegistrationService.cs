using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface IClientRegistrationService
    {
        Task<ClientRegistrationResponseDto> RegisterAsync(ClientRegistrationRequestDto dto);
        Task<ClientRegistrationResponseDto> GetByIdAsync(Guid id);
        Task<PaginatedResponseDto<ClientRegistrationResponseDto>> GetAllAsync(int pageNumber, int pageSize, string? status = null);
        Task<ClientRegistrationResponseDto> ApproveRegistrationAsync(ApproveClientRegistrationRequestDto dto, Guid approvedByUserId);
        Task<IEnumerable<ClientRegistrationResponseDto>> GetPendingRegistrationsAsync();
        Task<bool> DeleteAsync(Guid id);
    }
} 