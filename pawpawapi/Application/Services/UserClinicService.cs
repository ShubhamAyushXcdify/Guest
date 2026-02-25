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
    public class UserClinicService : IUserClinicService
    {
        private readonly IUserClinicRepository _userClinicRepository;
        private readonly IMapper _mapper;

        public UserClinicService(IUserClinicRepository userClinicRepository, IMapper mapper)
        {
            _userClinicRepository = userClinicRepository;
            _mapper = mapper;
        }

        public async Task<UserClinicResponseDto?> GetByIdAsync(Guid id)
        {
            var userClinic = await _userClinicRepository.GetByIdAsync(id);
            return userClinic == null ? null : _mapper.Map<UserClinicResponseDto>(userClinic);
        }

        public async Task<PaginatedResponseDto<UserClinicResponseDto>> GetAllAsync(
            int pageNumber = 1,
            int pageSize = 10,
            Guid? clinicId = null)
        {
            try
            {
                var (userClinics, totalCount) = await _userClinicRepository.GetAllAsync(
                    pageNumber,
                    pageSize,
                    clinicId);

                var dtos = _mapper.Map<IEnumerable<UserClinicResponseDto>>(userClinics).ToList();

                var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

                return new PaginatedResponseDto<UserClinicResponseDto>
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
                throw;
            }
        }

        public async Task<UserClinicResponseDto> CreateAsync(CreateUserClinicRequestDto dto)
        {
            var userClinic = _mapper.Map<UserClinic>(dto);
            var created = await _userClinicRepository.AddAsync(userClinic);
            return _mapper.Map<UserClinicResponseDto>(created);
        }

        public async Task<UserClinicResponseDto> UpdateAsync(UpdateUserClinicRequestDto dto)
        {
            var userClinic = _mapper.Map<UserClinic>(dto);
            var updated = await _userClinicRepository.UpdateAsync(userClinic);
            return _mapper.Map<UserClinicResponseDto>(updated);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            return await _userClinicRepository.DeleteAsync(id);
        }

        public async Task<IEnumerable<UserClinicResponseDto>> GetByUserIdAsync(Guid userId)
        {
            var userClinics = await _userClinicRepository.GetByUserIdAsync(userId);
            return _mapper.Map<IEnumerable<UserClinicResponseDto>>(userClinics);
        }
    }
} 