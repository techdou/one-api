package model

import (
	"errors"

	"gorm.io/gorm"
)

// StripePayment records processed Stripe Checkout sessions for idempotency.
// This prevents double-crediting a user if Stripe sends the webhook more than once.
type StripePayment struct {
	Id        int    `json:"id" gorm:"primaryKey;autoIncrement"`
	SessionId string `json:"session_id" gorm:"type:varchar(255);uniqueIndex;not null"` // Stripe checkout session ID
	UserId    int    `json:"user_id" gorm:"index;not null"`
	Amount    int64  `json:"amount" gorm:"not null"` // Amount in cents
	Quota     int64  `json:"quota" gorm:"not null"`  // Quota credited
	CreatedAt int64  `json:"created_at" gorm:"autoCreateTime"`
}

// IsStripeSessionProcessed checks if a Stripe checkout session has already been processed.
func IsStripeSessionProcessed(sessionId string) bool {
	var count int64
	DB.Model(&StripePayment{}).Where("session_id = ?", sessionId).Count(&count)
	return count > 0
}

// CreateStripePaymentRecord atomically records a processed session.
// Returns an error if the session was already processed (unique constraint violated).
func CreateStripePaymentRecord(sessionId string, userId int, amount, quota int64) error {
	record := &StripePayment{
		SessionId: sessionId,
		UserId:    userId,
		Amount:    amount,
		Quota:     quota,
	}
	result := DB.Create(record)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrDuplicatedKey) {
			return errors.New("duplicate session")
		}
		return result.Error
	}
	return nil
}
