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
    public class SurgeryDetailService : ISurgeryDetailService
    {
        private readonly ISurgeryDetailRepository _repository;
        private readonly IVisitRepository _visitRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<SurgeryDetailService> _logger;

        public SurgeryDetailService(ISurgeryDetailRepository repository,IVisitRepository visitRepository, IMapper mapper, ILogger<SurgeryDetailService> logger)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _visitRepository = visitRepository;
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<SurgeryDetailResponseDto> CreateAsync(CreateSurgeryDetailRequestDto dto)
        {
            var entity = _mapper.Map<SurgeryDetail>(dto);
            var created = await _repository.CreateAsync(entity);
            var visit = await _visitRepository.GetByIdAsync(dto.VisitId);
            if (visit != null)
            {
                visit.IsSurgeryDetailsCompleted = dto.IsCompleted;
                await _visitRepository.UpdateAsync(visit);
            }
            return _mapper.Map<SurgeryDetailResponseDto>(created);
        }

        public async Task<SurgeryDetailResponseDto?> GetByIdAsync(Guid id)
        {
            var entity = await _repository.GetByIdAsync(id);
            return entity == null ? null : _mapper.Map<SurgeryDetailResponseDto>(entity);
        }

        public async Task<SurgeryDetailResponseDto?> GetByVisitIdAsync(Guid visitId)
        {
            var entity = await _repository.GetByVisitIdAsync(visitId);
            return entity == null ? null : _mapper.Map<SurgeryDetailResponseDto>(entity);
        }

        public async Task<SurgeryDetailResponseDto> UpdateAsync(UpdateSurgeryDetailRequestDto dto)
        {
            var entity = _mapper.Map<SurgeryDetail>(dto);
            var updated = await _repository.UpdateAsync(entity);
            var visit = await _visitRepository.GetByIdAsync(dto.VisitId);
            if (visit != null)
            {
                visit.IsSurgeryDetailsCompleted = dto.IsCompleted;
                await _visitRepository.UpdateAsync(visit);
            }
            return _mapper.Map<SurgeryDetailResponseDto>(updated);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            return await _repository.DeleteAsync(id);
        }
    }
} 