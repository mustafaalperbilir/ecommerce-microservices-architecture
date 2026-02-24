package main

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/streadway/amqp"
)

// Sipariş verisinin yapısı
type OrderMessage struct {
	OrderID     string  `json:"orderId"`
	UserID      string  `json:"userId"`
	TotalAmount float64 `json:"totalAmount"`
}

func failOnError(err error, msg string) {
	if err != nil {
		log.Fatalf("%s: %s", msg, err)
	}
}

func main() {
	// 1. RABBITMQ CONSUMER (ARKA PLAN) BAŞLIYOR
	go func() {
		// RabbitMQ'ya bağlan (Şifreni ve adresi kontrol et!)
		conn, err := amqp.Dial("amqp://admin:Alper225116@rabbitmq:5672/")
		failOnError(err, "RabbitMQ'ya bağlanılamadı")
		defer conn.Close()

		ch, err := conn.Channel()
		failOnError(err, "Kanal açılamadı")
		defer ch.Close()

		// Kuyruğu tanımla (Order service ile aynı isim: order_created)
		q, err := ch.QueueDeclare(
			"order_created", // isim
			true,            // durable
			false,           // auto-delete
			false,           // exclusive
			false,           // no-wait
			nil,             // arguments
		)
		failOnError(err, "Kuyruk tanımlanamadı")

		// Mesajları dinlemeye başla
		msgs, err := ch.Consume(
			q.Name, // queue
			"",     // consumer
			true,   // auto-ack (mesajı alınca onaylar)
			false,  // exclusive
			false,  // no-local
			false,  // no-wait
			nil,    // args
		)
		failOnError(err, "Mesajlar dinlenemiyor")

		fmt.Println("🐇 RabbitMQ dinleniyor: 'order_created' kuyruğu bekleniyor...")

		// Gelen her mesaj için bir döngü
		for d := range msgs {
			var order OrderMessage
			err := json.Unmarshal(d.Body, &order)
			if err != nil {
				log.Printf("Mesaj çözme hatası: %s", err)
				continue
			}

			fmt.Printf("\n--- YENİ SİPARİŞ YAKALANDI ---\n")
			fmt.Printf("Sipariş ID: %s\nToplam Tutar: %.2f TL\n", order.OrderID, order.TotalAmount)

			// Ödeme simülasyonu
			fmt.Println("Ödeme işleniyor (3 saniye)...")
			time.Sleep(3 * time.Second)
			fmt.Printf("✅ %s ID'li siparişin ödemesi ONAYLANDI.\n------------------------------\n", order.OrderID)
		}
	}()

	// 2. FIBER HTTP SUNUCUSU (ÖN PLAN)
	app := fiber.New()
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.SendString("Payment Service Ayakta!")
	})

	log.Fatal(app.Listen(":5003"))
}
