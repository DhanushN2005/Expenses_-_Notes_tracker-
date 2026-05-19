package routes

import (
	"time"

	"backend/config"
	"backend/controllers"
	"backend/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// SetupRouter registers middleware, configures CORS policies, and binds endpoint groups
func SetupRouter(cfg *config.Config) *gin.Engine {
	r := gin.Default()

	// Configure CORS policies using standard Gin CORS contrib package
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{cfg.AllowedOrigin},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	authController := controllers.NewAuthController(cfg)
	notesController := controllers.NewNotesController()
	expenseController := controllers.NewExpenseController()

	// API Endpoint Group
	api := r.Group("/api")
	{
		// Public Authentication Endpoints
		api.POST("/register", authController.Register)
		api.POST("/login", authController.Login)

		// Protected Workspace CRUD Endpoints
		protected := api.Group("/")
		protected.Use(middleware.AuthMiddleware(cfg))
		{
			protected.GET("/notes", notesController.GetNotes)
			protected.POST("/notes", notesController.CreateNote)
			protected.PUT("/notes/:id", notesController.UpdateNote)
			protected.DELETE("/notes/:id", notesController.DeleteNote)
		}

		// Register Expense Tracker Routes
		RegisterExpenseRoutes(api, cfg, expenseController)
	}

	return r
}
