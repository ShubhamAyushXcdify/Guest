using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    public class UserSlotsRequestDto
    {
        [Required(ErrorMessage = "Slot IDs are required")]
        public IEnumerable<Guid> SlotIds { get; set; } = new List<Guid>();

        public Guid? ClinicId { get; set; }
    }
}
