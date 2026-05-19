package main

import (
	"log"

	"backend/config"
	"backend/database"
	"backend/routes"
)

func main() {
	log.Println("Initializing Noted. Golang API Server...")

	// 1. Load Configuration parameters
	cfg := config.LoadConfig()

	// 2. Establish connection pool to MongoDB
	database.ConnectDB(cfg)

	// 3. Spin up Gin HTTP Engine with CORS and Route handlers
	r := routes.SetupRouter(cfg)

	// 4. Start listening on the specified network address
	log.Printf("Noted. API Server successfully listening on port %s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Server startup failed: %v", err)
	}
}
