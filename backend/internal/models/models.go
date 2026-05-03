package models

import (
	"time"
)

type User struct {
	ID           string    `json:"id" db:"id"`
	Email        string    `json:"email" db:"email"`
	PasswordHash string    `json:"-" db:"password_hash"`
	Name         string    `json:"name" db:"name"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`
}

type Product struct {
	ID              string    `json:"id" db:"id"`
	UserID          string    `json:"user_id" db:"user_id"`
	Name            string    `json:"name" db:"name"`
	Category        string    `json:"category" db:"category"`
	Location        string    `json:"location" db:"location"`
	ExpiresAt       time.Time `json:"expires_at" db:"expires_at"`
	RemindDaysBefore int      `json:"remind_days_before" db:"remind_days_before"`
	Notes           string    `json:"notes" db:"notes"`
	CreatedAt       time.Time `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time `json:"updated_at" db:"updated_at"`
	DaysLeft        int       `json:"days_left"`
	Status          string    `json:"status"` // expired, soon, ok
}

type CreateProductRequest struct {
	Name             string    `json:"name"`
	Category         string    `json:"category"`
	Location         string    `json:"location"`
	ExpiresAt        time.Time `json:"expires_at"`
	RemindDaysBefore int       `json:"remind_days_before"`
	Notes            string    `json:"notes"`
}

type UpdateProductRequest struct {
	Name             string    `json:"name"`
	Category         string    `json:"category"`
	Location         string    `json:"location"`
	ExpiresAt        time.Time `json:"expires_at"`
	RemindDaysBefore int       `json:"remind_days_before"`
	Notes            string    `json:"notes"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type RegisterRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Name     string `json:"name"`
}

type AuthResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

type ProductsStats struct {
	Expired int `json:"expired"`
	Soon    int `json:"soon"`
	Ok      int `json:"ok"`
}
