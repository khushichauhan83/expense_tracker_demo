using Microsoft.EntityFrameworkCore;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace expensetracker.Models
{
    public class AppDbContext : DbContext
    {
        

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<user> Users { get; set; }  // Note: class name should be 'user' if that’s how you've defined it
        public DbSet<expense> Expenses { get; set; }
        public DbSet<category> category { get; set; }  // This maps your 'category' table


        public DbSet<admin> admin { get; set; }


        public DbSet<payment_method> payment_Method {  get; set; }

        public DbSet<budget> budget { get; set; }

        public DbSet<feedback> feedback { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<expense>()
                .HasOne(e => e.User)
                .WithMany(u => u.Expenses)
                .HasForeignKey(e => e.id);
        }

    }

}
