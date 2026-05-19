package config

import (
	"bufio"
	"log"
	"os"
	"path/filepath"
	"strings"
)

type Config struct {
	MongoURI      string
	JWTSecret     string
	Port          string
	AllowedOrigin string
}

// LoadEnv loads environment variables from a .env file if it exists
func LoadEnv() {
	// Try loading from .env, backend/.env, or parent folder
	paths := []string{".env", "../.env", "backend/.env"}
	var loaded bool

	for _, path := range paths {
		absPath, err := filepath.Abs(path)
		if err != nil {
			continue
		}

		file, err := os.Open(absPath)
		if err != nil {
			continue
		}
		defer file.Close()

		scanner := bufio.NewScanner(file)
		for scanner.Scan() {
			line := strings.TrimSpace(scanner.Text())
			// Ignore empty lines and comments
			if line == "" || strings.HasPrefix(line, "#") {
				continue
			}
			parts := strings.SplitN(line, "=", 2)
			if len(parts) != 2 {
				continue
			}
			key := strings.TrimSpace(parts[0])
			val := strings.TrimSpace(parts[1])

			// Strip quotes if they surround the value
			if (strings.HasPrefix(val, "\"") && strings.HasSuffix(val, "\"")) ||
				(strings.HasPrefix(val, "'") && strings.HasSuffix(val, "'")) {
				val = val[1 : len(val)-1]
			}

			// Set env variable
			os.Setenv(key, val)
		}
		log.Printf("Loaded environment configurations from: %s", absPath)
		loaded = true
		break // Only load the first found file
	}

	if !loaded {
		log.Println("No local .env file found. Utilizing system environment variables and developer fallbacks.")
	}
}

// LoadConfig loads environment configurations with standard developer fallbacks
func LoadConfig() *Config {
	// Dynamically parse local .env file
	LoadEnv()

	mongoURI := os.Getenv("MONGO_URI")
	if mongoURI == "" {
		// Standard MongoDB local fallback
		mongoURI = "mongodb://localhost:27017"
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "super_secret_notes_jwt_key_that_is_long_and_secure"
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	allowedOrigin := os.Getenv("ALLOWED_ORIGIN")
	if allowedOrigin == "" {
		allowedOrigin = "http://localhost:5173"
	}

	return &Config{
		MongoURI:      mongoURI,
		JWTSecret:     jwtSecret,
		Port:          port,
		AllowedOrigin: allowedOrigin,
	}
}
