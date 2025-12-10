using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace expensetracker.Models
{
    public class category
    {
        [Key]
        public int cid { get; set; }
        public string cname { get; set; }

    }
}
