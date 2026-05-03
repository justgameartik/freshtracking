package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/rs/cors"

	"freshtrack/internal/db"
	"freshtrack/internal/handlers"
	"freshtrack/internal/middleware"
)

func main() {
	database, err := db.New()
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer database.Close()
	log.Println("Connected to database")

	authH := handlers.NewAuthHandler(database)
	productH := handlers.NewProductHandler(database)

	r := mux.NewRouter()
	r.Use(loggingMiddleware)

	// Health
	r.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok"}`))
	}).Methods("GET")

	// Auth
	r.HandleFunc("/api/auth/register", authH.Register).Methods("POST")
	r.HandleFunc("/api/auth/login", authH.Login).Methods("POST")

	// Products (protected)
	api := r.PathPrefix("/api").Subrouter()
	api.Use(middleware.Auth)
	api.HandleFunc("/products", productH.List).Methods("GET")
	api.HandleFunc("/products", productH.Create).Methods("POST")
	api.HandleFunc("/products/{id}", productH.Get).Methods("GET")
	api.HandleFunc("/products/{id}", productH.Update).Methods("PUT")
	api.HandleFunc("/products/{id}", productH.Delete).Methods("DELETE")
	api.HandleFunc("/stats", productH.Stats).Methods("GET")

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
	})

	handler := c.Handler(r)
	log.Printf("Server starting on :%s", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}

func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("%s %s", r.Method, r.URL.Path)
		next.ServeHTTP(w, r)
	})
}
