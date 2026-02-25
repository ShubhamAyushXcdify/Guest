using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Models
{
    public class AppointmentType
    {
        public Guid AppointmentTypeId { get; set; }
        public string Name { get; set; } 
        public bool IsActive { get; set; }
    }
}
