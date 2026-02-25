using Core.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Core.Interfaces
{
    public interface IScreenAccessRepository
    {
        Task<IEnumerable<ScreenAccess>> GetByClinicIdAsync(Guid clinicId, Guid? roleId = null);
        Task<ScreenAccess> GetByScreenRoleCompanyAsync(Guid screenId, Guid roleId, Guid companyId);
        Task<ScreenAccess> AddAsync(ScreenAccess screenAccess);
        Task<ScreenAccess> UpdateAsync(ScreenAccess screenAccess);
        Task<bool> UpsertScreenAccessAsync(Guid screenId, Guid roleId, Guid clinicId, bool isAccessEnable);
    }
}
