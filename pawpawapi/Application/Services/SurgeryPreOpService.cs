using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Core.Interfaces;
using Core.Models;
using Infrastructure.Repositories;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

namespace Application.Services
{
    public class SurgeryPreOpService : ISurgeryPreOpService
    {
        private readonly ISurgeryPreOpRepository _repository;
        private readonly IVisitRepository _visitRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<SurgeryPreOpService> _logger;

        public SurgeryPreOpService(ISurgeryPreOpRepository repository, IMapper mapper,IVisitRepository visitRepository, ILogger<SurgeryPreOpService> logger)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _visitRepository = visitRepository;
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<SurgeryPreOpResponseDto> CreateAsync(CreateSurgeryPreOpRequestDto dto)
        {
            var entity = _mapper.Map<SurgeryPreOp>(dto);
            var created = await _repository.CreateAsync(entity);
            var visit = await _visitRepository.GetByIdAsync(dto.VisitId);
            if (visit != null)
            {
                visit.IsSurgeryPreOpCompleted = dto.IsCompleted;
                await _visitRepository.UpdateAsync(visit);
            }
            return _mapper.Map<SurgeryPreOpResponseDto>(created);
        }

        public async Task<SurgeryPreOpResponseDto?> GetByIdAsync(Guid id)
        {
            var entity = await _repository.GetByIdAsync(id);
            return entity == null ? null : _mapper.Map<SurgeryPreOpResponseDto>(entity);
        }

        public async Task<SurgeryPreOpResponseDto?> GetByVisitIdAsync(Guid visitId)
        {
            var entity = await _repository.GetByVisitIdAsync(visitId);
            return entity == null ? null : _mapper.Map<SurgeryPreOpResponseDto>(entity);
        }

        public async Task<SurgeryPreOpResponseDto> UpdateAsync(UpdateSurgeryPreOpRequestDto dto)
        {
            var entity = _mapper.Map<SurgeryPreOp>(dto);
            var updated = await _repository.UpdateAsync(entity);
            var visit = await _visitRepository.GetByIdAsync(dto.VisitId);
            if (visit != null)
            {
                visit.IsSurgeryPreOpCompleted = dto.IsCompleted;
                await _visitRepository.UpdateAsync(visit);
            }
            return _mapper.Map<SurgeryPreOpResponseDto>(updated);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            return await _repository.DeleteAsync(id);
        }
    }
} 