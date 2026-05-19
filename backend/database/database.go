package database

import (
	"context"
	"log"
	"time"
	"backend/config"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	Client             *mongo.Client
	DB                 *mongo.Database
	UserCollection     *mongo.Collection
	NotesCollection    *mongo.Collection
	ExpensesCollection *mongo.Collection
)

// ConnectDB establishes connection to MongoDB and sets up collections
func ConnectDB(cfg *config.Config) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	clientOptions := options.Client().ApplyURI(cfg.MongoURI)
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatalf("MongoDB connection error: %v", err)
	}

	// Ping database to verify connection is alive
	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatalf("MongoDB ping failed: %v", err)
	}

	log.Println("Successfully connected to MongoDB!")

	Client = client
	DB = client.Database("notes_app_db")
	UserCollection = DB.Collection("users")
	NotesCollection = DB.Collection("notes")
	ExpensesCollection = DB.Collection("expenses")
}
