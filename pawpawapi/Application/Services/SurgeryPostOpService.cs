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
    public class SurgeryPostOpService : ISurgeryPostOpService
    {
        private readonly ISurgeryPostOpRepository _repository;
        private readonly IVisitRepository _visitRepository;
        private readonly IMapper _mapper;

        public SurgeryPostOpService(ISurgeryPostOpRepository repository,IVisitRepository visitRepository, IMapper mapper)
        {
            _visitRepository = visitRepository;
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<SurgeryPostOpResponseDto> GetByIdAsync(Guid id)
        {
            var entity = await _repository.GetByIdAsync(id);
            return entity == null ? null : _mapper.Map<SurgeryPostOpResponseDto>(entity);
        }

        public async Task<SurgeryPostOpResponseDto> GetByVisitIdAsync(Guid visitId)
        {
            var entity = await _repository.GetByVisitIdAsync(visitId);
            return entity == null ? null : _mapper.Map<SurgeryPostOpResponseDto>(entity);
        }

        public async Task<SurgeryPostOpResponseDto> CreateAsync(CreateSurgeryPostOpRequestDto dto)
        {
            var entity = _mapper.Map<SurgeryPostOp>(dto);
            entity.Id = Guid.NewGuid();
            entity.CreatedAt = DateTime.UtcNow;
            entity.UpdatedAt = DateTime.UtcNow;
            var id = await _repository.CreateAsync(entity);
            entity.Id = id;
            var visit = await _visitRepository.GetByIdAsync(dto.VisitId);
            if (visit != null)
            {
                visit.IsSurgeryPostOpCompleted = dto.IsCompleted;
                await _visitRepository.UpdateAsync(visit);
            }
            return _mapper.Map<SurgeryPostOpResponseDto>(entity);
        }

        public async Task<SurgeryPostOpResponseDto> UpdateAsync(UpdateSurgeryPostOpRequestDto dto)
        {
            var entity = _mapper.Map<SurgeryPostOp>(dto);
            entity.UpdatedAt = DateTime.UtcNow;
            var updated = await _repository.UpdateAsync(entity);
            if (!updated) return null;
            var visit = await _visitRepository.GetByIdAsync(dto.VisitId);
            if (visit != null)
            {
                visit.IsSurgeryPostOpCompleted = dto.IsCompleted;
                await _visitRepository.UpdateAsync(visit);
            }
            return _mapper.Map<SurgeryPostOpResponseDto>(entity);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            return await _repository.DeleteAsync(id);
        }
    }
} 