package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"

	"freshtrack/internal/db"
	"freshtrack/internal/middleware"
	"freshtrack/internal/models"
)

type ProductHandler struct {
	db *db.DB
}

func NewProductHandler(d *db.DB) *ProductHandler {
	return &ProductHandler{db: d}
}

func (h *ProductHandler) List(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	category := r.URL.Query().Get("category")

	products, err := h.db.GetProducts(userID, category)
	if err != nil {
		jsonError(w, "internal error", http.StatusInternalServerError)
		return
	}
	if products == nil {
		products = []*models.Product{}
	}
	jsonOK(w, products)
}

func (h *ProductHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	var req models.CreateProductRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "invalid request", http.StatusBadRequest)
		return
	}
	if req.Name == "" {
		jsonError(w, "name is required", http.StatusBadRequest)
		return
	}
	if req.Category == "" {
		req.Category = "food"
	}
	if req.RemindDaysBefore == 0 {
		req.RemindDaysBefore = 3
	}

	p, err := h.db.CreateProduct(userID, &req)
	if err != nil {
		jsonError(w, "internal error", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
	jsonOK(w, p)
}

func (h *ProductHandler) Get(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	id := mux.Vars(r)["id"]

	p, err := h.db.GetProduct(id, userID)
	if err != nil {
		jsonError(w, "internal error", http.StatusInternalServerError)
		return
	}
	if p == nil {
		jsonError(w, "not found", http.StatusNotFound)
		return
	}
	jsonOK(w, p)
}

func (h *ProductHandler) Update(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	id := mux.Vars(r)["id"]

	var req models.UpdateProductRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "invalid request", http.StatusBadRequest)
		return
	}

	p, err := h.db.UpdateProduct(id, userID, &req)
	if err != nil {
		jsonError(w, "internal error", http.StatusInternalServerError)
		return
	}
	if p == nil {
		jsonError(w, "not found", http.StatusNotFound)
		return
	}
	jsonOK(w, p)
}

func (h *ProductHandler) Delete(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	id := mux.Vars(r)["id"]

	if err := h.db.DeleteProduct(id, userID); err != nil {
		jsonError(w, "not found", http.StatusNotFound)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *ProductHandler) Stats(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	stats, err := h.db.GetStats(userID)
	if err != nil {
		jsonError(w, "internal error", http.StatusInternalServerError)
		return
	}
	jsonOK(w, stats)
}
