using Application.DTOs;
using Application.Interfaces;
using Core.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SymptomController : ControllerBase
    {
        private readonly ISymptomService _symptomService;
        private readonly ILogger<SymptomController> _logger;

        public SymptomController(ISymptomService symptomService, ILogger<SymptomController> logger)
        {
            _symptomService = symptomService ?? throw new ArgumentNullException(nameof(symptomService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        [HttpPost]
        public async Task<ActionResult<SymptomResponseDto>> CreateAsync([FromBody] CreateSymptomRequestDto request)
        {
            try
            {
                var result = await _symptomService.CreateAsync(request);
                return Created($"/api/symptom/{result.Id}", result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating symptom");
                return StatusCode(500, "An error occurred while creating the symptom");
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SymptomResponseDto>>> GetAllAsync([FromQuery] string? breed)
        {
            try
            {
                IEnumerable<SymptomResponseDto> result;
                
                if (!string.IsNullOrEmpty(breed))
                {
                    result = await _symptomService.GetByBreedAsync(breed);
                }
                else
                {
                    result = await _symptomService.GetAllAsync();
                }
                
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting symptoms");
                return StatusCode(500, "An error occurred while getting symptoms");
            }
        }

        [HttpGet("breed/{breed}")]
        public async Task<ActionResult<IEnumerable<SymptomResponseDto>>> GetByBreedAsync(string breed)
        {
            try
            {
                var result = await _symptomService.GetByBreedAsync(breed);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting symptoms by breed {Breed}", breed);
                return StatusCode(500, $"An error occurred while getting symptoms for breed {breed}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<SymptomResponseDto>> GetByIdAsync(Guid id)
        {
            try
            {
                var result = await _symptomService.GetByIdAsync(id);
                if (result == null)
                {
                    return NotFound($"Symptom with id {id} not found");
                }
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting symptom {SymptomId}", id);
                return StatusCode(500, $"An error occurred while getting symptom with id {id}");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<SymptomResponseDto>> UpdateAsync(Guid id, [FromBody] UpdateSymptomRequestDto request)
        {
            try
            {
                if (id != request.Id)
                {
                    return BadRequest("Id in URL does not match id in request body");
                }

                var result = await _symptomService.UpdateAsync(request);
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound($"Symptom with id {id} not found");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating symptom {SymptomId}", id);
                return StatusCode(500, $"An error occurred while updating symptom with id {id}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteAsync(Guid id)
        {
            try
            {
                var result = await _symptomService.DeleteAsync(id);
                if (!result)
                {
                    return NotFound($"Symptom with id {id} not found");
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting symptom {SymptomId}", id);
                return StatusCode(500, $"An error occurred while deleting symptom with id {id}");
            }
        }
    }
} 