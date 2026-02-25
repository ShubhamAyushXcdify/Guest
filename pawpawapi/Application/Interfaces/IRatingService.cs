using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface IRatingService
    {
        Task<RatingDto> CreateRatingAsync(CreateRatingDto dto);
        Task<RatingDto> GetRatingByIdAsync(Guid id);
        Task<IEnumerable<RatingDto>> GetAllRatingsAsync();
        Task<RatingDto> UpdateRatingAsync(Guid id, UpdateRatingDto dto);
        Task<bool> DeleteRatingAsync(Guid id);
    }
}
