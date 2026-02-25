using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Core.Interfaces;
using Core.Models;
using Microsoft.Extensions.Logging;
using Npgsql;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Application.Services
{
    public class ProductService : IProductService
    {
        private readonly IProductRepository _productRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<ProductService> _logger;
        private readonly ICompanyService _companyService;

        public ProductService(
            IProductRepository productRepository,
            IMapper mapper,
            ILogger<ProductService> logger,
            ICompanyService companyService)
        {
            _productRepository = productRepository;
            _mapper = mapper;
            _logger = logger;
            _companyService = companyService;
        }

        public async Task<ProductResponseDto?> GetByIdAsync(Guid id)
        {
            var product = await _productRepository.GetByIdAsync(id);
            return product == null ? null : _mapper.Map<ProductResponseDto>(product);
        }

        public async Task<PaginatedResponseDto<ProductResponseDto>> GetAllAsync(
            int pageNumber = 1,
            int pageSize = 10,
            ProductFilterDto? filter = null)
        {
            try
            {
                // Map DTO filter to domain filter
                var domainFilter = filter != null ? new Core.Models.ProductFilter
                {
                    CompanyId = filter.CompanyId,
                    Search = filter.Search,
                    Category = filter.Category,
                    DosageForm = filter.DosageForm,
                    UnitOfMeasure = filter.UnitOfMeasure,
                    RequiresPrescription = filter.RequiresPrescription,
                    ControlledSubstanceSchedule = filter.ControlledSubstanceSchedule,
                    IsActive = filter.IsActive,
                    MinPrice = filter.MinPrice,
                    MaxPrice = filter.MaxPrice,
                    MinSellingPrice = filter.MinSellingPrice,
                    MaxSellingPrice = filter.MaxSellingPrice,
                    LowStock = filter.LowStock,
                    CreatedFrom = filter.CreatedFrom,
                    CreatedTo = filter.CreatedTo,
                    SortBy = filter.SortBy,
                    SortOrder = filter.SortOrder
                } : null;

                var (products, totalCount) = await _productRepository.GetAllAsync(
                    pageNumber,
                    pageSize,
                    domainFilter);

                var dtos = _mapper.Map<IEnumerable<ProductResponseDto>>(products).ToList();
                
                var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
                
                return new PaginatedResponseDto<ProductResponseDto>
                {
                    Items = dtos,
                    TotalCount = totalCount,
                    PageNumber = pageNumber,
                    PageSize = pageSize,
                    TotalPages = totalPages,
                    HasPreviousPage = pageNumber > 1,
                    HasNextPage = pageNumber < totalPages
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAllAsync");
                throw;
            }
        }

        public async Task<ProductResponseDto> CreateAsync(CreateProductRequestDto dto)
        {
            // Validate that the company exists
            var company = await _companyService.GetCompanyByIdAsync(dto.CompanyId);
            if (company == null)
            {
                throw new ArgumentException($"Company with ID {dto.CompanyId} does not exist");
            }

            var product = _mapper.Map<Product>(dto);
            await _productRepository.AddAsync(product);
            return _mapper.Map<ProductResponseDto>(product);
        }

        public async Task<ProductResponseDto> UpdateAsync(UpdateProductRequestDto dto)
        {
            // Validate that the company exists
            var company = await _companyService.GetCompanyByIdAsync(dto.CompanyId);
            if (company == null)
            {
                throw new ArgumentException($"Company with ID {dto.CompanyId} does not exist");
            }

            var product = _mapper.Map<Product>(dto);
            await _productRepository.UpdateAsync(product);
            return _mapper.Map<ProductResponseDto>(product);
        }

        public async Task DeleteAsync(Guid id)
        {
            try
            {
                await _productRepository.DeleteAsync(id);
            }
            catch (PostgresException ex) when (ex.SqlState == "23503")
            {
                // Foreign key violation
                throw new InvalidOperationException(
                    "This product cannot be deleted because it is already used in purchase orders."
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in DeleteAsync: {ex.Message}");
                throw new InvalidOperationException(ex.Message, ex);
            }
        }

        public async Task<object> GetFilterOptionsAsync()
        {
            return await _productRepository.GetFilterOptionsAsync();
        }

        public async Task<PaginatedResponseDto<ProductUsageHistoryItemDto>> GetUsageHistoryByProductIdAsync(
            Guid productId,
            int pageNumber = 1,
            int pageSize = 10)
        {
            var (items, totalCount) = await _productRepository.GetUsageHistoryByProductIdAsync(
                productId,
                pageNumber,
                pageSize);
            var dtos = _mapper.Map<IEnumerable<ProductUsageHistoryItemDto>>(items).ToList();
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
            return new PaginatedResponseDto<ProductUsageHistoryItemDto>
            {
                Items = dtos,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalPages = totalPages,
                HasPreviousPage = pageNumber > 1,
                HasNextPage = pageNumber < totalPages
            };
        }
    }
} 