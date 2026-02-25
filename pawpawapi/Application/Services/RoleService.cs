using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Core.Common;
using Core.Interfaces;
using Core.Models;

namespace Application.Services
{
    public class RoleService : IRoleService
    {
        private readonly IRoleRepository _repository;
        private readonly IMapper _mapper;

        public RoleService(IRoleRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<Result<RoleDto>> CreateAsync(CreateRoleDto dto)
        {
            if (dto is null)
                return Result<RoleDto>.Failure("Role data is required.", ErrorType.Validation);

            var entity = _mapper.Map<Role>(dto);
            entity.CreatedAt = DateTimeOffset.UtcNow;
            entity.UpdatedAt = DateTimeOffset.UtcNow;
            var created = await _repository.CreateAsync(entity);
            return Result<RoleDto>.Success(_mapper.Map<RoleDto>(created));
        }

        public async Task<Result<bool>> DeleteAsync(Guid id)
        {
            if (id == default)
                return Result<bool>.Failure("ID cannot be default value.", ErrorType.Validation);

            var existing = await _repository.GetByIdAsync(id);
            if (existing is null)
                return Result<bool>.Failure("Role not found.", ErrorType.NotFound);

            var deleted = await _repository.DeleteAsync(id);
            return Result<bool>.Success(deleted);
        }

        public async Task<Result<IEnumerable<RoleDto>>> GetAllAsync()
        {
            var items = await _repository.GetAllAsync();
            return Result<IEnumerable<RoleDto>>.Success(_mapper.Map<IEnumerable<RoleDto>>(items));
        }

        public async Task<Result<RoleDto>> GetByIdAsync(Guid id)
        {
            if (id == default)
                return Result<RoleDto>.Failure("ID cannot be default value.", ErrorType.Validation);

            var entity = await _repository.GetByIdAsync(id);
            if (entity is null)
                return Result<RoleDto>.Failure("Role not found.", ErrorType.NotFound);

            return Result<RoleDto>.Success(_mapper.Map<RoleDto>(entity));
        }

        public async Task<Result<RoleDto>> UpdateAsync(Guid id, UpdateRoleDto dto)
        {
            if (dto is null)
                return Result<RoleDto>.Failure("Role data is required.", ErrorType.Validation);
            if (id == default)
                return Result<RoleDto>.Failure("ID cannot be default value.", ErrorType.Validation);

            var existing = await _repository.GetByIdAsync(id);
            if (existing is null)
                return Result<RoleDto>.Failure("Role not found.", ErrorType.NotFound);

            _mapper.Map(dto, existing);
            existing.UpdatedAt = DateTimeOffset.UtcNow;
            var updated = await _repository.UpdateAsync(existing);
            return Result<RoleDto>.Success(_mapper.Map<RoleDto>(updated));
        }
    }
}
