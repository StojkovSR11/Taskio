package main

import (
	"fmt"
	"github.com/nats-io/nats.go"
	"log"
	"net/http"
	"os"
	bootstrap "task-service/boostrap"
	"task-service/db"
	"task-service/handlers"
	"time"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

func main() {
	err := db.ConnectToMongo()
	if err != nil {
		fmt.Println("Error connecting to MongoDB:", err)
		os.Exit(1)
	}
	defer db.DisconnectMongo()

	bootstrap.ClearTasks()
	bootstrap.InsertInitialTasks()

	natsURL := os.Getenv("NATS_URL")
	if natsURL == "" {
		natsURL = "nats://nats:4222"
	}
	nc, err := nats.Connect(natsURL)
	if err != nil {
		log.Fatalf("Error connecting to NATS: %v", err)
	}
	defer nc.Close()
	logger := log.New(os.Stdout, "[product-api] ", log.LstdFlags)
	taskRepo := db.NewTaskRepo(db.Client)

	tasksHandler := handlers.NewTasksHandler(logger, taskRepo, nc)

	router := mux.NewRouter()
	router.HandleFunc("/tasks", handlers.GetTasks).Methods("GET")
	router.HandleFunc("/tasks/{taskId}", handlers.GetTaskByID).Methods("GET", "OPTIONS")
	router.HandleFunc("/tasks/create/{project_id}", handlers.CreateTaskHandler).Methods("POST")
	router.HandleFunc("/tasks/{taskId}/users/{userId}", tasksHandler.AddUserToTaskHandler).Methods("PUT")
	router.HandleFunc("/tasks/{taskId}/users/{userId}", tasksHandler.RemoveUserFromTaskHandler).Methods("DELETE")
	router.HandleFunc("/tasks/{taskID}/users", handlers.GetUsersForTaskHandler).Methods("GET")
	router.HandleFunc("/tasks/{taskId}", tasksHandler.UpdateTaskHandler).Methods("PUT")
	router.HandleFunc("/tasks/{taskId}/member-of/{userId}", handlers.CheckUserInTaskHandler).Methods("GET")
	router.HandleFunc("/tasks/{task_id}/dependencies/{dependency_id}", handlers.AddDependencyHandler).Methods("PUT")
	router.HandleFunc("/projects/{project_id}/tasks", handlers.GetTasksForProjectHandler).Methods("GET")

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:4200"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	})

	server := &http.Server{
		Handler:      c.Handler(router),
		Addr:         ":8080",
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
	}

	fmt.Println("Task service started on port 8082")
	if err := server.ListenAndServe(); err != nil {
		fmt.Println("Error starting task service:", err)
		os.Exit(1)
	}
}
