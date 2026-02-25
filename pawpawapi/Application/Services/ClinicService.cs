using System;
using System.Collections.Generic;
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
    public class ClinicService : IClinicService
    {
        private readonly IClinicRepository _clinicRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<ClinicService> _logger;

        public ClinicService(
            IClinicRepository clinicRepository,
            IMapper mapper,
            ILogger<ClinicService> logger)
        {
            _clinicRepository = clinicRepository ?? throw new ArgumentNullException(nameof(clinicRepository));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<PaginatedResponseDto<ClinicResponseDto>> GetAllAsync(
            int pageNumber,
            int pageSize,
            bool paginationRequired,
            ClinicFilterDto filter)
        {
            try
            {
                var (clinics, totalCount) = await _clinicRepository.GetAllAsync(
                    pageNumber,
                    pageSize,
                    paginationRequired,
                    filter.CompanyId,
                    filter.UserId,
                    filter.Name,
                    filter.City,
                    filter.State,
                    filter.Country,
                    filter.Phone,
                    filter.Email);

                var dtos = _mapper.Map<IEnumerable<ClinicResponseDto>>(clinics).ToList();

                return new PaginatedResponseDto<ClinicResponseDto>
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

        public async Task<ClinicResponseDto> GetByIdAsync(Guid id)
        {
            try
            {
                var clinic = await _clinicRepository.GetByIdAsync(id);
                if (clinic == null)
                {
                    throw new KeyNotFoundException($"Clinic with id {id} not found.");
                }
                return _mapper.Map<ClinicResponseDto>(clinic);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByIdAsync for clinic {ClinicId}", id);
                throw;
            }
        }

        public async Task<ClinicResponseDto> CreateAsync(CreateClinicRequestDto dto)
        {
            try
            {
                if (dto == null)
                    throw new InvalidOperationException("Clinic data cannot be null.");

                var clinic = _mapper.Map<Clinic>(dto);
                var created = await _clinicRepository.AddAsync(clinic);
                return _mapper.Map<ClinicResponseDto>(created);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CreateAsync");
                throw;
            }
        }

        public async Task<ClinicResponseDto> UpdateAsync(UpdateClinicRequestDto dto)
        {
            try
            {
                if (dto == null)
                    throw new InvalidOperationException("Clinic data cannot be null.");

                var clinic = _mapper.Map<Clinic>(dto);
                var updated = await _clinicRepository.UpdateAsync(clinic);
                return _mapper.Map<ClinicResponseDto>(updated);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateAsync for clinic {ClinicId}", dto?.Id);
                throw;
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            try
            {
                return await _clinicRepository.DeleteAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteAsync for clinic {ClinicId}", id);
                throw;
            }
        }
    }
}
