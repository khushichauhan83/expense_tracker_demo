using System.ComponentModel.DataAnnotations;

namespace expensetracker.Models
{
    public class admin
    {
        [Key]
        public int adminid { get; set; }
        public string username { get; set; }
        public string email { get; set; }
        public string password { get; set; }
    }
}
