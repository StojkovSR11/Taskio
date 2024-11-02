package models

type Project struct {
	ID              string   `json:"id,omitempty"`
	Title           string   `json:"title"`
	Description     string   `json:"description"`
	Owner           string   `json:"owner"`
	ExpectedEndDate string   `json:"expected_end_date"`
	MinPeople       int      `json:"min_people"`
	MaxPeople       int      `json:"max_people"`
	Users           []string `json:"users,omitempty"` // Lista ID-jeva korisnika pridruženih projektu
}
