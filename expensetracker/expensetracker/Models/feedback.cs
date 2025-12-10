using System.ComponentModel.DataAnnotations;

namespace expensetracker.Models
{
    public class feedback
    {
        [Key]
        public int aid {  get; set; }  

        public int id {  get; set; }  // user id 

        public string msg {  get; set; }

        public string? admin_reply {  get; set; }

        public DateTime createdat { get; set; } = DateTime.UtcNow;

        public DateTime? repliedat { get; set; }


    }
}
