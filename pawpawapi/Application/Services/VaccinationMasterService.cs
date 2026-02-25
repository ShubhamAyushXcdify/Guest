using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Core.Interfaces;
using Core.Models;

namespace Application.Services
{
    public class VaccinationMasterService : IVaccinationMasterService
    {
        private readonly IVaccinationMasterRepository _repository;
        private readonly IMapper _mapper;

        public VaccinationMasterService(IVaccinationMasterRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<VaccinationMasterResponseDto> CreateAsync(CreateVaccinationMasterRequestDto dto)
        {
            var entity = _mapper.Map<VaccinationMaster>(dto);
            entity.Id = Guid.NewGuid();
            entity.CreatedAt = DateTimeOffset.UtcNow;
            entity.UpdatedAt = DateTimeOffset.UtcNow;
            var created = await _repository.CreateAsync(entity);
            return _mapper.Map<VaccinationMasterResponseDto>(created);
        }

        public async Task<VaccinationMasterResponseDto?> GetByIdAsync(Guid id)
        {
            var entity = await _repository.GetByIdAsync(id);
            return entity == null ? null : _mapper.Map<VaccinationMasterResponseDto>(entity);
        }

        public async Task<IEnumerable<VaccinationMasterResponseDto>> GetAllAsync(string? species = null, bool? isCore = null)
        {
            var entities = await _repository.GetAllAsync(species, isCore);
            return _mapper.Map<IEnumerable<VaccinationMasterResponseDto>>(entities);
        }

        public async Task<VaccinationMasterResponseDto> UpdateAsync(UpdateVaccinationMasterRequestDto dto)
        {
            var entity = _mapper.Map<VaccinationMaster>(dto);
            entity.UpdatedAt = DateTimeOffset.UtcNow;
            var updated = await _repository.UpdateAsync(entity);
            return _mapper.Map<VaccinationMasterResponseDto>(updated);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            return await _repository.DeleteAsync(id);
        }
    }
} 