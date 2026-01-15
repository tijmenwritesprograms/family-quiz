using Aspire.Hosting.JavaScript;

var builder = DistributedApplication.CreateBuilder(args);

// Add the quiz server (ASP.NET Core with SignalR)
var quizServer = builder.AddProject<Projects.QuizServer>("quiz-server");

// Add the quiz app (Vite Vue 3 application)
var quizApp = builder.AddViteApp("quiz-app", "../quiz-app")
    .WithExternalHttpEndpoints()
    .WithReference(quizServer)
    .WaitFor(quizServer);

builder.Build().Run();
