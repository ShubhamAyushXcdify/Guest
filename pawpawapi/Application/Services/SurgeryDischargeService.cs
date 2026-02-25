using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Core.Interfaces;
using Core.Models;
using Infrastructure.Repositories;
using System;
using System.Threading.Tasks;

namespace Application.Services
{
    public class SurgeryDischargeService : ISurgeryDischargeService
    {
        private readonly ISurgeryDischargeRepository _repository;
        private readonly IVisitRepository _visitRepository;
        private readonly IMapper _mapper;

        public SurgeryDischargeService(ISurgeryDischargeRepository repository, IVisitRepository visitRepository, IMapper mapper)
        {
            _visitRepository = visitRepository;
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<SurgeryDischargeResponseDto> GetByIdAsync(Guid id)
        {
            var entity = await _repository.GetByIdAsync(id);
            return entity == null ? null : _mapper.Map<SurgeryDischargeResponseDto>(entity);
        }

        public async Task<SurgeryDischargeResponseDto> GetByVisitIdAsync(Guid visitId)
        {
            var entity = await _repository.GetByVisitIdAsync(visitId);
            return entity == null ? null : _mapper.Map<SurgeryDischargeResponseDto>(entity);
        }

        public async Task<SurgeryDischargeResponseDto> CreateAsync(CreateSurgeryDischargeRequestDto dto)
        {
            var entity = _mapper.Map<SurgeryDischarge>(dto);
            entity.Id = Guid.NewGuid();
            entity.CreatedAt = DateTime.UtcNow;
            entity.UpdatedAt = DateTime.UtcNow;
            var id = await _repository.CreateAsync(entity);
            entity.Id = id;
            var visit = await _visitRepository.GetByIdAsync(dto.VisitId);
            if (visit != null)
            {
                visit.IsSurgeryDischargeCompleted = dto.IsCompleted;
                await _visitRepository.UpdateAsync(visit);
            }
            return _mapper.Map<SurgeryDischargeResponseDto>(entity);
        }

        public async Task<SurgeryDischargeResponseDto> UpdateAsync(UpdateSurgeryDischargeRequestDto dto)
        {
            var entity = _mapper.Map<SurgeryDischarge>(dto);
            entity.UpdatedAt = DateTime.UtcNow;
            var updated = await _repository.UpdateAsync(entity);
            if (!updated) return null;
            var visit = await _visitRepository.GetByIdAsync(dto.VisitId);
            if (visit != null)
            {
                visit.IsSurgeryDischargeCompleted = dto.IsCompleted;
                await _visitRepository.UpdateAsync(visit);
            }
            return _mapper.Map<SurgeryDischargeResponseDto>(entity);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            return await _repository.DeleteAsync(id);
        }
    }
} 