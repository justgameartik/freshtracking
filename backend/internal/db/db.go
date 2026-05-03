package db

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	_ "github.com/lib/pq"

	"freshtrack/internal/models"
)

type DB struct {
	conn *sql.DB
}

func New() (*DB, error) {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "postgres://freshtrack:freshtrack_secret@localhost:5432/freshtrack?sslmode=disable"
	}

	conn, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, fmt.Errorf("open db: %w", err)
	}

	// Retry connection
	for i := 0; i < 10; i++ {
		if err = conn.Ping(); err == nil {
			break
		}
		log.Printf("Waiting for database... attempt %d/10", i+1)
		time.Sleep(2 * time.Second)
	}
	if err != nil {
		return nil, fmt.Errorf("ping db: %w", err)
	}

	conn.SetMaxOpenConns(25)
	conn.SetMaxIdleConns(5)
	conn.SetConnMaxLifetime(5 * time.Minute)

	return &DB{conn: conn}, nil
}

func (d *DB) Close() error {
	return d.conn.Close()
}

// Users

func (d *DB) CreateUser(email, passwordHash, name string) (*models.User, error) {
	user := &models.User{}
	err := d.conn.QueryRow(
		`INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3)
		 RETURNING id, email, password_hash, name, created_at, updated_at`,
		email, passwordHash, name,
	).Scan(&user.ID, &user.Email, &user.PasswordHash, &user.Name, &user.CreatedAt, &user.UpdatedAt)
	return user, err
}

func (d *DB) GetUserByEmail(email string) (*models.User, error) {
	user := &models.User{}
	err := d.conn.QueryRow(
		`SELECT id, email, password_hash, name, created_at, updated_at FROM users WHERE email = $1`,
		email,
	).Scan(&user.ID, &user.Email, &user.PasswordHash, &user.Name, &user.CreatedAt, &user.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return user, err
}

func (d *DB) GetUserByID(id string) (*models.User, error) {
	user := &models.User{}
	err := d.conn.QueryRow(
		`SELECT id, email, password_hash, name, created_at, updated_at FROM users WHERE id = $1`,
		id,
	).Scan(&user.ID, &user.Email, &user.PasswordHash, &user.Name, &user.CreatedAt, &user.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return user, err
}

// Products

func (d *DB) CreateProduct(userID string, req *models.CreateProductRequest) (*models.Product, error) {
	p := &models.Product{}
	var notes sql.NullString
	err := d.conn.QueryRow(
		`INSERT INTO products (user_id, name, category, location, expires_at, remind_days_before, notes)
		 VALUES ($1, $2, $3, $4, $5, $6, $7)
		 RETURNING id, user_id, name, category, location, expires_at, remind_days_before, COALESCE(notes,''), created_at, updated_at`,
		userID, req.Name, req.Category, req.Location, req.ExpiresAt, req.RemindDaysBefore, req.Notes,
	).Scan(&p.ID, &p.UserID, &p.Name, &p.Category, &p.Location, &p.ExpiresAt, &p.RemindDaysBefore, &notes, &p.CreatedAt, &p.UpdatedAt)
	if notes.Valid {
		p.Notes = notes.String
	}
	computeStatus(p)
	return p, err
}

func (d *DB) GetProducts(userID, category string) ([]*models.Product, error) {
	query := `SELECT id, user_id, name, category, location, expires_at, remind_days_before, COALESCE(notes,''), created_at, updated_at
	          FROM products WHERE user_id = $1`
	args := []interface{}{userID}

	if category != "" && category != "all" {
		query += " AND category = $2"
		args = append(args, category)
	}
	query += " ORDER BY expires_at ASC"

	rows, err := d.conn.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []*models.Product
	for rows.Next() {
		p := &models.Product{}
		if err := rows.Scan(&p.ID, &p.UserID, &p.Name, &p.Category, &p.Location, &p.ExpiresAt, &p.RemindDaysBefore, &p.Notes, &p.CreatedAt, &p.UpdatedAt); err != nil {
			return nil, err
		}
		computeStatus(p)
		products = append(products, p)
	}
	return products, rows.Err()
}

func (d *DB) GetProduct(id, userID string) (*models.Product, error) {
	p := &models.Product{}
	err := d.conn.QueryRow(
		`SELECT id, user_id, name, category, location, expires_at, remind_days_before, COALESCE(notes,''), created_at, updated_at
		 FROM products WHERE id = $1 AND user_id = $2`,
		id, userID,
	).Scan(&p.ID, &p.UserID, &p.Name, &p.Category, &p.Location, &p.ExpiresAt, &p.RemindDaysBefore, &p.Notes, &p.CreatedAt, &p.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	computeStatus(p)
	return p, err
}

func (d *DB) UpdateProduct(id, userID string, req *models.UpdateProductRequest) (*models.Product, error) {
	p := &models.Product{}
	err := d.conn.QueryRow(
		`UPDATE products SET name=$3, category=$4, location=$5, expires_at=$6, remind_days_before=$7, notes=$8, updated_at=NOW()
		 WHERE id=$1 AND user_id=$2
		 RETURNING id, user_id, name, category, location, expires_at, remind_days_before, COALESCE(notes,''), created_at, updated_at`,
		id, userID, req.Name, req.Category, req.Location, req.ExpiresAt, req.RemindDaysBefore, req.Notes,
	).Scan(&p.ID, &p.UserID, &p.Name, &p.Category, &p.Location, &p.ExpiresAt, &p.RemindDaysBefore, &p.Notes, &p.CreatedAt, &p.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	computeStatus(p)
	return p, err
}

func (d *DB) DeleteProduct(id, userID string) error {
	res, err := d.conn.Exec(`DELETE FROM products WHERE id=$1 AND user_id=$2`, id, userID)
	if err != nil {
		return err
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (d *DB) GetStats(userID string) (*models.ProductsStats, error) {
	stats := &models.ProductsStats{}
	now := time.Now()
	rows, err := d.conn.Query(`SELECT expires_at, remind_days_before FROM products WHERE user_id=$1`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var expiresAt time.Time
		var remindDays int
		if err := rows.Scan(&expiresAt, &remindDays); err != nil {
			continue
		}
		days := int(expiresAt.Sub(now).Hours() / 24)
		if days < 0 {
			stats.Expired++
		} else if days <= remindDays {
			stats.Soon++
		} else {
			stats.Ok++
		}
	}
	return stats, rows.Err()
}

func computeStatus(p *models.Product) {
	now := time.Now()
	days := int(p.ExpiresAt.Sub(now).Hours() / 24)
	p.DaysLeft = days
	if days < 0 {
		p.Status = "expired"
	} else if days <= p.RemindDaysBefore {
		p.Status = "soon"
	} else {
		p.Status = "ok"
	}
}
