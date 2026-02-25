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
    public class EmergencyPrescriptionService : IEmergencyPrescriptionService
    {
        private readonly IEmergencyPrescriptionRepository _repo;
        private readonly IMapper _mapper;

        public EmergencyPrescriptionService(IEmergencyPrescriptionRepository repo, IMapper mapper)
        {
            _repo = repo;
            _mapper = mapper;
        }

        public async Task<EmergencyPrescriptionResponseDto?> GetByIdAsync(Guid id)
        {
            var entity = await _repo.GetByIdAsync(id);
            return entity == null ? null : _mapper.Map<EmergencyPrescriptionResponseDto>(entity);
        }

        public async Task<IEnumerable<EmergencyPrescriptionResponseDto>> GetAllAsync()
        {
            var entities = await _repo.GetAllAsync();
            return _mapper.Map<IEnumerable<EmergencyPrescriptionResponseDto>>(entities);
        }

        public async Task<IEnumerable<EmergencyPrescriptionResponseDto>> GetByVisitIdAsync(Guid visitId)
        {
            var entities = await _repo.GetByVisitIdAsync(visitId);
            return _mapper.Map<IEnumerable<EmergencyPrescriptionResponseDto>>(entities);
        }

        public async Task<IEnumerable<EmergencyPrescriptionResponseDto>> GetByDischargeIdAsync(Guid dischargeId)
        {
            var entities = await _repo.GetByDischargeIdAsync(dischargeId);
            return _mapper.Map<IEnumerable<EmergencyPrescriptionResponseDto>>(entities);
        }

        public async Task<EmergencyPrescriptionResponseDto> CreateAsync(CreateEmergencyPrescriptionRequestDto dto)
        {
            var entity = _mapper.Map<EmergencyPrescription>(dto);
            entity.Id = Guid.NewGuid();
            entity.CreatedAt = DateTime.UtcNow;
            entity.UpdatedAt = DateTime.UtcNow;
            await _repo.AddAsync(entity);
            return _mapper.Map<EmergencyPrescriptionResponseDto>(entity);
        }

        public async Task<EmergencyPrescriptionResponseDto> UpdateAsync(UpdateEmergencyPrescriptionRequestDto dto)
        {
            var entity = await _repo.GetByIdAsync(dto.Id);
            if (entity == null) throw new ArgumentException("Emergency prescription not found");
            _mapper.Map(dto, entity);
            entity.UpdatedAt = DateTime.UtcNow;
            await _repo.UpdateAsync(entity);
            return _mapper.Map<EmergencyPrescriptionResponseDto>(entity);
        }

        public async Task DeleteAsync(Guid id)
        {
            await _repo.DeleteAsync(id);
        }
    }
} 