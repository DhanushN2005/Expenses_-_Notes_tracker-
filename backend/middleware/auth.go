package middleware

import (
	"net/http"
	"strings"

	"backend/config"
	"backend/utils"

	"github.com/gin-gonic/gin"
)

// AuthMiddleware intercepts requests, validates the Bearer token, and extracts the User ID
func AuthMiddleware(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header is required"})
			c.Abort()
			return
		}

		// Split the header to extract the actual token part
		parts := strings.SplitN(authHeader, " ", 2)
		if !(len(parts) == 2 && parts[0] == "Bearer") {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header must be in Format: Bearer <Token>"})
			c.Abort()
			return
		}

		tokenString := parts[1]
		userID, err := utils.ValidateToken(tokenString, cfg.JWTSecret)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid, altered, or expired authorization token"})
			c.Abort()
			return
		}

		// Set user ID inside current context to be accessed by controllers
		c.Set("userId", userID)
		c.Next()
	}
}
