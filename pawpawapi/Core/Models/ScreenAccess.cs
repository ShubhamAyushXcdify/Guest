using System;

namespace Core.Models
{
    public class ScreenAccess
    {
        public Guid Id { get; set; }
        public Guid ScreenId { get; set; }
        //public Guid CompanyId { get; set; }
        public Guid ClinicId { get; set; }
        public Guid RoleId { get; set; }
        public bool IsAccessEnable { get; set; }
        public DateTimeOffset? CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
        
        // Navigation properties (optional, for reference)
        public string? ScreenName { get; set; }
        public string? RoleName { get; set; }
        //public string? CompanyName { get; set; }
        public string? ClinicName { get; set; }
    }
}
