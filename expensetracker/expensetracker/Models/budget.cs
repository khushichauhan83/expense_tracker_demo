using System.ComponentModel.DataAnnotations;

namespace expensetracker.Models
{
    public class budget
    {
        [Key]
        public int bid {  get; set; }

        public int id {  get; set; }

        public int amount {  get; set; }

        public string month_year {  get; set; }

        public DateTime createdat { get; set; } = DateTime.Now;
        public DateTime updatedat { get; set; } = DateTime.Now;
    }
}
