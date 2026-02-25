using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    public class ScreenAccessResponseDto
    {
        public Guid Id { get; set; }
        public Guid ScreenId { get; set; }
        public string? ScreenName { get; set; }
        //public Guid CompanyId { get; set; }
        //public string? CompanyName { get; set; }
        public Guid ClinicId { get; set; }
        public string? ClinicName { get; set; }

        public Guid RoleId { get; set; }
        public string? RoleName { get; set; }
        public bool IsAccessEnable { get; set; }
        public DateTimeOffset? CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
    }

    public class UpdateScreenAccessRequestDto
    {
        [Required(ErrorMessage = "RoleId is required")]
        public Guid RoleId { get; set; }

        //[Required(ErrorMessage = "CompanyId is required")]
        //public Guid CompanyId { get; set; }

        [Required(ErrorMessage = "ClinicId is required")]
        public Guid ClinicId { get; set; }


        [Required(ErrorMessage = "ScreenIds are required")]
        [MinLength(1, ErrorMessage = "At least one screen ID is required")]
        public List<Guid> ScreenIds { get; set; } = new List<Guid>();
        
        public bool IsAccessEnable { get; set; } = true;
    }
}
