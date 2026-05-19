package controllers

import (
	"context"
	"net/http"
	"time"

	"backend/database"
	"backend/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type NotesController struct{}

func NewNotesController() *NotesController {
	return &NotesController{}
}

// GetNotes retrieves all notes belonging exclusively to the authenticated user
func (nc *NotesController) GetNotes(c *gin.Context) {
	userIDStr, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized access"})
		return
	}

	userID, err := primitive.ObjectIDFromHex(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user identity format"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Sort pinned notes to the top, and sort chronologically descending (latest first)
	findOptions := options.Find()
	findOptions.SetSort(bson.D{
		{Key: "pinned", Value: -1},
		{Key: "createdAt", Value: -1},
	})

	cursor, err := database.NotesCollection.Find(ctx, bson.M{"userId": userID}, findOptions)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load notes from database"})
		return
	}
	defer cursor.Close(ctx)

	notes := []models.Note{} // Ensure empty slice rather than nil for standard JSON encoding
	if err = cursor.All(ctx, &notes); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error reading database records"})
		return
	}

	c.JSON(http.StatusOK, notes)
}

// CreateNote saves a new note tagged with the authenticated user ID
func (nc *NotesController) CreateNote(c *gin.Context) {
	userIDStr, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized access"})
		return
	}

	userID, err := primitive.ObjectIDFromHex(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user identity format"})
		return
	}

	var input models.Note
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Tie the note to this authenticated user
	input.UserID = userID
	input.CreatedAt = time.Now()

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	res, err := database.NotesCollection.InsertOne(ctx, input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create note record"})
		return
	}

	input.ID = res.InsertedID.(primitive.ObjectID)

	c.JSON(http.StatusCreated, input)
}

// UpdateNote modifies an existing note after verifying user ownership
func (nc *NotesController) UpdateNote(c *gin.Context) {
	userIDStr, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized access"})
		return
	}

	userID, err := primitive.ObjectIDFromHex(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user identity format"})
		return
	}

	noteIDStr := c.Param("id")
	noteID, err := primitive.ObjectIDFromHex(noteIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid note identity format"})
		return
	}

	var input models.Note
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Retrieve the note first to verify ownership
	var existingNote models.Note
	err = database.NotesCollection.FindOne(ctx, bson.M{"_id": noteID}).Decode(&existingNote)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Note not found"})
		return
	}

	if existingNote.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden: You are not the owner of this note"})
		return
	}

	// Construct updating query
	update := bson.M{
		"$set": bson.M{
			"title":    input.Title,
			"content":  input.Content,
			"pinned":   input.Pinned,
			"category": input.Category,
			"color":    input.Color,
		},
	}

	_, err = database.NotesCollection.UpdateOne(ctx, bson.M{"_id": noteID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update note record"})
		return
	}

	// Hydrate the return struct
	input.ID = noteID
	input.UserID = userID
	input.CreatedAt = existingNote.CreatedAt

	c.JSON(http.StatusOK, input)
}

// DeleteNote purges a note after verifying user ownership
func (nc *NotesController) DeleteNote(c *gin.Context) {
	userIDStr, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized access"})
		return
	}

	userID, err := primitive.ObjectIDFromHex(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user identity format"})
		return
	}

	noteIDStr := c.Param("id")
	noteID, err := primitive.ObjectIDFromHex(noteIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid note identity format"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Verify note existence and ownership
	var existingNote models.Note
	err = database.NotesCollection.FindOne(ctx, bson.M{"_id": noteID}).Decode(&existingNote)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Note not found"})
		return
	}

	if existingNote.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden: You are not the owner of this note"})
		return
	}

	// Purge note document
	_, err = database.NotesCollection.DeleteOne(ctx, bson.M{"_id": noteID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete note record"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Note deleted successfully"})
}
