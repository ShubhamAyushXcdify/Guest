using System;
using System.Threading.Tasks;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DewormingVisitController : ControllerBase
    {
        private readonly IDewormingIntakeService _service;
        private readonly IDewormingMedicationService _medicationService;
        private readonly IDewormingNoteService _noteService;
        private readonly IDewormingCheckoutService _checkoutService;

        public DewormingVisitController(
            IDewormingIntakeService service,
            IDewormingMedicationService medicationService,
            IDewormingNoteService noteService,
            IDewormingCheckoutService checkoutService)
        {
            _service = service;
            _medicationService = medicationService;
            _noteService = noteService;
            _checkoutService = checkoutService;
        }

        // DewormingIntake Endpoints
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(DewormingIntakeResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<DewormingIntakeResponseDto>> GetDewormingIntake(Guid id)
        {
            try
            {
                var result = await _service.GetByIdAsync(id);
                if (result == null)
                    return NotFound(new { message = $"Deworming intake with id {id} not found." });
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { statusCode = 500, message = ex.Message });
            }
        }

        [HttpGet("visit/{visitId}")]
        [ProducesResponseType(typeof(DewormingIntakeResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<DewormingIntakeResponseDto>> GetDewormingIntakeByVisit(Guid visitId)
        {
            try
            {
                var result = await _service.GetByVisitIdAsync(visitId);
                if (result == null)
                    return NotFound(new { message = $"Deworming intake for visit {visitId} not found." });
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { statusCode = 500, message = ex.Message });
            }
        }

        [HttpPost]
        [ProducesResponseType(typeof(DewormingIntakeResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<DewormingIntakeResponseDto>> CreateDewormingIntake([FromBody] CreateDewormingIntakeRequestDto dto)
        {
            try
            {
                if (dto == null)
                {
                    return BadRequest(new { message = "Deworming intake data is null." });
                }

                var result = await _service.CreateAsync(dto);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { statusCode = 500, message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [ProducesResponseType(typeof(DewormingIntakeResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<DewormingIntakeResponseDto>> UpdateDewormingIntake(Guid id, [FromBody] UpdateDewormingIntakeRequestDto dto)
        {
            try
            {
                if (dto == null)
                {
                    return BadRequest(new { message = "Deworming intake data is null." });
                }

                if (id != dto.Id)
                {
                    return BadRequest(new { message = "Id in route does not match id in request body." });
                }

                var result = await _service.UpdateAsync(dto);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { statusCode = 500, message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult> DeleteDewormingIntake(Guid id)
        {
            try
            {
                var result = await _service.DeleteAsync(id);
                return result ? NoContent() : NotFound(new { message = $"Deworming intake with id {id} not found." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { statusCode = 500, message = ex.Message });
            }
        }

        // DewormingMedication Endpoints
        [HttpGet("medication/{id}")]
        [ProducesResponseType(typeof(DewormingMedicationResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<DewormingMedicationResponseDto>> GetDewormingMedication(Guid id)
        {
            try
            {
                var result = await _medicationService.GetByIdAsync(id);
                if (result == null)
                    return NotFound(new { message = $"Deworming medication with id {id} not found." });
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { statusCode = 500, message = ex.Message });
            }
        }

        [HttpGet("medication/visit/{visitId}")]
        [ProducesResponseType(typeof(IEnumerable<DewormingMedicationResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<DewormingMedicationResponseDto>>> GetDewormingMedicationsByVisit(Guid visitId)
        {
            try
            {
                var result = await _medicationService.GetByVisitIdAsync(visitId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { statusCode = 500, message = ex.Message });
            }
        }

        [HttpPost("medication")]
        [ProducesResponseType(typeof(DewormingMedicationResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<DewormingMedicationResponseDto>> CreateDewormingMedication([FromBody] CreateDewormingMedicationRequestDto dto)
        {
            try
            {
                if (dto == null)
                {
                    return BadRequest(new { message = "Deworming medication data is null." });
                }

                var result = await _medicationService.CreateAsync(dto);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { statusCode = 500, message = ex.Message });
            }
        }

        [HttpPut("medication/{id}")]
        [ProducesResponseType(typeof(DewormingMedicationResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<DewormingMedicationResponseDto>> UpdateDewormingMedication(Guid id, [FromBody] UpdateDewormingMedicationRequestDto dto)
        {
            try
            {
                if (dto == null)
                {
                    return BadRequest(new { message = "Deworming medication data is null." });
                }

                if (id != dto.Id)
                {
                    return BadRequest(new { message = "Id in route does not match id in request body." });
                }

                var result = await _medicationService.UpdateAsync(dto);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { statusCode = 500, message = ex.Message });
            }
        }

        [HttpDelete("medication/{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult> DeleteDewormingMedication(Guid id)
        {
            try
            {
                var result = await _medicationService.DeleteAsync(id);
                return result ? NoContent() : NotFound(new { message = $"Deworming medication with id {id} not found." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { statusCode = 500, message = ex.Message });
            }
        }

        // DewormingNote Endpoints
        [HttpGet("note/{id}")]
        [ProducesResponseType(typeof(DewormingNoteResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<DewormingNoteResponseDto>> GetDewormingNote(Guid id)
        {
            try
            {
                var result = await _noteService.GetByIdAsync(id);
                if (result == null)
                    return NotFound(new { message = $"Deworming note with id {id} not found." });
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { statusCode = 500, message = ex.Message });
            }
        }

        [HttpGet("note/visit/{visitId}")]
        [ProducesResponseType(typeof(IEnumerable<DewormingNoteResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<DewormingNoteResponseDto>>> GetDewormingNotesByVisit(Guid visitId)
        {
            try
            {
                var result = await _noteService.GetByVisitIdAsync(visitId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { statusCode = 500, message = ex.Message });
            }
        }

        [HttpPost("note")]
        [ProducesResponseType(typeof(DewormingNoteResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<DewormingNoteResponseDto>> CreateDewormingNote([FromBody] CreateDewormingNoteRequestDto dto)
        {
            try
            {
                if (dto == null)
                {
                    return BadRequest(new { message = "Deworming note data is null." });
                }

                var result = await _noteService.CreateAsync(dto);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { statusCode = 500, message = ex.Message });
            }
        }

        [HttpPut("note/{id}")]
        [ProducesResponseType(typeof(DewormingNoteResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<DewormingNoteResponseDto>> UpdateDewormingNote(Guid id, [FromBody] UpdateDewormingNoteRequestDto dto)
        {
            try
            {
                if (dto == null)
                {
                    return BadRequest(new { message = "Deworming note data is null." });
                }

                if (id != dto.Id)
                {
                    return BadRequest(new { message = "Id in route does not match id in request body." });
                }

                var result = await _noteService.UpdateAsync(dto);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { statusCode = 500, message = ex.Message });
            }
        }

        [HttpDelete("note/{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult> DeleteDewormingNote(Guid id)
        {
            try
            {
                var result = await _noteService.DeleteAsync(id);
                return result ? NoContent() : NotFound(new { message = $"Deworming note with id {id} not found." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { statusCode = 500, message = ex.Message });
            }
        }

        // DewormingCheckout Endpoints
        [HttpGet("checkout/{id}")]
        [ProducesResponseType(typeof(DewormingCheckoutResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<DewormingCheckoutResponseDto>> GetDewormingCheckout(Guid id)
        {
            try
            {
                var result = await _checkoutService.GetByIdAsync(id);
                if (result == null)
                    return NotFound(new { message = $"Deworming checkout with id {id} not found." });
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { statusCode = 500, message = ex.Message });
            }
        }

        [HttpGet("checkout/visit/{visitId}")]
        [ProducesResponseType(typeof(IEnumerable<DewormingCheckoutResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<DewormingCheckoutResponseDto>>> GetDewormingCheckoutsByVisit(Guid visitId)
        {
            try
            {
                var result = await _checkoutService.GetByVisitIdAsync(visitId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { statusCode = 500, message = ex.Message });
            }
        }

        [HttpPost("checkout")]
        [ProducesResponseType(typeof(DewormingCheckoutResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<DewormingCheckoutResponseDto>> CreateDewormingCheckout([FromBody] CreateDewormingCheckoutRequestDto dto)
        {
            try
            {
                if (dto == null)
                {
                    return BadRequest(new { message = "Deworming checkout data is null." });
                }

                var result = await _checkoutService.CreateAsync(dto);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { statusCode = 500, message = ex.Message });
            }
        }

        [HttpPut("checkout/{id}")]
        [ProducesResponseType(typeof(DewormingCheckoutResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<DewormingCheckoutResponseDto>> UpdateDewormingCheckout(Guid id, [FromBody] UpdateDewormingCheckoutRequestDto dto)
        {
            try
            {
                if (dto == null)
                {
                    return BadRequest(new { message = "Deworming checkout data is null." });
                }

                if (id != dto.Id)
                {
                    return BadRequest(new { message = "Id in route does not match id in request body." });
                }

                var result = await _checkoutService.UpdateAsync(dto);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { statusCode = 500, message = ex.Message });
            }
        }

        [HttpDelete("checkout/{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult> DeleteDewormingCheckout(Guid id)
        {
            try
            {
                var result = await _checkoutService.DeleteAsync(id);
                return result ? NoContent() : NotFound(new { message = $"Deworming checkout with id {id} not found." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { statusCode = 500, message = ex.Message });
            }
        }
    }
}