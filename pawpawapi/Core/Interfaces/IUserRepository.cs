using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;

namespace Core.Interfaces
{
    public interface IUserRepository
    {
        Task<User?> GetByIdAsync(Guid id);
        Task<User?> GetByEmailAndCompanyAsync(string email, Guid? companyId);
        /// <summary>
        /// Batch load multiple users by their IDs (optimized for N+1 prevention)
        /// </summary>
        Task<Dictionary<Guid, User>> GetByIdsAsync(IEnumerable<Guid> ids);
        Task<(IEnumerable<User> Items, int TotalCount)> GetAllAsync(
            int pageNumber = 1,
            int pageSize = 10,
            Guid[]? roleIds = null,
            Guid[]? clinicIds = null,
            bool paginationRequired = true, Guid? companyId = null);
        Task<User> AddAsync(User user);
        Task<User> UpdateAsync(User user);
        Task<bool> DeleteAsync(Guid id);
        Task<User?> GetByEmailAsync(string email);
        Task<IEnumerable<User>> GetByClinicIdAsync(Guid clinicId);
        Task<IEnumerable<User>> GetAllUserAsync();
        Task AddUserSlotsAsync(Guid userId, IEnumerable<Guid> slotIds, Guid? clinicId = null);
        Task<IEnumerable<Guid>> GetSlotIdsByUserIdAsync(Guid userId);
        Task<IEnumerable<UserDoctorSlot>> GetUserDoctorSlotsAsync(Guid userId);
        Task DeleteUserSlotsAsync(Guid userId);
        Task DeleteUserClinicSlotsAsync(Guid userId, Guid? clinicId);
        // Optionally, you can add a method for updating slots in one call:
        // Task UpdateUserSlotsAsync(Guid userId, IEnumerable<Guid> slots);
        Task<IEnumerable<Appointment>> GetAppointmentsByVeterinarianAndDateAsync(Guid veterinarianId, DateTime date);

        // Clinic mapping methods
        Task AddUserClinicMappingsAsync(Guid userId, IEnumerable<Guid> clinicIds);
        Task<IEnumerable<UserClinicMapping>> GetUserClinicMappingsAsync(Guid userId);
        Task DeleteUserClinicMappingsAsync(Guid userId);
        Task UpdateLastLoginAsync(Guid userId, DateTimeOffset lastLogin);
        Task<IEnumerable<(Guid ClinicId, string ClinicName, IEnumerable<UserDoctorSlot> Slots)>> GetUserSlotsByClinicAsync(Guid userId, Guid? clinicId = null);
    }
}
