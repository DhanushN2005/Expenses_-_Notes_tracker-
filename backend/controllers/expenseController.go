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

type ExpenseController struct{}

func NewExpenseController() *ExpenseController {
	return &ExpenseController{}
}

// GetExpenses retrieves all expenses for the authenticated user with optional filter & search
func (ec *ExpenseController) GetExpenses(c *gin.Context) {
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

	categoryFilter := c.Query("category")
	searchQuery := c.Query("search")

	// Construct filter query
	filter := bson.M{"userId": userID}

	if categoryFilter != "" && categoryFilter != "All" {
		filter["category"] = categoryFilter
	}

	if searchQuery != "" {
		filter["$or"] = []bson.M{
			{"title": bson.M{"$regex": searchQuery, "$options": "i"}},
			{"description": bson.M{"$regex": searchQuery, "$options": "i"}},
		}
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Sort chronologically descending (latest date first)
	findOptions := options.Find()
	findOptions.SetSort(bson.D{
		{Key: "date", Value: -1},
		{Key: "createdAt", Value: -1},
	})

	cursor, err := database.ExpensesCollection.Find(ctx, filter, findOptions)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load expenses from database"})
		return
	}
	defer cursor.Close(ctx)

	expenses := []models.Expense{}
	if err = cursor.All(ctx, &expenses); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error reading database records"})
		return
	}

	c.JSON(http.StatusOK, expenses)
}

// CreateExpense saves a new expense tagged with the authenticated user ID
func (ec *ExpenseController) CreateExpense(c *gin.Context) {
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

	var input models.Expense
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	input.UserID = userID
	input.CreatedAt = time.Now()

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	res, err := database.ExpensesCollection.InsertOne(ctx, input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create expense record"})
		return
	}

	input.ID = res.InsertedID.(primitive.ObjectID)
	c.JSON(http.StatusCreated, input)
}

// UpdateExpense modifies an existing expense after verifying user ownership
func (ec *ExpenseController) UpdateExpense(c *gin.Context) {
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

	expenseIDStr := c.Param("id")
	expenseID, err := primitive.ObjectIDFromHex(expenseIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid expense identity format"})
		return
	}

	var input models.Expense
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Verify existence and ownership
	var existingExpense models.Expense
	err = database.ExpensesCollection.FindOne(ctx, bson.M{"_id": expenseID}).Decode(&existingExpense)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Expense not found"})
		return
	}

	if existingExpense.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden: You do not own this record"})
		return
	}

	update := bson.M{
		"$set": bson.M{
			"title":       input.Title,
			"amount":      input.Amount,
			"category":    input.Category,
			"description": input.Description,
			"date":        input.Date,
		},
	}

	_, err = database.ExpensesCollection.UpdateOne(ctx, bson.M{"_id": expenseID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update expense record"})
		return
	}

	input.ID = expenseID
	input.UserID = userID
	input.CreatedAt = existingExpense.CreatedAt

	c.JSON(http.StatusOK, input)
}

// DeleteExpense purges an expense after verifying user ownership
func (ec *ExpenseController) DeleteExpense(c *gin.Context) {
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

	expenseIDStr := c.Param("id")
	expenseID, err := primitive.ObjectIDFromHex(expenseIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid expense identity format"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Verify existence and ownership
	var existingExpense models.Expense
	err = database.ExpensesCollection.FindOne(ctx, bson.M{"_id": expenseID}).Decode(&existingExpense)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Expense not found"})
		return
	}

	if existingExpense.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden: You do not own this record"})
		return
	}

	_, err = database.ExpensesCollection.DeleteOne(ctx, bson.M{"_id": expenseID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete expense record"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Expense deleted successfully"})
}

// GetExpenseSummary returns totals, monthly spending, and recent transactions
func (ec *ExpenseController) GetExpenseSummary(c *gin.Context) {
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

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// 1. Calculate Grand Total
	totalPipeline := []bson.M{
		{"$match": bson.M{"userId": userID}},
		{"$group": bson.M{"_id": nil, "total": bson.M{"$sum": "$amount"}}},
	}

	var totalResult []bson.M
	totalCursor, err := database.ExpensesCollection.Aggregate(ctx, totalPipeline)
	var grandTotal float64 = 0.0
	if err == nil {
		if err = totalCursor.All(ctx, &totalResult); err == nil && len(totalResult) > 0 {
			if val, ok := totalResult[0]["total"]; ok {
				switch v := val.(type) {
				case float64:
					grandTotal = v
				case int32:
					grandTotal = float64(v)
				case int64:
					grandTotal = float64(v)
				}
			}
		}
	}

	// 2. Calculate Current Month Spending
	currentMonthStr := time.Now().Format("2006-01") // YYYY-MM
	monthlyPipeline := []bson.M{
		{
			"$match": bson.M{
				"userId": userID,
				"date":   bson.M{"$regex": "^" + currentMonthStr},
			},
		},
		{"$group": bson.M{"_id": nil, "total": bson.M{"$sum": "$amount"}}},
	}

	var monthlyResult []bson.M
	var monthlyTotal float64 = 0.0
	monthlyCursor, err := database.ExpensesCollection.Aggregate(ctx, monthlyPipeline)
	if err == nil {
		if err = monthlyCursor.All(ctx, &monthlyResult); err == nil && len(monthlyResult) > 0 {
			if val, ok := monthlyResult[0]["total"]; ok {
				switch v := val.(type) {
				case float64:
					monthlyTotal = v
				case int32:
					monthlyTotal = float64(v)
				case int64:
					monthlyTotal = float64(v)
				}
			}
		}
	}

	// 3. Fetch Recent Transactions (last 5)
	findOptions := options.Find()
	findOptions.SetLimit(5)
	findOptions.SetSort(bson.D{
		{Key: "date", Value: -1},
		{Key: "createdAt", Value: -1},
	})

	cursor, err := database.ExpensesCollection.Find(ctx, bson.M{"userId": userID}, findOptions)
	recentTransactions := []models.Expense{}
	if err == nil {
		_ = cursor.All(ctx, &recentTransactions)
	}

	// Fetch Total Notes for unified dashboard view
	totalNotes, _ := database.NotesCollection.CountDocuments(ctx, bson.M{"userId": userID})

	c.JSON(http.StatusOK, gin.H{
		"totalExpenses":      grandTotal,
		"monthlySpending":    monthlyTotal,
		"recentTransactions": recentTransactions,
		"totalNotes":         totalNotes,
	})
}

// GetCategorySummary returns total expenditures aggregated per category
func (ec *ExpenseController) GetCategorySummary(c *gin.Context) {
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

	pipeline := []bson.M{
		{"$match": bson.M{"userId": userID}},
		{
			"$group": bson.M{
				"_id":   "$category",
				"value": bson.M{"$sum": "$amount"},
			},
		},
		{
			"$project": bson.M{
				"_id":      0,
				"name":    "$_id",
				"value":   1,
			},
		},
	}

	cursor, err := database.ExpensesCollection.Aggregate(ctx, pipeline)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to compile analytical categories"})
		return
	}
	defer cursor.Close(ctx)

	results := []gin.H{}
	if err = cursor.All(ctx, &results); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode analytical categories"})
		return
	}

	// Supply empty array instead of null if empty
	if len(results) == 0 {
		results = []gin.H{}
	}

	c.JSON(http.StatusOK, results)
}
