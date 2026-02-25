using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface IClientService
    {
        Task<ClientResponseDto> CreateAsync(CreateClientRequestDto dto);
        Task<ClientResponseDto> GetByIdAsync(Guid id);
        Task<PaginatedResponseDto<ClientResponseDto>> GetAllAsync(ClientFilterDto filter);
        Task<ClientResponseDto> UpdateAsync(UpdateClientRequestDto dto);
        Task<bool> DeleteAsync(Guid id);
        Task RequestDeleteOtpAsync(Guid clientId);
        Task<bool> VerifyAndDeleteClientAsync(Guid clientId, string otp);
    }
}
