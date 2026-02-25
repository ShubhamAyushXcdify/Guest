using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Core.Interfaces;
using Core.Models;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Application.Services
{
    public class ScreenService : IScreenService
    {
        private readonly IScreenRepository _screenRepository;
        private readonly IScreenAccessRepository _screenAccessRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<ScreenService> _logger;

        public ScreenService(
            IScreenRepository screenRepository,
            IScreenAccessRepository screenAccessRepository,
            IMapper mapper,
            ILogger<ScreenService> logger)
        {
            _screenRepository = screenRepository;
            _screenAccessRepository = screenAccessRepository;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<ScreenResponseDto> CreateScreenAsync(CreateScreenRequestDto dto)
        {
            try
            {
                if (dto == null)
                    throw new InvalidOperationException("Screen data cannot be null.");

                var screen = _mapper.Map<Screen>(dto);
                var createdScreen = await _screenRepository.AddAsync(screen);
                return _mapper.Map<ScreenResponseDto>(createdScreen);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CreateScreenAsync");
                throw;
            }
        }

        public async Task<ScreenResponseDto> GetScreenByIdAsync(Guid id)
        {
            try
            {
                var screen = await _screenRepository.GetByIdAsync(id);
                if (screen == null)
                {
                    throw new KeyNotFoundException($"Screen with id {id} not found.");
                }

                return _mapper.Map<ScreenResponseDto>(screen);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetScreenByIdAsync for screen {ScreenId}", id);
                throw;
            }
        }

        public async Task<IEnumerable<ScreenResponseDto>> GetAllScreensAsync()
        {
            try
            {
                var screens = await _screenRepository.GetAllAsync();
                return _mapper.Map<IEnumerable<ScreenResponseDto>>(screens);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAllScreensAsync");
                throw;
            }
        }

        public async Task<ScreenResponseDto> UpdateScreenAsync(Guid id, UpdateScreenRequestDto dto)
        {
            try
            {
                var existingScreen = await _screenRepository.GetByIdAsync(id);
                if (existingScreen == null)
                {
                    throw new KeyNotFoundException($"Screen with id {id} not found.");
                }

                _mapper.Map(dto, existingScreen);
                var updatedScreen = await _screenRepository.UpdateAsync(existingScreen);
                return _mapper.Map<ScreenResponseDto>(updatedScreen);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateScreenAsync for screen {ScreenId}", id);
                throw;
            }
        }

        public async Task<bool> DeleteScreenAsync(Guid id)
        {
            try
            {
                var existingScreen = await _screenRepository.GetByIdAsync(id);
                if (existingScreen == null)
                {
                    throw new KeyNotFoundException($"Screen with id {id} not found.");
                }

                return await _screenRepository.DeleteAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteScreenAsync for screen {ScreenId}", id);
                throw;
            }
        }

        public async Task<IEnumerable<ScreenAccessResponseDto>> GetScreenAccessByClinicIdAsync(Guid clinicId, Guid? roleId = null)
        {
            try
            {
                var screenAccess = await _screenAccessRepository.GetByClinicIdAsync(clinicId, roleId);
                return _mapper.Map<IEnumerable<ScreenAccessResponseDto>>(screenAccess);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetScreenAccessByCompanyIdAsync for company {CompanyId} and role {RoleId}", clinicId, roleId);
                throw;
            }
        }

        public async Task<bool> UpdateScreenAccessAsync(UpdateScreenAccessRequestDto dto)
        {
            try
            {
                if (dto == null || !dto.ScreenIds.Any())
                {
                    throw new InvalidOperationException("Screen access data cannot be null or empty.");
                }

                var tasks = dto.ScreenIds.Select(screenId =>
                    _screenAccessRepository.UpsertScreenAccessAsync(
                        screenId,
                        dto.RoleId,
                        dto.ClinicId,
                        dto.IsAccessEnable));

                var results = await Task.WhenAll(tasks);
                return results.All(result => result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateScreenAccessAsync");
                throw;
            }
        }
    }
}
