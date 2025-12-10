using expensetracker.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using System.Net;
using System.Net.Mail;
using System.Linq;

namespace expensetracker.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly jwtsetting _jwtSettings;

        public UserController(AppDbContext context, IOptions<jwtsetting> jwtSettings)
        {
            _context = context;
            _jwtSettings = jwtSettings.Value;
        }

        // -------------------- LOGIN --------------------
        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login(logindto request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.email.ToLower() == request.email.ToLower()
                                                                      && u.passwordhash == request.passwordhash);
            if (user == null)
                return Unauthorized("Invalid credentials");

            if (!user.IsEmailVerified)
                return Unauthorized("Email not verified. Please verify your email.");

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_jwtSettings.SecretKey);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.id.ToString()),
                    new Claim(ClaimTypes.Email, user.email),
                    new Claim(ClaimTypes.Name, user.name)
                }),
                Expires = DateTime.UtcNow.AddHours(1),
                Issuer = _jwtSettings.Issuer,
                Audience = _jwtSettings.Audience,
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return Ok(new
            {
                token = tokenHandler.WriteToken(token),
                message = "Login successful",
                userId = user.id
            });
        }

        // -------------------- REGISTER --------------------
        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<IActionResult> Register(userdto request)
        {
            if (string.IsNullOrWhiteSpace(request.name) ||
                string.IsNullOrWhiteSpace(request.email) ||
                string.IsNullOrWhiteSpace(request.passwordhash) ||
                string.IsNullOrWhiteSpace(request.gender) ||
                string.IsNullOrWhiteSpace(request.bdate) ||
                string.IsNullOrWhiteSpace(request.pno))
            {
                return BadRequest("All fields are required.");
            }

            if (await _context.Users.AnyAsync(u => u.email.ToLower() == request.email.ToLower()))
            {
                return BadRequest("Email already exists.");
            }

            var user = new user
            {
                name = request.name,
                email = request.email,
                passwordhash = request.passwordhash,
                gender = request.gender,
                bdate = request.bdate,
                pno = request.pno,
                createdat = DateTime.Now,
                OTP = GenerateOTP(),
                OTPGeneratedAt = DateTime.Now,
                IsEmailVerified = false
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync(); // Save user first

            try
            {
                await SendOtpEmailAsync(user.email, user.OTP);
            }
            catch (Exception ex)
            {
                return BadRequest("Error sending OTP email: " + ex.Message);
            }

            return Ok(new { message = "User registered successfully. OTP sent to your email.", userId = user.id });
        }

        // -------------------- VERIFY OTP --------------------
        [AllowAnonymous]
        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp(otpdto request)
        {
            var user = await _context.Users.FindAsync(request.userId);
            if (user == null) return NotFound("User not found");

            // Check if OTP is null
            if (string.IsNullOrEmpty(user.OTP))
                return BadRequest("OTP not generated. Please resend OTP.");

            // Check OTP match
            if (user.OTP != request.OTP)
                return BadRequest("Invalid OTP");

            // Check OTP expiry (1 minute)
            if ((DateTime.Now - user.OTPGeneratedAt.Value).TotalMinutes > 1)
                return BadRequest("OTP expired. Please resend OTP.");

            // Verify user
            user.IsEmailVerified = true;
            user.OTP = null;
            user.OTPGeneratedAt = null;
            await _context.SaveChangesAsync();

            return Ok("Email verified successfully");
        }

        // -------------------- RESEND OTP --------------------

        [AllowAnonymous]
        [HttpPost("resend-otp")]
        public async Task<IActionResult> ResendOtp([FromBody] resendOtpDto request)
        {
            var user = await _context.Users.FindAsync(request.userId);
            if (user == null) return NotFound("User not found");
            if (user.IsEmailVerified) return BadRequest("User already verified");

            // Generate new OTP
            user.OTP = GenerateOTP();
            user.OTPGeneratedAt = DateTime.Now;
            await _context.SaveChangesAsync();

            // Send OTP email
            try
            {
                await SendOtpEmailAsync(user.email, user.OTP);
            }
            catch (Exception ex)
            {
                return BadRequest("Error sending OTP email: " + ex.Message);
            }

            return Ok(new { message = "OTP resent successfully" });
        }




        // -------------------- HELPER METHODS --------------------
        private string GenerateOTP()
        {
            Random random = new Random();
            return random.Next(1000, 9999).ToString(); // 4-digit OTP
        }

        private async Task SendOtpEmailAsync(string userEmail, string otp)
        {
            var fromAddress = new MailAddress("your app gmail", "ExpenseTracker");
            var toAddress = new MailAddress(userEmail);
            const string fromPassword = "16-character App Password"; 
            const string subject = "ExpenseTracker OTP Verification";
            string body = $"Your OTP for ExpenseTracker registration is: {otp}. It is valid for 1 minutes.";

            using (var smtp = new SmtpClient("smtp.gmail.com", 587))
            {
                smtp.EnableSsl = true;
                smtp.DeliveryMethod = SmtpDeliveryMethod.Network;
                smtp.UseDefaultCredentials = false;
                smtp.Credentials = new NetworkCredential(fromAddress.Address, fromPassword);

                using (var message = new MailMessage(fromAddress, toAddress)
                {
                    Subject = subject,
                    Body = body
                })
                {
                    await smtp.SendMailAsync(message);
                }
            }
        }

        // -------------------- USERS --------------------
        [HttpGet]
        public async Task<IActionResult> GetAllUsers() => Ok(await _context.Users.ToListAsync());

        [HttpGet("getuser/{id}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            var user = await _context.Users.Include(u => u.Expenses).FirstOrDefaultAsync(u => u.id == id);
            if (user == null) return NotFound("User not found");
            return Ok(user);
        }

        [HttpPut("updateuser/{id}")]
        public async Task<IActionResult> UpdateUser(int id, userdto request)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound("User not found");

            user.name = request.name;
            user.email = request.email;
            user.gender = request.gender;
            user.bdate = request.bdate;
            user.pno = request.pno;
            user.passwordhash = request.passwordhash;

            await _context.SaveChangesAsync();
            return Ok("User updated successfully");
        }

        [HttpDelete("deleteuser/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.Include(u => u.Expenses).FirstOrDefaultAsync(u => u.id == id);
            if (user == null) return NotFound("User not found");

            _context.Expenses.RemoveRange(user.Expenses);
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok("User and their expenses deleted successfully");
        }

        // -------------------- EXPENSES --------------------
        //[HttpPost("addexpense")]
        //public async Task<IActionResult> AddExpense(expensedto request)
        //{
        //    var user = await _context.Users.FindAsync(request.id);
        //    if (user == null) return NotFound("User not found.");

        //    var expense = new expense
        //    {
        //        title = request.title,
        //        amount = request.amount,
        //        category = request.category,
        //        date = request.date,
        //        id = request.id
        //    };

        //    _context.Expenses.Add(expense);
        //    await _context.SaveChangesAsync();
        //    return Ok("Expense added successfully");
        //}


        //[HttpPost("addexpense")]
        //public async Task<IActionResult> AddExpense(expensedto request)
        //{
        //    var user = await _context.Users.FindAsync(request.id);
        //    if (user == null) return NotFound("User not found.");

        //    var expense = new expense
        //    {
        //        title = request.title,
        //        amount = request.amount,
        //        category = request.category,
        //        date = request.date,
        //        id = request.id
        //    };

        //    _context.Expenses.Add(expense);
        //    await _context.SaveChangesAsync();

        //    return Ok(expense); // return saved expense
        //}


        [HttpPost("addexpense")]
        public async Task<IActionResult> AddExpense(expensedto request)
        {
            // 1️⃣ Check if user exists
            var user = await _context.Users.FindAsync(request.id);
            if (user == null)
                return NotFound("User not found.");

            // 2️⃣ Find category (already exists in DB)
            var category = await _context.category
                .FirstOrDefaultAsync(c => c.cid == request.cid);

            var payment_method = await _context.payment_Method.FirstOrDefaultAsync(pm => pm.pmid == request.pmid);

            if (category == null)
                return BadRequest("Selected category does not exist.");

            if (payment_method == null)
                return BadRequest("Selected payment method does not exist.");

            // 3️⃣ Create a new expense record
            var expense = new expense
            {
                title = request.title,
                amount = request.amount,
                category = category.cname,   // store category name
                date = request.date,
                id = request.id,// link expense with user
                payment_method = payment_method.pmname
            };

           
            _context.Expenses.Add(expense);
            await _context.SaveChangesAsync();

            
            return Ok(new
            {
                message = "Expense added successfully.",
                expense
            });
        }




        [Authorize]
        [HttpGet("getexpenses")]
        public async Task<IActionResult> GetExpenses()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized("User ID not found in token");

            int userId = int.Parse(userIdClaim);
            var expenses = await _context.Expenses.Where(e => e.id == userId).ToListAsync();
            return Ok(expenses);
        }

        [HttpPut("updateexpense/{eid}")]
        public async Task<IActionResult> UpdateExpense(int eid, expensedto request)
        {
            // 1️⃣ Find existing expense by ID
            var expense = await _context.Expenses.FindAsync(eid);
            if (expense == null)
                return NotFound("Expense not found.");

            // 2️⃣ Lookup category by cid (category already exists in DB)
            var category = await _context.category
                .FirstOrDefaultAsync(c => c.cid == request.cid);

            var payment_method = await _context.payment_Method
                .FirstOrDefaultAsync(pm => pm.pmid == request.pmid);


            if (category == null)
                return BadRequest("Selected category does not exist.");

            if (payment_method == null)
                return BadRequest("Selected payment method does not exist.");

            // 3️⃣ Update expense fields
            expense.title = request.title;
            expense.amount = request.amount;
            expense.category = category.cname; // store category name
            expense.date = request.date;
            expense.id = request.id;            // ensure correct user linkage
            expense.payment_method = payment_method.pmname;

            // 4️⃣ Save changes
            _context.Expenses.Update(expense);
            await _context.SaveChangesAsync();

            // 5️⃣ Return success
            return Ok(new
            {
                message = "Expense updated successfully!",
                expense
            });
        }



        [HttpDelete("deleteexpense/{eid}")]
        public async Task<IActionResult> DeleteExpense(int eid)
        {
            var expense = await _context.Expenses.FindAsync(eid);
            if (expense == null) return NotFound("Expense not found");

            _context.Expenses.Remove(expense);
            await _context.SaveChangesAsync();
            return Ok("Expense deleted successfully");
        }

        // -------------------- FILTERS --------------------
        [HttpGet("filter/date")]
        public async Task<IActionResult> FilterByDateRange(DateTime startDate, DateTime endDate)
            => Ok(await _context.Expenses.Include(e => e.User)
                                         .Where(e => e.date >= startDate && e.date <= endDate)
                                         .ToListAsync());

        [HttpGet("filter/category/{category}")]
        public async Task<IActionResult> FilterByCategory(string category)
            => Ok(await _context.Expenses.Where(e => e.category == category).ToListAsync());

        [HttpGet("filter/amount")]
        public async Task<IActionResult> FilterByAmountRange(decimal min, decimal max)
            => Ok(await _context.Expenses.Where(e => e.amount >= min && e.amount <= max).ToListAsync());

        [HttpGet("me")]
        public IActionResult GetLoggedInUser()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            var name = User.FindFirst(ClaimTypes.Name)?.Value;
            return Ok(new { userId, email, name });
        }

        // 1️⃣ Get all categories (no user filtering needed)
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


        [HttpGet("getbyuser/{userId}")]
        public async Task<IActionResult> GetExpensesByUser(int userId)
        {
            var expenses = await _context.Expenses
                .Where(e => e.id == userId)
                .Select(e => new
                {
                    e.amount,
                    Category = e.category, // or just e.Category if string
                    e.date
                })
                .ToListAsync();

            return Ok(expenses);
        }


        [HttpGet("payment_method")]
        public IActionResult GetPaymentMethods()
        {
            var list = _context.payment_Method.ToList();
            return Ok(list);
        }


        [HttpPost("addbudget")]
        public async Task<IActionResult> AddBudget([FromBody] budgetdto dto)
        {
            if (await _context.budget.AnyAsync(b => b.id == dto.id && b.month_year == dto.month_year))
            {
                return BadRequest("Budget already exists for this month.");
            }

            var budget = new budget
            {
                id = dto.id,
                month_year = dto.month_year,
                amount = dto.amount
            };

            _context.budget.Add(budget);
            await _context.SaveChangesAsync();
            return Ok(budget);
        }

        [HttpPut("updatebudget")]
        public async Task<IActionResult> UpdateBudget([FromBody] budgetdto dto)
        {
            var budget = await _context.budget.FirstOrDefaultAsync(b => b.id == dto.id && b.month_year == dto.month_year);
            if (budget == null) return NotFound("Budget not found.");

            budget.amount = dto.amount;
            budget.updatedat = DateTime.Now;

            await _context.SaveChangesAsync();
            return Ok(budget);
        }

        [HttpGet("getbudget/{id}/{month_year}")]
        public async Task<IActionResult> GetBudget(int id, string month_year)
        {
            var budget = await _context.budget
                .Where(b => b.id == id && b.month_year == month_year)
                .ToListAsync();

            if (budget.Count == 0) return Ok(new List<budget>()); // return empty array
            return Ok(budget);
        }



        [HttpGet("getexpenses/{userId}/{monthYear}")]
        public async Task<IActionResult> GetMonthlyExpenses(int userId, string monthYear)
        {
            try
            {
                if (string.IsNullOrEmpty(monthYear) || monthYear.Length != 7)
                    return BadRequest("Invalid monthYear format. Expected YYYY-MM.");

                int year = int.Parse(monthYear.Substring(0, 4));
                int month = int.Parse(monthYear.Substring(5, 2));

                var expenses = await _context.Expenses
                    .Where(e => e.id == userId && e.date.Year == year && e.date.Month == month)
                    .ToListAsync();

                return Ok(expenses);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    type = "https://tools.ietf.org/html/rfc7231#section-6.6.1",
                    title = "Internal Server Error",
                    status = 500,
                    errors = ex.Message,
                    traceId = HttpContext.TraceIdentifier
                });
            }
        }


        [HttpPost("add")]
        public async Task<IActionResult> AddFeedback([FromBody] feedback feedback)
        {
            if (feedback == null || string.IsNullOrWhiteSpace(feedback.msg))
                return BadRequest("Feedback message is required.");

            feedback.createdat = TimeZoneInfo.ConvertTimeFromUtc(
    DateTime.UtcNow,
    TimeZoneInfo.FindSystemTimeZoneById("India Standard Time")
);

            _context.feedback.Add(feedback);

            try
            {
                await _context.SaveChangesAsync();
                return Ok(feedback);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Failed to save feedback: {ex.Message}");
            }
        }


        [HttpGet("getfeedbackbyuser/{userId}")]
        public async Task<IActionResult> GetFeedbacksByUser(int userId)
        {
            var feedbacks = await _context.feedback
                .Where(f => f.id == userId)
                .ToListAsync();

            return Ok(feedbacks);
        }


        [HttpDelete("feedbackdeletebyuser/{id}")]
        public async Task<IActionResult> DeleteFeedback(int id)
        {
            var feedback = await _context.feedback.FindAsync(id);

            if (feedback == null)
                return NotFound(new { message = "Feedback not found" });

            _context.feedback.Remove(feedback);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Feedback deleted successfully" });
        }






        // DTO for OTP Verification
        public class otpdto
        {
            public int userId { get; set; }
            public string OTP { get; set; }
        }
    }
}

