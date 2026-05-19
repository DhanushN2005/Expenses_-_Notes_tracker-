package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// User represents the MongoDB schema for a registered user
type User struct {
	ID       primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Name     string             `bson:"name" json:"name" binding:"required"`
	Email    string             `bson:"email" json:"email" binding:"required,email"`
	Password string             `bson:"password" json:"password,omitempty" binding:"required,min=6"`
}

// Note represents the MongoDB schema for a user note
type Note struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Title     string             `bson:"title" json:"title" binding:"required"`
	Content   string             `bson:"content" json:"content" binding:"required"`
	UserID    primitive.ObjectID `bson:"userId" json:"userId"`
	Pinned    bool               `bson:"pinned" json:"pinned"`
	Category  string             `bson:"category" json:"category"`
	Color     string             `bson:"color" json:"color"`
	CreatedAt time.Time          `bson:"createdAt" json:"createdAt"`
}
