using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;
using Core.Common;

namespace Application.Interfaces
{
    public interface IRoleService
    {
        Task<Result<RoleDto>> CreateAsync(CreateRoleDto dto);
        Task<Result<RoleDto>> GetByIdAsync(Guid id);
        Task<Result<IEnumerable<RoleDto>>> GetAllAsync();
        Task<Result<RoleDto>> UpdateAsync(Guid id, UpdateRoleDto dto);
        Task<Result<bool>> DeleteAsync(Guid id);
    }
}
