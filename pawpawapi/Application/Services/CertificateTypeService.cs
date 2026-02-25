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
    public class CertificateTypeService : ICertificateTypeService
    {
        private readonly ICertificateTypeRepository _certificateTypeRepository;
        private readonly IMapper _mapper;

        public CertificateTypeService(ICertificateTypeRepository certificateTypeRepository, IMapper mapper)
        {
            _certificateTypeRepository = certificateTypeRepository;
            _mapper = mapper;
        }

        public async Task<CertificateTypeDto> CreateCertificateTypeAsync(CreateCertificateTypeDto dto)
        {
            try
            {
                var certificateType = _mapper.Map<CertificateType>(dto);
                var result = await _certificateTypeRepository.CreateAsync(certificateType);
                return _mapper.Map<CertificateTypeDto>(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in CreateCertificateTypeAsync: {ex.Message}");
                throw new InvalidOperationException(ex.Message, ex);
            }
        }

        public async Task<CertificateTypeDto> GetCertificateTypeByIdAsync(Guid id)
        {
            try
            {
                var certificateType = await _certificateTypeRepository.GetByIdAsync(id);
                if (certificateType == null)
                    throw new InvalidOperationException("Certificate type not found.");

                return _mapper.Map<CertificateTypeDto>(certificateType);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetCertificateTypeByIdAsync: {ex.Message}");
                throw;
            }
        }

        public async Task<IEnumerable<CertificateTypeDto>> GetAllCertificateTypesAsync()
        {
            try
            {
                var certificateTypes = await _certificateTypeRepository.GetAllAsync();
                return _mapper.Map<IEnumerable<CertificateTypeDto>>(certificateTypes);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetAllCertificateTypesAsync: {ex.Message}");
                throw;
            }
        }

        public async Task<CertificateTypeDto> UpdateCertificateTypeAsync(Guid id, UpdateCertificateTypeDto dto)
        {
            try
            {
                var certificateType = await _certificateTypeRepository.GetByIdAsync(id);
                if (certificateType == null)
                    throw new KeyNotFoundException("Certificate type not found.");

                _mapper.Map(dto, certificateType);
                var result = await _certificateTypeRepository.UpdateAsync(certificateType);
                return _mapper.Map<CertificateTypeDto>(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in UpdateCertificateTypeAsync: {ex.Message}");
                throw;
            }
        }

        public async Task<bool> DeleteCertificateTypeAsync(Guid id)
        {
            try
            {
                return await _certificateTypeRepository.DeleteAsync(id);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in DeleteCertificateTypeAsync: {ex.Message}");
                throw;
            }
        }
    }
}

