using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class ExpenseController : ControllerBase
    {
        private readonly IExpenseService _expenseService;

        public ExpenseController(IExpenseService expenseService)
        {
            _expenseService = expenseService ?? throw new ArgumentNullException(nameof(expenseService));
        }

        /// <summary>
        /// Gets all expenses with pagination
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(PaginatedResponseDto<ExpenseResponseDto>), 200)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<PaginatedResponseDto<ExpenseResponseDto>>> GetAll(
        [FromQuery] ExpenseFilterRequestDto filter)
        {
            try
            {
                var expenses = await _expenseService.GetAllAsync(filter);
                return Ok(expenses);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while retrieving expenses", message = ex.Message });
            }
        }


        /// <summary>
        /// Gets an expense by ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ExpenseResponseDto), 200)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<ExpenseResponseDto>> GetById(Guid id)
        {
            try
            {
                var expense = await _expenseService.GetByIdAsync(id);
                if (expense == null)
                    return NotFound(new { error = $"Expense with ID {id} not found" });
                return Ok(expense);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while retrieving the expense", message = ex.Message });
            }
        }

        /// <summary>
        /// Creates a new expense
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(ExpenseResponseDto), 201)]
        [ProducesResponseType(400)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<ExpenseResponseDto>> Create([FromBody] CreateExpenseRequestDto dto)
        {
            try
            {
                if (dto == null)
                    return BadRequest(new { error = "Request body cannot be null" });

                var created = await _expenseService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while creating the expense", message = ex.Message });
            }
        }

        /// <summary>
        /// Updates an existing expense
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ExpenseResponseDto), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<ExpenseResponseDto>> Update(Guid id, [FromBody] UpdateExpenseRequestDto dto)
        {
            try
            {
                if (dto == null)
                    return BadRequest(new { error = "Request body cannot be null" });

                var updated = await _expenseService.UpdateAsync(id, dto);
                return Ok(updated);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while updating the expense", message = ex.Message });
            }
        }

        /// <summary>
        /// Deletes an expense
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var success = await _expenseService.DeleteAsync(id);
                if (!success)
                    return NotFound(new { error = $"Expense with ID {id} not found" });
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while deleting the expense", message = ex.Message });
            }
        }
    }
}