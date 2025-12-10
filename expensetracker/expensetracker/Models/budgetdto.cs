namespace expensetracker.Models
{
    public class budgetdto
    {
        public int id { get; set; }

        public int amount { get; set; }
        public string month_year { get; set; }

        
    }


    public class updatebudgetdto
    {
        public int id { get; set; }

        public int amount { get; set; }
        public string month_year { get; set; }


    }
}
