using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Core.Interfaces;
using Core.Models;

namespace Application.Services
{
    public class RatingService : IRatingService
    {
        private readonly IRatingRepository _ratingRepository;
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly IMapper _mapper;

        public RatingService(
            IRatingRepository ratingRepository, 
            IAppointmentRepository appointmentRepository,
            IMapper mapper)
        {
            _ratingRepository = ratingRepository ?? throw new ArgumentNullException(nameof(ratingRepository));
            _appointmentRepository = appointmentRepository ?? throw new ArgumentNullException(nameof(appointmentRepository));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        }

        public async Task<RatingDto> CreateRatingAsync(CreateRatingDto dto)
        {
            try
            {
                // Validate appointment exists
                var appointment = await _appointmentRepository.GetByIdAsync(dto.AppointmentId);
                if (appointment == null)
                {
                    throw new InvalidOperationException($"Appointment with id {dto.AppointmentId} does not exist in the database.");
                }

                var rating = _mapper.Map<Rating>(dto);
                var result = await _ratingRepository.CreateAsync(rating);
                return _mapper.Map<RatingDto>(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in CreateRatingAsync: {ex.Message}");
                throw new InvalidOperationException(ex.Message, ex);
            }
        }

        public async Task<RatingDto> GetRatingByIdAsync(Guid id)
        {
            try
            {
                var rating = await _ratingRepository.GetByIdAsync(id);
                if (rating == null)
                    throw new InvalidOperationException("Rating not found.");

                return _mapper.Map<RatingDto>(rating);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetRatingByIdAsync: {ex.Message}");
                throw;
            }
        }

        public async Task<IEnumerable<RatingDto>> GetAllRatingsAsync()
        {
            try
            {
                var ratings = await _ratingRepository.GetAllAsync();
                return _mapper.Map<IEnumerable<RatingDto>>(ratings);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetAllRatingsAsync: {ex.Message}");
                throw;
            }
        }

        public async Task<RatingDto> UpdateRatingAsync(Guid id, UpdateRatingDto dto)
        {
            try
            {
                var rating = await _ratingRepository.GetByIdAsync(id);
                if (rating == null)
                    throw new KeyNotFoundException("Rating not found.");

                // Validate appointment exists if appointment_id is being updated
                if (dto.AppointmentId.HasValue && dto.AppointmentId.Value != Guid.Empty)
                {
                    var appointment = await _appointmentRepository.GetByIdAsync(dto.AppointmentId.Value);
                    if (appointment == null)
                    {
                        throw new InvalidOperationException($"Appointment with id {dto.AppointmentId.Value} does not exist in the database.");
                    }
                }

                _mapper.Map(dto, rating);
                var result = await _ratingRepository.UpdateAsync(rating);
                return _mapper.Map<RatingDto>(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in UpdateRatingAsync: {ex.Message}");
                throw;
            }
        }

        public async Task<bool> DeleteRatingAsync(Guid id)
        {
            try
            {
                return await _ratingRepository.DeleteAsync(id);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in DeleteRatingAsync: {ex.Message}");
                throw;
            }
        }
    }
}
