using System;
using System.Collections.Generic;

namespace Application.DTOs
{
    public class UserClinicSlotsResponseDto
    {
        public Guid ClinicId { get; set; }
        public string ClinicName { get; set; } = string.Empty;
        public List<UserSlotDto> Slots { get; set; } = new List<UserSlotDto>();
    }
}

