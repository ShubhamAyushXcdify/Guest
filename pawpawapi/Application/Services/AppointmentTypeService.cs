using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Core.Interfaces;
using Core.Models;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Application.Services
{
    public class AppointmentTypeService : IAppointmentTypeService
    {
        private readonly IAppointmentTypeRepository _appointmentTypeRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<AppointmentTypeService> _logger;

        public AppointmentTypeService(
            IAppointmentTypeRepository appointmentTypeRepository,
            IMapper mapper,
            ILogger<AppointmentTypeService> logger)
        {
            _appointmentTypeRepository = appointmentTypeRepository;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<AppointmentTypeResponseDto> CreateAppointmentTypeAsync(CreateAppointmentTypeRequestDto dto)
        {
            try
            {
                if (dto == null)
                    throw new InvalidOperationException("Appointment type data cannot be null.");

                var appointmentType = _mapper.Map<AppointmentType>(dto);
                var createdAppointmentType = await _appointmentTypeRepository.AddAsync(appointmentType);
                return _mapper.Map<AppointmentTypeResponseDto>(createdAppointmentType);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CreateAppointmentTypeAsync");
                throw;
            }
        }

        public async Task<AppointmentTypeResponseDto> GetAppointmentTypeByIdAsync(Guid id)
        {
            try
            {
                var appointmentType = await _appointmentTypeRepository.GetByIdAsync(id);
                if (appointmentType == null)
                {
                    throw new KeyNotFoundException($"Appointment type with id {id} not found.");
                }
                return _mapper.Map<AppointmentTypeResponseDto>(appointmentType);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAppointmentTypeByIdAsync for appointment type {AppointmentTypeId}", id);
                throw;
            }
        }

        public async Task<IEnumerable<AppointmentTypeResponseDto>> GetAllAppointmentTypesAsync()
        {
            try
            {
                var appointmentTypes = await _appointmentTypeRepository.GetAllAsync();
                return _mapper.Map<IEnumerable<AppointmentTypeResponseDto>>(appointmentTypes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAllAppointmentTypesAsync");
                throw;
            }
        }

        public async Task<AppointmentTypeResponseDto> UpdateAppointmentTypeAsync(Guid id, UpdateAppointmentTypeRequestDto dto)
        {
            try
            {
                var existingAppointmentType = await _appointmentTypeRepository.GetByIdAsync(id);
                if (existingAppointmentType == null)
                {
                    throw new KeyNotFoundException($"Appointment type with id {id} not found.");
                }

                _mapper.Map(dto, existingAppointmentType);
                var updatedAppointmentType = await _appointmentTypeRepository.UpdateAsync(existingAppointmentType);
                return _mapper.Map<AppointmentTypeResponseDto>(updatedAppointmentType);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateAppointmentTypeAsync for appointment type {AppointmentTypeId}", id);
                throw;
            }
        }

        public async Task<bool> DeleteAppointmentTypeAsync(Guid id)
        {
            try
            {
                return await _appointmentTypeRepository.DeleteAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteAppointmentTypeAsync for appointment type {AppointmentTypeId}", id);
                throw;
            }
        }
    }
}
    