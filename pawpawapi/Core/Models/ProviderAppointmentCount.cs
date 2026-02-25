using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Models
{
    public class ProviderAppointmentCount
    {
        public Guid ProviderId { get; set; }
        public int Total { get; set; }
        public int Done { get; set; }
        public int Pending { get; set; }
    }

}
