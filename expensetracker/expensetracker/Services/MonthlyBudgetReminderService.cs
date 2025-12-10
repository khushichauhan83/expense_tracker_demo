using expensetracker.Models;   // AppDbContext + Users
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using System.Net;
using System.Net.Mail;
using System.Threading;
using System.Threading.Tasks;

public class MonthlyBudgetReminderService : BackgroundService
{
    private readonly IServiceProvider _provider;

    public MonthlyBudgetReminderService(IServiceProvider provider)
    {
        _provider = provider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        Console.WriteLine("MonthlyBudgetReminderService started...");

        while (!stoppingToken.IsCancellationRequested)
        {
            var now = DateTime.Now;
            Console.WriteLine("Service running at: " + now.ToString("yyyy-MM-dd HH:mm:ss"));

           
            if (now.Day == 1 && now.Hour == 12 && now.Minute == 1)
            {
                using (var scope = _provider.CreateScope())
                {
                    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                    var users = db.Users.ToList();

                    Console.WriteLine("Total Users found: " + users.Count);

                    foreach (var user in users)
                    {
                        try
                        {
                            await SendMonthlyReminderEmailAsync(user.email);
                            Console.WriteLine("Email sent to: " + user.email);
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine("Failed to send email to: " + user.email + " Error: " + ex.Message);
                        }
                    }
                }

                // Prevent sending multiple emails within same hour
                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
            }
            else
            {
                // Check every 20 seconds for testing
                await Task.Delay(TimeSpan.FromSeconds(20), stoppingToken);
            }
        }
    }

    private async Task SendMonthlyReminderEmailAsync(string userEmail)
    {
        string subject = "Set Your Monthly Budget";
        string body = "Hello! It’s time to set your monthly budget for this month.";

        await SendEmailAsync(userEmail, subject, body);
    }

    private async Task SendEmailAsync(string userEmail, string subject, string body)
    {
        var fromAddress = new MailAddress("your app gmail", "ExpenseTracker");
        var toAddress = new MailAddress(userEmail);

        const string fromPassword = "your gmail app password"; 

        using (var smtp = new SmtpClient("smtp.gmail.com", 587))
        {
            smtp.EnableSsl = true;
            smtp.DeliveryMethod = SmtpDeliveryMethod.Network;
            smtp.UseDefaultCredentials = false;
            smtp.Credentials = new NetworkCredential(fromAddress.Address, fromPassword);

            using (var message = new MailMessage(fromAddress, toAddress)
            {
                Subject = subject,
                Body = body
            })
            {
                await smtp.SendMailAsync(message);
            }
        }
    }
}
