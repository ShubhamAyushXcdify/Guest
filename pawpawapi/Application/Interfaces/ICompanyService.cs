using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface ICompanyService
    {
        Task<CompanyDto> CreateCompanyAsync(CreateCompanyDto dto);
        Task<CompanyDto> GetCompanyByIdAsync(Guid id);
        Task<IEnumerable<CompanyDto>> GetAllCompaniesAsync();
        Task<PaginatedResponseDto<CompanyDto>> GetAllAsync(
            int pageNumber = 1,
            int pageSize = 10,
            bool paginationRequired = true,
            string? companyName = null);
        Task<CompanyDto> UpdateCompanyAsync(Guid id, UpdateCompanyDto dto);
        Task<bool> DeleteCompanyAsync(Guid id);
    }
}
