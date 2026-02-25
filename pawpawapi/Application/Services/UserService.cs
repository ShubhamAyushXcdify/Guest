using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Core.Interfaces;
using Core.Models;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly ILogger<UserService> _logger;
        private readonly IMapper _mapper;
        private readonly IClinicService _clinicService;
        private readonly IDoctorSlotService _doctorSlotService;
        private readonly ICompanyService _companyService;
        private readonly IRoleService _roleService;

        public UserService(
            IUserRepository userRepository,
            ILogger<UserService> logger,
            IMapper mapper,
            IClinicService clinicService,
            IDoctorSlotService doctorSlotService,
            ICompanyService companyService,
            IRoleService roleService)
        {
            _userRepository = userRepository;
            _logger = logger;
            _mapper = mapper;
            _clinicService = clinicService;
            _doctorSlotService = doctorSlotService;
            _companyService = companyService;
            _roleService = roleService;
        }

        public async Task<UserResponseDto?> GetByIdAsync(Guid id)
        {
            try
            {
                var user = await _userRepository.GetByIdAsync(id);
                if (user == null) return null;
                var userDto = _mapper.Map<UserResponseDto>(user);

                // If user is a doctor, add slots
                if ((userDto.RoleName != null && (userDto.RoleName.ToLower().Contains("doctor") || userDto.RoleName.ToLower().Contains("veterinarian"))))
                {
                    var slotIds = await _userRepository.GetSlotIdsByUserIdAsync(userDto.Id);
                    if (slotIds != null && slotIds.Any())
                    {
                        var allSlots = await _doctorSlotService.GetAllDoctorSlotsAsync();
                        userDto.DoctorSlots = allSlots.Where(s => slotIds.Contains(s.Id)).ToList();
                    }
                    else
                    {
                        userDto.DoctorSlots = new List<DoctorSlotDto>();
                    }
                }
                return userDto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user by ID: {Id}", id);
                throw;
            }
        }

        public async Task<PaginatedResponseDto<UserResponseDto>> GetAllAsync(
            int pageNumber = 1,
            int pageSize = 10,
            Guid[]? roleIds = null,
            Guid[]? clinicIds = null,
            bool paginationRequired = true, Guid? companyId = null)
        {
            try
            {
                var (users, totalCount) = await _userRepository.GetAllAsync(pageNumber, pageSize, roleIds, clinicIds, paginationRequired, companyId);
                var userDtos = _mapper.Map<IEnumerable<UserResponseDto>>(users).ToList();

                // Clinic information is now included in the Clinics property via AutoMapper
                // No need to fetch separately as it's loaded in the repository

                return new PaginatedResponseDto<UserResponseDto>
                {
                    Items = userDtos,
                    TotalCount = totalCount,
                    PageNumber = paginationRequired ? pageNumber : 1,
                    PageSize = paginationRequired ? pageSize : totalCount,
                    TotalPages = paginationRequired ? (int)Math.Ceiling(totalCount / (double)pageSize) : 1
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all users");
                throw;
            }
        }

        public async Task<UserResponseDto> CreateAsync(CreateUserRequestDto dto)
        {
            try
            {
                // Get role information to check if it's super_admin
                var roleResult = await _roleService.GetByIdAsync(dto.RoleId);
                if (!roleResult.IsSuccess || roleResult.Value == null)
                {
                    throw new ArgumentException($"Role with ID {dto.RoleId} does not exist");
                }
                var role = roleResult.Value;

                // Validate CompanyId based on role
                if (role.Value.ToLower() == "super_admin")
                {
                    // Super admin can have null CompanyId, but if provided, it must exist
                    if (dto.CompanyId.HasValue)
                    {
                        var company = await _companyService.GetCompanyByIdAsync(dto.CompanyId.Value);
                        if (company == null)
                        {
                            throw new ArgumentException($"Company with ID {dto.CompanyId} does not exist");
                        }
                    }
                }
                else
                {
                    // All other roles must have a CompanyId
                    if (!dto.CompanyId.HasValue)
                    {
                        throw new ArgumentException("CompanyId is required for all roles except Super Admin");
                    }

                    var company = await _companyService.GetCompanyByIdAsync(dto.CompanyId.Value);
                    if (company == null)
                    {
                        throw new ArgumentException($"Company with ID {dto.CompanyId} does not exist");
                    }
                }

                var existingUserInCompany = await _userRepository.GetByEmailAndCompanyAsync(dto.Email?.Trim() ?? "", dto.CompanyId);
                if (existingUserInCompany != null)
                {
                    throw new InvalidOperationException("A user with this email already exists in this company.");
                }

                var user = _mapper.Map<User>(dto);
                user.Id = Guid.NewGuid();
                user.IsActive = true;
                user.CreatedAt = DateTime.UtcNow;
                user.PasswordHash = HashPassword(dto.PasswordHash);

                var createdUser = await _userRepository.AddAsync(user);

                // Map clinic IDs if provided
                if (dto.ClinicIds != null && dto.ClinicIds.Any())
                {
                    await _userRepository.AddUserClinicMappingsAsync(createdUser.Id, dto.ClinicIds);
                }

                // Map slots if provided
                if (dto.Slots != null && dto.Slots.Any())
                {
                    await _userRepository.AddUserSlotsAsync(createdUser.Id, dto.Slots);
                }

                // Get the created user with clinic mappings
                var userWithMappings = await _userRepository.GetByIdAsync(createdUser.Id);
                return _mapper.Map<UserResponseDto>(userWithMappings);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating user");
                throw;
            }
        }

        public async Task<UserResponseDto> UpdateAsync(UpdateUserRequestDto dto)
        {
            try
            {
                var existingUser = await _userRepository.GetByIdAsync(dto.Id);
                if (existingUser == null)
                {
                    throw new KeyNotFoundException($"User with ID {dto.Id} not found");
                }

                // Get role information to check if it's super_admin
                var roleResult = await _roleService.GetByIdAsync(dto.RoleId);
                if (!roleResult.IsSuccess || roleResult.Value == null)
                {
                    throw new ArgumentException($"Role with ID {dto.RoleId} does not exist");
                }
                var role = roleResult.Value;

                // Validate CompanyId based on role
                if (role.Value.ToLower() == "super_admin")
                {
                    // Super admin can have null CompanyId, but if provided, it must exist
                    if (dto.CompanyId.HasValue)
                    {
                        var company = await _companyService.GetCompanyByIdAsync(dto.CompanyId.Value);
                        if (company == null)
                        {
                            throw new ArgumentException($"Company with ID {dto.CompanyId} does not exist");
                        }
                    }
                }
                else
                {
                    // All other roles must have a CompanyId
                    if (!dto.CompanyId.HasValue)
                    {
                        throw new ArgumentException("CompanyId is required for all roles except Super Admin");
                    }

                    var company = await _companyService.GetCompanyByIdAsync(dto.CompanyId.Value);
                    if (company == null)
                    {
                        throw new ArgumentException($"Company with ID {dto.CompanyId} does not exist");
                    }
                }

                var existingByEmailInCompany = await _userRepository.GetByEmailAndCompanyAsync(dto.Email?.Trim() ?? "", dto.CompanyId);
                if (existingByEmailInCompany != null && existingByEmailInCompany.Id != dto.Id)
                {
                    throw new InvalidOperationException("A user with this email already exists in this company.");
                }

                _mapper.Map(dto, existingUser);
                existingUser.UpdatedAt = DateTime.UtcNow;

                var updatedUser = await _userRepository.UpdateAsync(existingUser);

                // Handle clinic mappings update
                if (dto.ClinicIds != null)
                {
                    await _userRepository.AddUserClinicMappingsAsync(dto.Id, dto.ClinicIds);
                }

                // Handle doctor slots update
                if (dto.Slots != null)
                {
                    // Remove all current slots for this user
                    var currentSlotIds = await _userRepository.GetSlotIdsByUserIdAsync(dto.Id);
                    if (currentSlotIds != null && currentSlotIds.Any())
                    {
                        await _userRepository.DeleteUserSlotsAsync(dto.Id);
                    }
                    // Insert new slots if any
                    if (dto.Slots.Any())
                    {
                        await _userRepository.AddUserSlotsAsync(dto.Id, dto.Slots, null);
                    }
                }

                // Get the updated user with clinic mappings
                var userWithMappings = await _userRepository.GetByIdAsync(dto.Id);
                return _mapper.Map<UserResponseDto>(userWithMappings);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user: {Id}", dto.Id);
                throw;
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            try
            {
                return await _userRepository.DeleteAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user: {Id}", id);
                throw;
            }
        }

        public async Task<UserResponseDto?> GetByEmailAsync(string email)
        {
            try
            {
                var user = await _userRepository.GetByEmailAsync(email);
                return user != null ? _mapper.Map<UserResponseDto>(user) : null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user by email: {Email}", email);
                throw;
            }
        }

        public async Task<IEnumerable<UserResponseDto>> GetByClinicIdAsync(Guid clinicId)
        {
            try
            {
                var users = await _userRepository.GetByClinicIdAsync(clinicId);
                return _mapper.Map<IEnumerable<UserResponseDto>>(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting users by clinic ID: {ClinicId}", clinicId);
                throw;
            }
        }

        public async Task UpdateUserSlotsAsync(Guid userId, IEnumerable<Guid> slots, Guid? clinicId = null)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new KeyNotFoundException($"User with ID {userId} not found");
            }
            // Remove all current slots for this user
            var currentSlotIds = await _userRepository.GetSlotIdsByUserIdAsync(userId);
            if (currentSlotIds != null && currentSlotIds.Any())
            {
                await _userRepository.DeleteUserClinicSlotsAsync(userId, clinicId);
            }
            // Insert new slots if any
            if (slots != null && slots.Any())
            {
                await _userRepository.AddUserSlotsAsync(userId, slots, clinicId);
            }
        }

        public async Task<IEnumerable<DoctorSlotDto>> GetAvailableSlotsForVeterinarianAsync(Guid userId, DateTime date)
        {
            // 1. Get all slots for the user
            var slotIds = await _userRepository.GetSlotIdsByUserIdAsync(userId);
            if (slotIds == null || !slotIds.Any()) return new List<DoctorSlotDto>();
            var allSlots = await _doctorSlotService.GetAllDoctorSlotsAsync();
            var dayOfWeek = date.DayOfWeek.ToString();
            var userSlots = allSlots.Where(s => slotIds.Contains(s.Id) && s.Day.Equals(dayOfWeek, StringComparison.OrdinalIgnoreCase)).ToList();

            // 2. Get all appointments for the user on the given date (excluding cancelled and completed ones)
            // Only cancelled and completed appointments are considered as available slots
            // All other statuses (scheduled, in_progress, etc.) block the slot
            var appointments = await _userRepository.GetAppointmentsByVeterinarianAndDateAsync(userId, date);
            var busyRanges = appointments
                .Where(a => a.Status != "cancelled" && a.Status != "completed" && a.AppointmentTimeFrom.HasValue && a.AppointmentTimeTo.HasValue)
                .Select(a => (From: a.AppointmentTimeFrom.Value, To: a.AppointmentTimeTo.Value))
                .ToList();

            // 3. Filter slots that do not overlap with any busy range
            var availableSlots = userSlots.Where(slot =>
                !busyRanges.Any(busy =>
                    (slot.StartTime < busy.To && slot.EndTime > busy.From)
                )
            ).ToList();

            return _mapper.Map<IEnumerable<DoctorSlotDto>>(availableSlots);
        }

        public async Task<IEnumerable<UserSlotDto>> GetAvailableUserSlotsAsync(Guid userId, DateTime? date = null, Guid? clinicId = null)
        {
            var userDoctorSlots = await _userRepository.GetUserDoctorSlotsAsync(userId);
            if (userDoctorSlots == null || !userDoctorSlots.Any()) return new List<UserSlotDto>();

            if (clinicId.HasValue)
            {
                userDoctorSlots = userDoctorSlots.Where(uds => uds.ClinicId == clinicId.Value);
            }

            var slotIds = userDoctorSlots.Select(uds => uds.SlotId).ToList();
            var allSlots = await _doctorSlotService.GetAllDoctorSlotsAsync();

            IEnumerable<DoctorSlotDto> matchingSlots;

            if (date.HasValue)
            {
                var dayOfWeek = date.Value.DayOfWeek.ToString();
                matchingSlots = allSlots.Where(s => slotIds.Contains(s.Id)
                    && s.Day.Equals(dayOfWeek, StringComparison.OrdinalIgnoreCase));
            }
            else
            {
                // No date provided: return ALL saved slots across all days
                matchingSlots = allSlots.Where(s => slotIds.Contains(s.Id));
            }

            var userSlots = matchingSlots.Select(slot =>
            {
                var uds = userDoctorSlots.FirstOrDefault(x => x.SlotId == slot.Id);
                return new UserSlotDto
                {
                    Id = slot.Id,
                    Day = slot.Day,
                    StartTime = slot.StartTime,
                    EndTime = slot.EndTime,
                    CreatedAt = slot.CreatedAt,
                    UpdatedAt = slot.UpdatedAt,
                    IsActive = slot.IsActive,
                    ClinicId = uds?.ClinicId
                };
            }).ToList();

            // Only filter out busy appointments when date is provided
            if (date.HasValue)
            {
                var appointments = await _userRepository.GetAppointmentsByVeterinarianAndDateAsync(userId, date.Value);
                var busyRanges = appointments
                    .Where(a => a.Status != "cancelled" && a.Status != "completed" && a.AppointmentTimeFrom.HasValue && a.AppointmentTimeTo.HasValue)
                    .Select(a => (From: a.AppointmentTimeFrom.Value, To: a.AppointmentTimeTo.Value))
                    .ToList();

                userSlots = userSlots.Where(slot =>
                    !busyRanges.Any(busy => slot.StartTime < busy.To && slot.EndTime > busy.From)
                ).ToList();

                // Additional filtering: if the date is today, filter out past slots
                if (date.Value.Date == DateTime.Today.Date)
                {
                    userSlots = userSlots.Where(s => s.StartTime > DateTime.Now.TimeOfDay).ToList();
                }
            }

            return userSlots;
        }

        public async Task<IEnumerable<UserClinicSlotsResponseDto>> GetUserSlotsByClinicAsync(Guid userId, Guid? clinicId = null)
        {
            try
            {
                // Get user slots grouped by clinic from repository (includes slot details from JOIN query)
                var clinicSlots = await _userRepository.GetUserSlotsByClinicAsync(userId, clinicId);

                if (clinicSlots == null || !clinicSlots.Any())
                {
                    return new List<UserClinicSlotsResponseDto>();
                }

                var result = clinicSlots.Select(cs => new UserClinicSlotsResponseDto
                {
                    ClinicId = cs.ClinicId,
                    ClinicName = cs.ClinicName,
                    Slots = _mapper.Map<List<UserSlotDto>>(cs.Slots)
                }).ToList();

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user slots by clinic for user: {UserId}", userId);
                throw;
            }
        }

        private string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(bytes);
            }
        }
    }
}
