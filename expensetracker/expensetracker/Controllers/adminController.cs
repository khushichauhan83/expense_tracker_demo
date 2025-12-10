using expensetracker.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace expensetracker.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class adminController : ControllerBase
    {
        private readonly AppDbContext _context;

        public adminController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/admin
        [HttpGet]
        public async Task<ActionResult<IEnumerable<admin>>> Getadmin()
        {
            return await _context.admin.ToListAsync();
        }

        // GET: api/admin/5
        [HttpGet("{id}")]
        public async Task<ActionResult<admin>> Getadmin(int id)
        {
            var admin = await _context.admin.FindAsync(id);

            if (admin == null)
            {
                return NotFound();
            }

            return admin;
        }

        // PUT: api/admin/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> Putadmin(int id, admin admin)
        {
            if (id != admin.adminid)
            {
                return BadRequest();
            }

            _context.Entry(admin).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!adminExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/admin
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<admin>> Postadmin(admin admin)
        {
            _context.admin.Add(admin);
            await _context.SaveChangesAsync();

            return CreatedAtAction("Getadmin", new { id = admin.adminid }, admin);
        }

        // DELETE: api/admin/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Deleteadmin(int id)
        {
            var admin = await _context.admin.FindAsync(id);
            if (admin == null)
            {
                return NotFound();
            }

            _context.admin.Remove(admin);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool adminExists(int id)
        {
            return _context.admin.Any(e => e.adminid == id);
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] adminlogindto dto)
        {
            if (dto == null)
                return BadRequest("Invalid request");

            var admin = _context.admin
                .FirstOrDefault(a => a.email == dto.email && a.password == dto.password);

            if (admin == null)
                return BadRequest("Invalid email or password");

            // Optional: Create a fake token (you can use JWT if you want)
            string token = "admintoken123";

            return Ok(new { success = true, token });
        }


        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var totalUsers = await _context.Users.CountAsync();
            var totalExpenses = await _context.Expenses.CountAsync();
            var totalCategories = await _context.category.CountAsync();

            return Ok(new
            {
                TotalUsers = totalUsers,
                TotalExpenses = totalExpenses,
                TotalCategories = totalCategories
            });
        }

        [HttpGet("getalluser")]
        public async Task<IActionResult> GetAllUsers() => Ok(await _context.Users.ToListAsync());



        [HttpPut("updatecategory/{cid}")]
        public async Task<IActionResult> UpdateCategory(int cid, [FromBody] category updatedCat)
        {
            if (string.IsNullOrWhiteSpace(updatedCat.cname))
                return BadRequest("Category name is required.");

            // Find existing category
            var cat = await _context.category.FindAsync(cid);
            if (cat == null) return NotFound("Category not found.");

            // Check if the new name already exists (optional)
            var exists = await _context.category.AnyAsync(c => c.cname == updatedCat.cname && c.cid != cid);
            if (exists) return BadRequest("Another category with this name already exists.");

            // Update category
            cat.cname = updatedCat.cname;
            await _context.SaveChangesAsync();

            return Ok(cat);
        }

        [HttpDelete("deletecategory/{cid}")]
        public async Task<IActionResult> DeleteCategory(int cid)
        {
            // Find category by ID
            var cat = await _context.category.FindAsync(cid);
            if (cat == null)
                return NotFound("Category not found.");

            // Remove the category
            _context.category.Remove(cat);
            await _context.SaveChangesAsync();

            return Ok("Category deleted successfully.");
        }

        [HttpGet("getcategories")]
        public async Task<IActionResult> GetCategories()
        {
            try
            {
                var categories = await _context.category
                    .Select(c => new { c.cid, c.cname }) // return only needed fields
                    .ToListAsync();

                return Ok(categories);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }


        // 2️⃣ Add new category (check duplicate by name only)
        [HttpPost("categories")]
        public async Task<IActionResult> AddCategory(category category)
        {
            var exists = await _context.category
                .AnyAsync(c => c.cname == category.cname);

            if (!exists)
            {
                _context.category.Add(category);
                await _context.SaveChangesAsync();
                return Ok(category);
            }
            return BadRequest("Category already exists");
        }

        // 3️⃣ Optional: Get category by ID (if needed)
        [HttpGet("categories/{cid}")]
        public async Task<IActionResult> GetCategoryById(int cid)
        {
            var category = await _context.category.FindAsync(cid);
            if (category == null)
                return NotFound("Category not found");
            return Ok(category);
        }

        [HttpGet("getexpenses")]
        //[Authorize(Roles = "Admin")] // Only admin can access
        public async Task<IActionResult> GetExpenses()
        {
            try
            {
                var expenses = await _context.Expenses
                    .Select(e => new
                    {
                        e.eid,
                        e.title,
                        e.amount,
                        e.category,
                        e.date,
                        e.id
                    })
                    .ToListAsync();

                return Ok(expenses);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("expenses/monthly")]
        public IActionResult GetMonthlyExpenses()
        {
            try
            {
                var monthly = _context.Expenses
                    .AsEnumerable() // ✅ Forces evaluation on client side (fix for SQLite)
                    .GroupBy(e => new {
                        Year = e.date.Year,
                        Month = e.date.Month
                    })
                    .Select(g => new
                    {
                        Month = $"{g.Key.Month:D2}-{g.Key.Year}",
                        Total = g.Sum(x => x.amount)
                    })
                    .OrderBy(x => x.Month)
                    .ToList();

                return Ok(monthly);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error in GetMonthlyExpenses", error = ex.Message });
            }
        }


        [HttpGet("expenses/categorydis")]
        public IActionResult GetCategoryDistribution()
        {
            var categoryData = _context.Expenses
                .GroupBy(e => e.category)
                .Select(g => new
                {
                    Category = g.Key,
                    Total = g.Sum(x => x.amount)
                })
                .ToList();

            return Ok(categoryData);
        }

        [HttpGet("expenses/topspenders")]
        public IActionResult GetTopSpenders()
        {
            try
            {
                var topSpenders = _context.Expenses
                    .Where(e => e.id != null)
                    .GroupBy(e => e.id)
                    .Select(g => new
                    {
                        UserId = g.Key,
                        UserName = _context.Users
                            .Where(u => u.id == g.Key)
                            .Select(u => u.name)
                            .FirstOrDefault() ?? "Unknown",
                        TotalSpent = g.Sum(x => x.amount)
                    })
                    .AsEnumerable() // ✅ fixes SQLite decimal ORDER BY issue
                    .OrderByDescending(x => x.TotalSpent)
                    .Take(5)
                    .ToList();

                return Ok(topSpenders);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error in GetTopSpenders", error = ex.Message });
            }
        }


        [HttpGet]
        [Route("feedback/user/{userId}")]
        public IActionResult GetUserFeedback(int userId)
        {
            var list = _context.feedback
                .Where(x => x.id == userId)
                .OrderByDescending(x => x.createdat)
                .ToList();

            return Ok(list);
        }

        [HttpGet]
        [Route("getallfeedback")]
        public IActionResult GetAllFeedback()
        {
            var list = _context.feedback
                .OrderByDescending(x => x.createdat)
                .ToList();

            return Ok(list);
        }


        [HttpPut("feedback/reply/{aid}")]
        public async Task<IActionResult> SendOrUpdateReply(int aid, [FromBody] ReplyDto model)
        {
            var feedback = await _context.feedback.FirstOrDefaultAsync(f => f.aid == aid);

            if (feedback == null)
                return NotFound("Feedback not found.");

            // Update or Insert reply
            feedback.admin_reply = model.admin_reply;
            feedback.repliedat = DateTime.Now;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Reply added/updated successfully!" });
        }



        [HttpPut("reply/{feedbackId}")]
        public async Task<IActionResult> ReplyToFeedback(int feedbackId, [FromBody] ReplyDto dto)
        {
            var feedback = await _context.feedback.FindAsync(feedbackId);

            if (feedback == null)
                return NotFound("Feedback not found");

            feedback.admin_reply = dto.admin_reply;
            feedback.repliedat = TimeZoneInfo.ConvertTimeFromUtc(
            DateTime.UtcNow,
            TimeZoneInfo.FindSystemTimeZoneById("India Standard Time")
            );


            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Reply sent successfully",
                admin_reply = feedback.admin_reply,
                replied_at = feedback.repliedat
            });
        }


        [HttpDelete("deletefeedback/{id}")]
        public async Task<IActionResult> DeleteFeedback(int id)
        {
            var fb = await _context.feedback.FindAsync(id);

            if (fb == null)
                return NotFound("Feedback not found");

            _context.feedback.Remove(fb);
            await _context.SaveChangesAsync();

            return Ok("Feedback deleted");
        }


    }
}
