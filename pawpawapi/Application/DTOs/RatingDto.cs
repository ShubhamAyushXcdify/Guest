using System;

namespace Application.DTOs
{
    public class RatingDto
    {
        public Guid Id { get; set; }
        public Guid AppointmentId { get; set; }
        public int Rating { get; set; }
        public string? Feedback { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
    }

    public class CreateRatingDto
    {
        public Guid AppointmentId { get; set; }
        public int Rating { get; set; }
        public string? Feedback { get; set; }
    }

    public class UpdateRatingDto
    {
        public Guid? AppointmentId { get; set; }
        public int? Rating { get; set; }
        public string? Feedback { get; set; }
    }
}
