using System;
using System.Threading.Tasks;
using System.Linq;
using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Core.Interfaces;
using Core.Models;
using Microsoft.Extensions.Logging;

namespace Application.Services
{
    public class VisitService : IVisitService
    {
        private readonly IVisitRepository _visitRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<VisitService> _logger;

        public VisitService(
            IVisitRepository visitRepository,
            IMapper mapper,
            ILogger<VisitService> logger)
        {
            _visitRepository = visitRepository;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<VisitResponseDto?> GetByIdAsync(Guid id)
        {
            var visit = await _visitRepository.GetByIdAsync(id);
            return visit == null ? null : _mapper.Map<VisitResponseDto>(visit);
        }

        public async Task<PaginatedResponseDto<VisitResponseDto>> GetAllAsync(
            int pageNumber = 1,
            int pageSize = 10,
            bool paginationRequired = true)
        {
            try
            {
                var (visits, totalCount) = await _visitRepository.GetAllAsync(
                    pageNumber,
                    pageSize,
                    paginationRequired);

                var dtos = _mapper.Map<System.Collections.Generic.IEnumerable<VisitResponseDto>>(visits).ToList();

                return new PaginatedResponseDto<VisitResponseDto>
                {
                    Items = dtos,
                    TotalCount = totalCount,
                    PageNumber = paginationRequired ? pageNumber : 1,
                    PageSize = paginationRequired ? pageSize : totalCount,
                    TotalPages = paginationRequired ? (int)Math.Ceiling(totalCount / (double)pageSize) : 1,
                    HasPreviousPage = paginationRequired && pageNumber > 1,
                    HasNextPage = paginationRequired && pageNumber < (int)Math.Ceiling(totalCount / (double)pageSize)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAllAsync");
                throw;
            }
        }

        public async Task<VisitResponseDto> CreateAsync(CreateVisitRequestDto dto)
        {
            var visit = _mapper.Map<Visit>(dto);
            var created = await _visitRepository.AddAsync(visit);
            return _mapper.Map<VisitResponseDto>(created);
        }

        public async Task<VisitResponseDto> UpdateAsync(Guid id, UpdateVisitRequestDto dto)
        {
            var visit = await _visitRepository.GetByIdAsync(id);
            if (visit == null)
                throw new ArgumentException("Visit not found");
            _mapper.Map(dto, visit);
            var updated = await _visitRepository.UpdateAsync(visit);
            return _mapper.Map<VisitResponseDto>(updated);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            return await _visitRepository.DeleteAsync(id);
        }

        public async Task<VisitResponseDto?> GetByAppointmentIdAsync(Guid appointmentId)
        {
            var visit = await _visitRepository.GetByAppointmentIdAsync(appointmentId);
            return visit == null ? null : _mapper.Map<VisitResponseDto>(visit);
        }

        public async Task<VisitResponseDto?> GetByPatientIdAsync(Guid patientId)
        {
            var visit = await _visitRepository.GetByPatientIdAsync(patientId);
            return visit == null ? null : _mapper.Map<VisitResponseDto>(visit);
        }
    }
} 