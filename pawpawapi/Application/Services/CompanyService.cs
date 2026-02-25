using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.DTOs;
using Application.Interfaces;
using Core.Models;
using Core.Interfaces;

namespace Application.Services
{
    public class CompanyService : ICompanyService
    {
        private readonly ICompanyRepository _companyRepository;
        private readonly IMapper _mapper;

        public CompanyService(ICompanyRepository companyRepository, IMapper mapper)
        {
            _companyRepository = companyRepository;
            _mapper = mapper;
        }

        public async Task<CompanyDto> CreateCompanyAsync(CreateCompanyDto dto)
        {
            try
            {
                var name = dto?.Name?.Trim();
                if (string.IsNullOrWhiteSpace(name))
                    throw new InvalidOperationException("Company name is required.");

                if (await _companyRepository.ExistsActiveByNameAsync(name))
                    throw new InvalidOperationException("A company with this name already exists.");

                var company = _mapper.Map<Company>(dto);
                var result = await _companyRepository.CreateAsync(company);
                return _mapper.Map<CompanyDto>(result);
            }
            catch (InvalidOperationException)
            {
                throw;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in CreateCompanyAsync: {ex.Message}");
                throw new InvalidOperationException(ex.Message, ex);
            }
        }

        public async Task<CompanyDto> GetCompanyByIdAsync(Guid id)
        {
            try
            {
                var company = await _companyRepository.GetByIdAsync(id);
                if (company == null)
                    throw new InvalidOperationException("Company not found.");

                return _mapper.Map<CompanyDto>(company);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetCompanyByIdAsync: {ex.Message}");
                throw; // Rethrow the exception for higher-level handling
            }
        }

        public async Task<IEnumerable<CompanyDto>> GetAllCompaniesAsync()
        {
            try
            {
                var companies = await _companyRepository.GetAllAsync();
                return _mapper.Map<IEnumerable<CompanyDto>>(companies);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetAllCompaniesAsync: {ex.Message}");
                throw; // Rethrow the exception for higher-level handling
            }
        }

        public async Task<PaginatedResponseDto<CompanyDto>> GetAllAsync(
            int pageNumber = 1,
            int pageSize = 10,
            bool paginationRequired = true,
            string? domainName = null)
        {
            try
            {
                var (companies, totalCount) = await _companyRepository.GetAllAsync(
                    pageNumber,
                    pageSize,
                    paginationRequired,
                    domainName);

                var dtos = _mapper.Map<IEnumerable<CompanyDto>>(companies).ToList();

                var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

                return new PaginatedResponseDto<CompanyDto>
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
                Console.WriteLine($"Error in GetAllAsync: {ex.Message}");
                throw; // Rethrow the exception for higher-level handling
            }
        }

        public async Task<CompanyDto> UpdateCompanyAsync(Guid id, UpdateCompanyDto dto)
        {
            try
            {
                var company = await _companyRepository.GetByIdAsync(id);
                if (company == null)
                    throw new KeyNotFoundException("Company not found.");

                _mapper.Map(dto, company);
                var result = await _companyRepository.UpdateAsync(company);
                return _mapper.Map<CompanyDto>(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in UpdateCompanyAsync: {ex.Message}");
                throw; // Rethrow the exception for higher-level handling
            }
        }

        public async Task<bool> DeleteCompanyAsync(Guid id)
        {
            try
            {
                return await _companyRepository.DeleteAsync(id);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in DeleteCompanyAsync: {ex.Message}");
                throw; // Rethrow the exception for higher-level handling
            }
        }
    }
}
