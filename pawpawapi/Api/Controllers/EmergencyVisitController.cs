using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class EmergencyVisitController : ControllerBase
    {
        private readonly IEmergencyVisitService _emergencyVisitService;
        private readonly IEmergencyVitalService _emergencyVitalService;
        private readonly IEmergencyProcedureService _emergencyProcedureService;
        private readonly IEmergencyDischargeService _emergencyDischargeService;
        private readonly IEmergencyPrescriptionService _emergencyPrescriptionService;
        private readonly ILogger<EmergencyVisitController> _logger;

        public EmergencyVisitController(
            IEmergencyVisitService emergencyVisitService,
            IEmergencyVitalService emergencyVitalService,
            IEmergencyProcedureService emergencyProcedureService,
            IEmergencyDischargeService emergencyDischargeService,
            IEmergencyPrescriptionService emergencyPrescriptionService,
            ILogger<EmergencyVisitController> logger)
        {
            _emergencyVisitService = emergencyVisitService ?? throw new ArgumentNullException(nameof(emergencyVisitService));
            _emergencyVitalService = emergencyVitalService ?? throw new ArgumentNullException(nameof(emergencyVitalService));
            _emergencyProcedureService = emergencyProcedureService ?? throw new ArgumentNullException(nameof(emergencyProcedureService));
            _emergencyDischargeService = emergencyDischargeService ?? throw new ArgumentNullException(nameof(emergencyDischargeService));
            _emergencyPrescriptionService = emergencyPrescriptionService ?? throw new ArgumentNullException(nameof(emergencyPrescriptionService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        #region Emergency Triage Endpoints

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<EmergencyTriageResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<EmergencyTriageResponseDto>>> GetAll()
        {
            try
            {
                var items = await _emergencyVisitService.GetAllAsync();
                return Ok(items);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAll");
                return StatusCode(500, new { statusCode = 500, message = "An error occurred while retrieving emergency triage records" });
            }
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(EmergencyTriageResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<EmergencyTriageResponseDto>> GetById(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                    return BadRequest(new { statusCode = 400, message = "Invalid ID provided." });

                var item = await _emergencyVisitService.GetByIdAsync(id);
                if (item == null)
                    return NotFound(new { statusCode = 404, message = $"Emergency triage with ID {id} not found." });

                return Ok(item);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetById for EmergencyTriage {Id}", id);
                return StatusCode(500, new { statusCode = 500, message = "An error occurred while retrieving the emergency triage record" });
            }
        }

        [HttpGet("visit/{visitId}")]
        [ProducesResponseType(typeof(IEnumerable<EmergencyTriageResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<EmergencyTriageResponseDto>>> GetByVisitId(Guid visitId)
        {
            try
            {
                if (visitId == Guid.Empty)
                    return BadRequest(new { statusCode = 400, message = "Invalid visit ID provided." });

                var items = await _emergencyVisitService.GetByVisitIdAsync(visitId);
                return Ok(items);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByVisitId for visitId {VisitId}", visitId);
                return StatusCode(500, new { statusCode = 500, message = "An error occurred while retrieving emergency triage records" });
            }
        }

        [HttpPost]
        [ProducesResponseType(typeof(EmergencyTriageResponseDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<EmergencyTriageResponseDto>> Create([FromBody] CreateEmergencyTriageRequestDto dto)
        {
            try
            {
                if (dto == null)
                    return BadRequest(new { statusCode = 400, message = "Emergency triage data is required." });

                if (!ModelState.IsValid)
                    return BadRequest(new { statusCode = 400, message = "Invalid data provided.", errors = ModelState });

                var result = await _emergencyVisitService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid operation while creating emergency triage");
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Create for emergency triage");
                return StatusCode(500, new { statusCode = 500, message = "An error occurred while creating the emergency triage record" });
            }
        }

        [HttpPut("{id}")]
        [ProducesResponseType(typeof(EmergencyTriageResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<EmergencyTriageResponseDto>> Update(Guid id, [FromBody] UpdateEmergencyTriageRequestDto dto)
        {
            try
            {
                if (id == Guid.Empty)
                    return BadRequest(new { statusCode = 400, message = "Invalid ID provided." });

                if (dto == null)
                    return BadRequest(new { statusCode = 400, message = "Emergency triage data is required." });

                if (!ModelState.IsValid)
                    return BadRequest(new { statusCode = 400, message = "Invalid data provided.", errors = ModelState });

                dto.Id = id; // Ensure the ID in the DTO matches the route parameter

                var result = await _emergencyVisitService.UpdateAsync(dto);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Emergency triage {Id} not found for update", id);
                return NotFound(new { statusCode = 404, message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid operation while updating emergency triage {Id}", id);
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Update for emergency triage {Id}", id);
                return StatusCode(500, new { statusCode = 500, message = "An error occurred while updating the emergency triage record" });
            }
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult> Delete(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                    return BadRequest(new { statusCode = 400, message = "Invalid ID provided." });

                await _emergencyVisitService.DeleteAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Emergency triage {Id} not found for deletion", id);
                return NotFound(new { statusCode = 404, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Delete for emergency triage {Id}", id);
                return StatusCode(500, new { statusCode = 500, message = "An error occurred while deleting the emergency triage record" });
            }
        }

        #endregion

        #region Emergency Vital Endpoints

        [HttpGet("vitals")]
        [ProducesResponseType(typeof(IEnumerable<EmergencyVitalResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<EmergencyVitalResponseDto>>> GetAllVitals()
        {
            try
            {
                var items = await _emergencyVitalService.GetAllAsync();
                return Ok(items);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAllVitals");
                return StatusCode(500, new { statusCode = 500, message = "An error occurred while retrieving emergency vital records" });
            }
        }

        [HttpGet("vitals/{id}")]
        [ProducesResponseType(typeof(EmergencyVitalResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<EmergencyVitalResponseDto>> GetVitalById(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                    return BadRequest(new { statusCode = 400, message = "Invalid ID provided." });

                var item = await _emergencyVitalService.GetByIdAsync(id);
                if (item == null)
                    return NotFound(new { statusCode = 404, message = $"Emergency vital with ID {id} not found." });

                return Ok(item);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetVitalById for EmergencyVital {Id}", id);
                return StatusCode(500, new { statusCode = 500, message = "An error occurred while retrieving the emergency vital record" });
            }
        }

        [HttpGet("vitals/visit/{visitId}")]
        [ProducesResponseType(typeof(IEnumerable<EmergencyVitalResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<EmergencyVitalResponseDto>>> GetVitalsByVisitId(Guid visitId)
        {
            try
            {
                if (visitId == Guid.Empty)
                    return BadRequest(new { statusCode = 400, message = "Invalid visit ID provided." });

                var items = await _emergencyVitalService.GetByVisitIdAsync(visitId);
                return Ok(items);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetVitalsByVisitId for visitId {VisitId}", visitId);
                return StatusCode(500, new { statusCode = 500, message = "An error occurred while retrieving emergency vital records" });
            }
        }

        [HttpPost("vitals")]
        [ProducesResponseType(typeof(EmergencyVitalResponseDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<EmergencyVitalResponseDto>> CreateVital([FromBody] CreateEmergencyVitalRequestDto dto)
        {
            try
            {
                if (dto == null)
                    return BadRequest(new { statusCode = 400, message = "Emergency vital data is required." });

                if (!ModelState.IsValid)
                    return BadRequest(new { statusCode = 400, message = "Invalid data provided.", errors = ModelState });

                var result = await _emergencyVitalService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetVitalById), new { id = result.Id }, result);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid operation while creating emergency vital");
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CreateVital for emergency vital");
                return StatusCode(500, new { statusCode = 500, message = "An error occurred while creating the emergency vital record" });
            }
        }

        [HttpPut("vitals/{id}")]
        [ProducesResponseType(typeof(EmergencyVitalResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<EmergencyVitalResponseDto>> UpdateVital(Guid id, [FromBody] UpdateEmergencyVitalRequestDto dto)
        {
            try
            {
                if (id == Guid.Empty)
                    return BadRequest(new { statusCode = 400, message = "Invalid ID provided." });

                if (dto == null)
                    return BadRequest(new { statusCode = 400, message = "Emergency vital data is required." });

                if (!ModelState.IsValid)
                    return BadRequest(new { statusCode = 400, message = "Invalid data provided.", errors = ModelState });

                dto.Id = id; // Ensure the ID in the DTO matches the route parameter

                var result = await _emergencyVitalService.UpdateAsync(dto);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Emergency vital {Id} not found for update", id);
                return NotFound(new { statusCode = 404, message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid operation while updating emergency vital {Id}", id);
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateVital for emergency vital {Id}", id);
                return StatusCode(500, new { statusCode = 500, message = "An error occurred while updating the emergency vital record" });
            }
        }

        [HttpDelete("vitals/{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult> DeleteVital(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                    return BadRequest(new { statusCode = 400, message = "Invalid ID provided." });

                await _emergencyVitalService.DeleteAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Emergency vital {Id} not found for deletion", id);
                return NotFound(new { statusCode = 404, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteVital for emergency vital {Id}", id);
                return StatusCode(500, new { statusCode = 500, message = "An error occurred while deleting the emergency vital record" });
            }
        }

        #endregion

        #region Emergency Procedure Endpoints

        [HttpGet("procedures")]
        [ProducesResponseType(typeof(IEnumerable<EmergencyProcedureResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<EmergencyProcedureResponseDto>>> GetAllProcedures()
        {
            try
            {
                var items = await _emergencyProcedureService.GetAllAsync();
                return Ok(items);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAllProcedures");
                return StatusCode(500, new { statusCode = 500, message = "An error occurred while retrieving emergency procedure records" });
            }
        }

        [HttpGet("procedures/{id}")]
        [ProducesResponseType(typeof(EmergencyProcedureResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<EmergencyProcedureResponseDto>> GetProcedureById(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                    return BadRequest(new { statusCode = 400, message = "Invalid ID provided." });

                var item = await _emergencyProcedureService.GetByIdAsync(id);
                if (item == null)
                    return NotFound(new { statusCode = 404, message = $"Emergency procedure with ID {id} not found." });

                return Ok(item);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetProcedureById for EmergencyProcedure {Id}", id);
                return StatusCode(500, new { statusCode = 500, message = "An error occurred while retrieving the emergency procedure record" });
            }
        }

        [HttpGet("procedures/visit/{visitId}")]
        [ProducesResponseType(typeof(IEnumerable<EmergencyProcedureResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<EmergencyProcedureResponseDto>>> GetProceduresByVisitId(Guid visitId)
        {
            try
            {
                if (visitId == Guid.Empty)
                    return BadRequest(new { statusCode = 400, message = "Invalid visit ID provided." });

                var items = await _emergencyProcedureService.GetByVisitIdAsync(visitId);
                return Ok(items);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetProceduresByVisitId for visitId {VisitId}", visitId);
                return StatusCode(500, new { statusCode = 500, message = "An error occurred while retrieving emergency procedure records" });
            }
        }

        [HttpPost("procedures")]
        [ProducesResponseType(typeof(EmergencyProcedureResponseDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<EmergencyProcedureResponseDto>> CreateProcedure([FromBody] CreateEmergencyProcedureRequestDto dto)
        {
            try
            {
                if (dto == null)
                    return BadRequest(new { statusCode = 400, message = "Emergency procedure data is required." });

                if (!ModelState.IsValid)
                    return BadRequest(new { statusCode = 400, message = "Invalid data provided.", errors = ModelState });

                var result = await _emergencyProcedureService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetProcedureById), new { id = result.Id }, result);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid operation while creating emergency procedure");
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CreateProcedure for emergency procedure");
                return StatusCode(500, new { statusCode = 500, message = "An error occurred while creating the emergency procedure record" });
            }
        }

        [HttpPut("procedures/{id}")]
        [ProducesResponseType(typeof(EmergencyProcedureResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<EmergencyProcedureResponseDto>> UpdateProcedure(Guid id, [FromBody] UpdateEmergencyProcedureRequestDto dto)
        {
            try
            {
                if (id == Guid.Empty)
                    return BadRequest(new { statusCode = 400, message = "Invalid ID provided." });

                if (dto == null)
                    return BadRequest(new { statusCode = 400, message = "Emergency procedure data is required." });

                if (!ModelState.IsValid)
                    return BadRequest(new { statusCode = 400, message = "Invalid data provided.", errors = ModelState });

                dto.Id = id; // Ensure the ID in the DTO matches the route parameter

                var result = await _emergencyProcedureService.UpdateAsync(dto);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Emergency procedure {Id} not found for update", id);
                return NotFound(new { statusCode = 404, message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid operation while updating emergency procedure {Id}", id);
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateProcedure for emergency procedure {Id}", id);
                return StatusCode(500, new { statusCode = 500, message = "An error occurred while updating the emergency procedure record" });
            }
        }

        [HttpDelete("procedures/{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult> DeleteProcedure(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                    return BadRequest(new { statusCode = 400, message = "Invalid ID provided." });

                await _emergencyProcedureService.DeleteAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Emergency procedure {Id} not found for deletion", id);
                return NotFound(new { statusCode = 404, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteProcedure for emergency procedure {Id}", id);
                return StatusCode(500, new { statusCode = 500, message = "An error occurred while deleting the emergency procedure record" });
            }
        }

        #endregion

        #region Emergency Discharge Endpoints

        [HttpGet("discharges")]
        [ProducesResponseType(typeof(IEnumerable<EmergencyDischargeWithPrescriptionsResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<EmergencyDischargeWithPrescriptionsResponseDto>>> GetAllDischarges()
        {
            try
            {
                var items = await _emergencyDischargeService.GetAllAsync();
                return Ok(items);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAllDischarges");
                return StatusCode(500, new { statusCode = 500, message = "An error occurred while retrieving emergency discharge records" });
            }
        }

        [HttpGet("discharges/{id}")]
        [ProducesResponseType(typeof(EmergencyDischargeWithPrescriptionsResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<EmergencyDischargeWithPrescriptionsResponseDto>> GetDischargeById(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                    return BadRequest(new { statusCode = 400, message = "Invalid ID provided." });

                var item = await _emergencyDischargeService.GetByIdAsync(id);
                if (item == null)
                    return NotFound(new { statusCode = 404, message = $"Emergency discharge with ID {id} not found." });

                return Ok(item);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetDischargeById for EmergencyDischarge {Id}", id);
                return StatusCode(500, new { statusCode = 500, message = "An error occurred while retrieving the emergency discharge record" });
            }
        }

        [HttpGet("discharges/visit/{visitId}")]
        [ProducesResponseType(typeof(IEnumerable<EmergencyDischargeWithPrescriptionsResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<EmergencyDischargeWithPrescriptionsResponseDto>>> GetDischargesByVisitId(Guid visitId)
        {
            try
            {
                if (visitId == Guid.Empty)
                    return BadRequest(new { statusCode = 400, message = "Invalid visit ID provided." });

                var items = await _emergencyDischargeService.GetByVisitIdAsync(visitId);
                return Ok(items);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetDischargesByVisitId for visitId {VisitId}", visitId);
                return StatusCode(500, new { statusCode = 500, message = "An error occurred while retrieving emergency discharge records" });
            }
        }

        [HttpPost("discharges")]
        [ProducesResponseType(typeof(EmergencyDischargeWithPrescriptionsResponseDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<EmergencyDischargeWithPrescriptionsResponseDto>> CreateDischarge([FromBody] EmergencyDischargeWithPrescriptionsRequestDto dto)
        {
            try
            {
                if (dto == null)
                    return BadRequest(new { statusCode = 400, message = "Emergency discharge data is required." });

                if (!ModelState.IsValid)
                    return BadRequest(new { statusCode = 400, message = "Invalid data provided.", errors = ModelState });

                var result = await _emergencyDischargeService.CreateWithPrescriptionsAsync(dto);
                return CreatedAtAction(nameof(GetDischargeById), new { id = result.Id }, result);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid operation while creating emergency discharge");
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CreateDischarge for emergency discharge");
                return StatusCode(500, new { statusCode = 500, message = "An error occurred while creating the emergency discharge record" });
            }
        }

        [HttpPut("discharges/{id}")]
        [ProducesResponseType(typeof(EmergencyDischargeWithPrescriptionsResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<EmergencyDischargeWithPrescriptionsResponseDto>> UpdateDischarge(Guid id, [FromBody] EmergencyDischargeWithPrescriptionsRequestDto dto)
        {
            try
            {
                if (id == Guid.Empty)
                    return BadRequest(new { statusCode = 400, message = "Invalid ID provided." });

                if (dto == null)
                    return BadRequest(new { statusCode = 400, message = "Emergency discharge data is required." });

                if (!ModelState.IsValid)
                    return BadRequest(new { statusCode = 400, message = "Invalid data provided.", errors = ModelState });

                dto.Id = id; // Ensure the ID in the DTO matches the route parameter

                var result = await _emergencyDischargeService.UpdateWithPrescriptionsAsync(id, dto);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Emergency discharge {Id} not found for update", id);
                return NotFound(new { statusCode = 404, message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid operation while updating emergency discharge {Id}", id);
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateDischarge for emergency discharge {Id}", id);
                return StatusCode(500, new { statusCode = 500, message = "An error occurred while updating the emergency discharge record" });
            }
        }

        [HttpDelete("discharges/{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult> DeleteDischarge(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                    return BadRequest(new { statusCode = 400, message = "Invalid ID provided." });

                await _emergencyDischargeService.DeleteAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Emergency discharge {Id} not found for deletion", id);
                return NotFound(new { statusCode = 404, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteDischarge for emergency discharge {Id}", id);
                return StatusCode(500, new { statusCode = 500, message = "An error occurred while deleting the emergency discharge record" });
            }
        }

        #endregion

        #region Emergency Prescription Endpoints

        [HttpGet("prescriptions")]
        [ProducesResponseType(typeof(IEnumerable<EmergencyPrescriptionResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<EmergencyPrescriptionResponseDto>>> GetAllPrescriptions()
        {
            try
            {
                var items = await _emergencyPrescriptionService.GetAllAsync();
                return Ok(items);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAllPrescriptions");
                return StatusCode(500, new { statusCode = 500, message = "An error occurred while retrieving emergency prescription records" });
            }
        }

        [HttpGet("prescriptions/{id}")]
        [ProducesResponseType(typeof(EmergencyPrescriptionResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<EmergencyPrescriptionResponseDto>> GetPrescriptionById(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                    return BadRequest(new { statusCode = 400, message = "Invalid ID provided." });

                var item = await _emergencyPrescriptionService.GetByIdAsync(id);
                if (item == null)
                    return NotFound(new { statusCode = 404, message = $"Emergency prescription with ID {id} not found." });

                return Ok(item);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetPrescriptionById for EmergencyPrescription {Id}", id);
                return StatusCode(500, new { statusCode = 500, message = "An error occurred while retrieving the emergency prescription record" });
            }
        }

        [HttpGet("prescriptions/visit/{visitId}")]
        [ProducesResponseType(typeof(IEnumerable<EmergencyPrescriptionResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<EmergencyPrescriptionResponseDto>>> GetPrescriptionsByVisitId(Guid visitId)
        {
            try
            {
                if (visitId == Guid.Empty)
                    return BadRequest(new { statusCode = 400, message = "Invalid visit ID provided." });

                var items = await _emergencyPrescriptionService.GetByVisitIdAsync(visitId);
                return Ok(items);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetPrescriptionsByVisitId for visitId {VisitId}", visitId);
                return StatusCode(500, new { statusCode = 500, message = "An error occurred while retrieving emergency prescription records" });
            }
        }

        [HttpGet("prescriptions/discharge/{dischargeId}")]
        [ProducesResponseType(typeof(IEnumerable<EmergencyPrescriptionResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<EmergencyPrescriptionResponseDto>>> GetPrescriptionsByDischargeId(Guid dischargeId)
        {
            try
            {
                if (dischargeId == Guid.Empty)
                    return BadRequest(new { statusCode = 400, message = "Invalid discharge ID provided." });

                var items = await _emergencyPrescriptionService.GetByDischargeIdAsync(dischargeId);
                return Ok(items);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetPrescriptionsByDischargeId for dischargeId {DischargeId}", dischargeId);
                return StatusCode(500, new { statusCode = 500, message = "An error occurred while retrieving emergency prescription records" });
            }
        }

        [HttpPost("prescriptions")]
        [ProducesResponseType(typeof(EmergencyPrescriptionResponseDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<EmergencyPrescriptionResponseDto>> CreatePrescription([FromBody] CreateEmergencyPrescriptionRequestDto dto)
        {
            try
            {
                if (dto == null)
                    return BadRequest(new { statusCode = 400, message = "Emergency prescription data is required." });

                if (!ModelState.IsValid)
                    return BadRequest(new { statusCode = 400, message = "Invalid data provided.", errors = ModelState });

                var result = await _emergencyPrescriptionService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetPrescriptionById), new { id = result.Id }, result);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid operation while creating emergency prescription");
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CreatePrescription for emergency prescription");
                return StatusCode(500, new { statusCode = 500, message = "An error occurred while creating the emergency prescription record" });
            }
        }

        [HttpPut("prescriptions/{id}")]
        [ProducesResponseType(typeof(EmergencyPrescriptionResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<EmergencyPrescriptionResponseDto>> UpdatePrescription(Guid id, [FromBody] UpdateEmergencyPrescriptionRequestDto dto)
        {
            try
            {
                if (id == Guid.Empty)
                    return BadRequest(new { statusCode = 400, message = "Invalid ID provided." });

                if (dto == null)
                    return BadRequest(new { statusCode = 400, message = "Emergency prescription data is required." });

                if (!ModelState.IsValid)
                    return BadRequest(new { statusCode = 400, message = "Invalid data provided.", errors = ModelState });

                dto.Id = id; // Ensure the ID in the DTO matches the route parameter

                var result = await _emergencyPrescriptionService.UpdateAsync(dto);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Emergency prescription {Id} not found for update", id);
                return NotFound(new { statusCode = 404, message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid operation while updating emergency prescription {Id}", id);
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdatePrescription for emergency prescription {Id}", id);
                return StatusCode(500, new { statusCode = 500, message = "An error occurred while updating the emergency prescription record" });
            }
        }

        [HttpDelete("prescriptions/{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult> DeletePrescription(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                    return BadRequest(new { statusCode = 400, message = "Invalid ID provided." });

                await _emergencyPrescriptionService.DeleteAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Emergency prescription {Id} not found for deletion", id);
                return NotFound(new { statusCode = 404, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeletePrescription for emergency prescription {Id}", id);
                return StatusCode(500, new { statusCode = 500, message = "An error occurred while deleting the emergency prescription record" });
            }
        }

        #endregion
    }
}
