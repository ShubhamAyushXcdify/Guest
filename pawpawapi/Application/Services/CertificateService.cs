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
    public class CertificateService : ICertificateService
    {
        private readonly ICertificateRepository _certificateRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<CertificateService> _logger;

        public CertificateService(
            ICertificateRepository certificateRepository,
            IMapper mapper,
            ILogger<CertificateService> logger)
        {
            _certificateRepository = certificateRepository;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<CertificatesByVisitResponseDto> CreateCertificatesAsync(CreateCertificateRequestDto dto)
        {
            try
            {
                if (dto == null)
                    throw new InvalidOperationException("Certificate data cannot be null.");

                if (dto.Certificates == null || !dto.Certificates.Any())
                    throw new InvalidOperationException("Certificates array cannot be empty.");

                var certificates = dto.Certificates.Select(c =>
                {
                    var cert = _mapper.Map<Certificate>(c);
                    cert.VisitId = dto.VisitId;
                    return cert;
                }).ToList();

                var createdCertificates = await _certificateRepository.AddBatchAsync(certificates);

                return new CertificatesByVisitResponseDto
                {
                    VisitId = dto.VisitId,
                    Certificates = _mapper.Map<List<CertificateItemResponseDto>>(createdCertificates)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CreateCertificatesAsync");
                throw;
            }
        }

        public async Task<CertificateResponseDto> GetCertificateByIdAsync(Guid id)
        {
            try
            {
                var certificate = await _certificateRepository.GetByIdAsync(id);
                if (certificate == null)
                {
                    throw new KeyNotFoundException($"Certificate with id {id} not found.");
                }
                return _mapper.Map<CertificateResponseDto>(certificate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetCertificateByIdAsync for certificate {CertificateId}", id);
                throw;
            }
        }

        public async Task<IEnumerable<CertificateResponseDto>> GetAllCertificatesAsync()
        {
            try
            {
                var certificates = await _certificateRepository.GetAllAsync();
                return _mapper.Map<IEnumerable<CertificateResponseDto>>(certificates);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAllCertificatesAsync");
                throw;
            }
        }

        public async Task<CertificatesByVisitResponseDto> GetCertificatesByVisitIdAsync(Guid visitId)
        {
            try
            {
                var certificates = await _certificateRepository.GetByVisitIdAsync(visitId);
                
                return new CertificatesByVisitResponseDto
                {
                    VisitId = visitId,
                    Certificates = _mapper.Map<List<CertificateItemResponseDto>>(certificates)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetCertificatesByVisitIdAsync for visit {VisitId}", visitId);
                throw;
            }
        }

        public async Task<CertificatesByVisitResponseDto> UpdateCertificatesAsync(UpdateCertificateRequestDto dto)
        {
            try
            {
                if (dto == null)
                    throw new InvalidOperationException("Certificate data cannot be null.");

                // Delete existing certificates for this visit
                await _certificateRepository.DeleteByVisitIdAsync(dto.VisitId);

                // Add new certificates
                var certificates = dto.Certificates.Select(c =>
                {
                    var cert = _mapper.Map<Certificate>(c);
                    cert.VisitId = dto.VisitId;
                    return cert;
                }).ToList();

                var createdCertificates = await _certificateRepository.AddBatchAsync(certificates);

                return new CertificatesByVisitResponseDto
                {
                    VisitId = dto.VisitId,
                    Certificates = _mapper.Map<List<CertificateItemResponseDto>>(createdCertificates)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateCertificatesAsync for visit {VisitId}", dto?.VisitId);
                throw;
            }
        }

        public async Task<CertificateResponseDto> UpdateCertificateAsync(Guid id, UpdateCertificateItemRequestDto dto)
        {
            try
            {
                if (dto == null)
                    throw new InvalidOperationException("Certificate data cannot be null.");

                // Get existing certificate to preserve VisitId and CreatedAt
                var existingCertificate = await _certificateRepository.GetByIdAsync(id);
                if (existingCertificate == null)
                {
                    throw new KeyNotFoundException($"Certificate with id {id} not found.");
                }

                // Map the update DTO to certificate model
                var certificate = _mapper.Map<Certificate>(dto);
                certificate.Id = id;
                certificate.VisitId = existingCertificate.VisitId; // Preserve original VisitId
                certificate.CreatedAt = existingCertificate.CreatedAt; // Preserve original CreatedAt
                certificate.UpdatedAt = DateTimeOffset.UtcNow; // Update the timestamp

                var updatedCertificate = await _certificateRepository.UpdateAsync(certificate);
                if (updatedCertificate == null)
                {
                    throw new KeyNotFoundException($"Certificate with id {id} not found.");
                }

                return _mapper.Map<CertificateResponseDto>(updatedCertificate);
            }
            catch (KeyNotFoundException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateCertificateAsync for certificate {CertificateId}", id);
                throw;
            }
        }

        public async Task<bool> DeleteCertificateAsync(Guid id)
        {
            try
            {
                return await _certificateRepository.DeleteAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteCertificateAsync for certificate {CertificateId}", id);
                throw;
            }
        }

        public async Task<bool> DeleteCertificatesByVisitIdAsync(Guid visitId)
        {
            try
            {
                return await _certificateRepository.DeleteByVisitIdAsync(visitId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteCertificatesByVisitIdAsync for visit {VisitId}", visitId);
                throw;
            }
        }
    }
}