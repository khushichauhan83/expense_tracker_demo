namespace expensetracker.Models
{
    public class expensewithuserdto
    {
        public int eid { get; set; }
        public string title { get; set; }
        public decimal amount { get; set; }
        public string category { get; set; }
        public DateTime date { get; set; }
        public int id { get; set; }

        public UserDto user { get; set; }
    }

    public class UserDto
    {
        public int id { get; set; }
        public string name { get; set; }
        public string email { get; set; }
    }
}





