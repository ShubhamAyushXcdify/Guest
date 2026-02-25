using System;
using System.Collections.Generic;

namespace Application.DTOs
{
    /// <summary>
    /// Common response DTO for reminder processing results (vaccination, deworming, etc.)
    /// </summary>
    public class ReminderResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public int TotalRemindersProcessed { get; set; }
        public int EmailsSent { get; set; }
        public int EmailsFailed { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
        public DateTimeOffset ProcessedAt { get; set; }
        public Dictionary<int, int> RemindersByDaysUntilDue { get; set; } = new Dictionary<int, int>();
    }
}

