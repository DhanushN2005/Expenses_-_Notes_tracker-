package routes

import (
	"backend/config"
	"backend/controllers"
	"backend/middleware"

	"github.com/gin-gonic/gin"
)

// RegisterExpenseRoutes defines endpoints for expenses management
func RegisterExpenseRoutes(api *gin.RouterGroup, cfg *config.Config, ec *controllers.ExpenseController) {
	protected := api.Group("/")
	protected.Use(middleware.AuthMiddleware(cfg))
	{
		protected.GET("/expenses", ec.GetExpenses)
		protected.POST("/expenses", ec.CreateExpense)
		protected.PUT("/expenses/:id", ec.UpdateExpense)
		protected.DELETE("/expenses/:id", ec.DeleteExpense)
		
		// Analytics & Summaries
		protected.GET("/expenses/summary", ec.GetExpenseSummary)
		protected.GET("/expenses/category-summary", ec.GetCategorySummary)
	}
}
