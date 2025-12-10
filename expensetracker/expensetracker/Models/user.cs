using System.ComponentModel.DataAnnotations;

namespace expensetracker.Models
{
    public class user
    {
        [Key]
        public int id { get; set; }  // Primary key

        public string name { get; set; }
        public string gender { get; set; }
        public string bdate { get; set; }
        public string email { get; set; }
        public string pno { get; set; }
        public string passwordhash { get; set; }
        public DateTime createdat { get; set; } = DateTime.Now;

        public List<expense> Expenses { get; set; } = new();

        // OTP functionality
        public string? OTP { get; set; }          // Stores 4-digit OTP
        public DateTime? OTPGeneratedAt { get; set; }  // Timestamp when OTP is generated
        public bool IsEmailVerified { get; set; } = false; // Email/OTP verification flag
    }
}
