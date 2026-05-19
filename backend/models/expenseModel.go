package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Expense represents the MongoDB schema for a user expense record
type Expense struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Title       string             `bson:"title" json:"title" binding:"required"`
	Amount      float64            `bson:"amount" json:"amount" binding:"required,gt=0"`
	Category    string             `bson:"category" json:"category" binding:"required"`
	Description string             `bson:"description" json:"description"`
	Date        string             `bson:"date" json:"date" binding:"required"` // Format: YYYY-MM-DD
	UserID      primitive.ObjectID `bson:"userId" json:"userId"`
	CreatedAt   time.Time          `bson:"createdAt" json:"createdAt"`
}
