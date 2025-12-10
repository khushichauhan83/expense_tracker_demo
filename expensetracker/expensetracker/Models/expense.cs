using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace expensetracker.Models
{
    public class expense
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int eid { get; set; }  // Auto-generated primary key

        public string title { get; set; }
        public decimal amount { get; set; }
        public string category { get; set; }

        public string payment_method {  get; set; }
        public DateTime date { get; set; }

        [ForeignKey("user")]
        public int id { get; set; }  // Foreign key to user

        public user User { get; set; }
    }
}
