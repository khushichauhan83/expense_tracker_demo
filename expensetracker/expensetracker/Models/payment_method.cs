using System.ComponentModel.DataAnnotations;

namespace expensetracker.Models
{
    public class payment_method
    {
        [Key]
        public int pmid {  get; set; }

        public string pmname {  get; set; }
    }
}
