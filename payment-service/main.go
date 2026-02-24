package main

import (
	"log"
	"os"

	amqp "github.com/rabbitmq/amqp091-go"
)

// Hataları yakalamak için yardımcı fonksiyon
func failOnError(err error, msg string) {
	if err != nil {
		log.Fatalf("%s: %s", msg, err)
	}
}

func main() {
	// 1. RabbitMQ'ya Bağlan
	rabbitURL := os.Getenv("RABBITMQ_URL")
	if rabbitURL == "" {
		rabbitURL = "amqp://admin:Alper225116@rabbitmq:5672/"
	}

	conn, err := amqp.Dial(rabbitURL)
	failOnError(err, "RabbitMQ'ya bağlanılamadı")
	defer conn.Close()

	ch, err := conn.Channel()
	failOnError(err, "RabbitMQ kanalı açılamadı")
	defer ch.Close()

	// 2. Dinlenecek Kuyruğu Tanımla
	q, err := ch.QueueDeclare(
		"order_created", // Kuyruk adı
		true,            // Durable
		false,           // Delete when unused
		false,           // Exclusive
		false,           // No-wait
		nil,             // Arguments
	)
	failOnError(err, "Kuyruk deklare edilemedi")

	// 3. Kuyruktan Mesajları Tüket (Consume)
	msgs, err := ch.Consume(
		q.Name, // queue
		"",     // consumer
		true,   // auto-ack
		false,  // exclusive
		false,  // no-local
		false,  // no-wait
		nil,    // args
	)
	failOnError(err, "Kuyruk dinlenemiyor")

	// 4. Sonsuz Döngü Tanımlaması (Sadece BİR KERE tanımlanmalı)
	var forever chan struct{}

	go func() {
		for d := range msgs {
			log.Printf("📦 RABBİTMQ'DAN YENİ SİPARİŞ GELDİ: %s", d.Body)

			// Kredi kartı çekim simülasyonu
			log.Printf("💳 Ödeme doğrulandı ve başarıyla çekildi!")

			// 5. Sipariş servisine yanıt gönder (YENİ KISIM)
			err := ch.Publish(
				"",                  // exchange
				"payment_completed", // routing key
				false,               // mandatory
				false,               // immediate
				amqp.Publishing{
					ContentType: "application/json",
					Body:        d.Body,
				})

			if err != nil {
				log.Printf("❌ Yanıt gönderilemedi: %s", err)
			} else {
				log.Printf("✅ Sipariş servisine 'payment_completed' mesajı gönderildi!")
				log.Printf("-----------------------------------")
			}
		}
	}()

	log.Printf("⏳ Payment Service (GO) RabbitMQ'yu dinliyor. Çıkmak için CTRL+C")
	<-forever
}
