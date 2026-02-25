using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Core.Interfaces;
using Core.Models;
using Core.DTOs;

namespace Application.Services
{
    public class SupplierService : ISupplierService
    {
        private readonly ISupplierRepository _supplierRepository;
        private readonly IClinicService _clinicService;
        private readonly IMapper _mapper;

        public SupplierService(ISupplierRepository supplierRepository, IClinicService clinicService, IMapper mapper)
        {
            _supplierRepository = supplierRepository ?? throw new ArgumentNullException(nameof(supplierRepository));
            _clinicService = clinicService ?? throw new ArgumentNullException(nameof(clinicService));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        }

        public async Task<SupplierResponseDto?> GetByIdAsync(Guid id)
        {
            try
            {
                var supplier = await _supplierRepository.GetByIdAsync(id);
                if (supplier == null)
                    throw new KeyNotFoundException($"Supplier with ID {id} not found.");
                
                var supplierDto = _mapper.Map<SupplierResponseDto>(supplier);
                
                // Fetch clinic details if ClinicId is available
                if (supplier.ClinicId.HasValue)
                {
                    try
                    {
                        var clinic = await _clinicService.GetByIdAsync(supplier.ClinicId.Value);
                        if (clinic != null)
                        {
                            supplierDto.ClinicDetail = clinic;
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error fetching clinic details for supplier {id}: {ex.Message}");
                        // Continue without clinic details if there's an error
                    }
                }
                
                return supplierDto;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetByIdAsync: {ex.Message}");
                throw;
            }
        }

        public async Task<PaginatedResponseDto<SupplierResponseDto>> GetAllAsync(SupplierFilterDto filter)
        {
            try
            {
                var coreFilter = _mapper.Map<SupplierFilterCoreDto>(filter);
                var (suppliers, totalCount) = await _supplierRepository.GetAllAsync(coreFilter);

                var dtos = _mapper.Map<IEnumerable<SupplierResponseDto>>(suppliers).ToList();

                // Fetch clinic details for each supplier
                foreach (var dto in dtos)
                {
                    if (dto.ClinicId.HasValue)
                    {
                        try
                        {
                            var clinic = await _clinicService.GetByIdAsync(dto.ClinicId.Value);
                            if (clinic != null)
                            {
                                dto.ClinicDetail = clinic;
                            }
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"Error fetching clinic details for supplier {dto.Id}: {ex.Message}");
                            // Continue without clinic details if there's an error
                        }
                    }
                }

                var totalPages = (int)Math.Ceiling(totalCount / (double)filter.PageSize);

                return new PaginatedResponseDto<SupplierResponseDto>
                {
                    Items = dtos,
                    TotalCount = totalCount,
                    PageNumber = filter.PageNumber,
                    PageSize = filter.PageSize,
                    TotalPages = totalPages,
                    HasPreviousPage = filter.PageNumber > 1,
                    HasNextPage = filter.PageNumber < totalPages
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetAllAsync: {ex.Message}");
                throw;
            }
        }

        public async Task<SupplierResponseDto> CreateAsync(CreateSupplierRequestDto dto)
        {
            try
            {
                if (dto == null)
                    throw new ArgumentNullException(nameof(dto));

                if (string.IsNullOrWhiteSpace(dto.Name))
                    throw new ArgumentException("Supplier name is required");

                if (dto.ClinicId.HasValue)
                {
                    var clinic = await _clinicService.GetByIdAsync(dto.ClinicId.Value);
                    if (clinic == null)
                        throw new ArgumentException($"Clinic with ID {dto.ClinicId} does not exist");
                }

                var supplier = _mapper.Map<Supplier>(dto);
                supplier.CreatedAt = DateTimeOffset.UtcNow;
                supplier.UpdatedAt = DateTimeOffset.UtcNow;
                supplier.IsActive = true;

                var createdSupplier = await _supplierRepository.AddAsync(supplier);
                return _mapper.Map<SupplierResponseDto>(createdSupplier);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in CreateAsync: {ex.Message}");
                throw;
            }
        }

        public async Task<SupplierResponseDto> UpdateAsync(UpdateSupplierRequestDto dto)
        {
            try
            {
                if (dto == null)
                    throw new ArgumentNullException(nameof(dto));

                var existingSupplier = await _supplierRepository.GetByIdAsync(dto.Id);
                if (existingSupplier == null)
                    throw new KeyNotFoundException($"Supplier with ID {dto.Id} not found.");

                if (string.IsNullOrWhiteSpace(dto.Name))
                    throw new ArgumentException("Supplier name is required");

                if (dto.ClinicId.HasValue)
                {
                    var clinic = await _clinicService.GetByIdAsync(dto.ClinicId.Value);
                    if (clinic == null)
                        throw new ArgumentException($"Clinic with ID {dto.ClinicId} does not exist");
                }

                var supplier = _mapper.Map<Supplier>(dto);
                supplier.UpdatedAt = DateTimeOffset.UtcNow;

                var updatedSupplier = await _supplierRepository.UpdateAsync(supplier);
                return _mapper.Map<SupplierResponseDto>(updatedSupplier);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in UpdateAsync: {ex.Message}");
                throw;
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            try
            {
                var existingSupplier = await _supplierRepository.GetByIdAsync(id);
                if (existingSupplier == null)
                    throw new KeyNotFoundException($"Supplier with ID {id} not found.");

                return await _supplierRepository.DeleteAsync(id);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in DeleteAsync: {ex.Message}");
                throw;
            }
        }
    }
}
