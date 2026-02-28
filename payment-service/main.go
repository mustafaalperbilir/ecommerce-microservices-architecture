package main

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	amqp "github.com/rabbitmq/amqp091-go"
)

func failOnError(err error, msg string) {
	if err != nil {
		log.Fatalf("%s: %s", msg, err)
	}
}

// ✅ Iyzico Resmi Dokümantasyonuna Göre Doğru İmzalama
// payload = randomKey + uriPath + jsonBody
// signature = HMACSHA256(payload, secretKey) -> HEX
// authString = "apiKey:"+apiKey+"&randomKey:"+randomKey+"&signature:"+signature
// header = "IYZWSv2 " + base64(authString)
func generateAuth(apiKey, secretKey, randomKey, uriPath, body string) string {
	payload := randomKey + uriPath + body
	h := hmac.New(sha256.New, []byte(secretKey))
	h.Write([]byte(payload))
	signature := hex.EncodeToString(h.Sum(nil))
	authString := "apiKey:" + apiKey + "&randomKey:" + randomKey + "&signature:" + signature
	return "IYZWSv2 " + base64.StdEncoding.EncodeToString([]byte(authString))
}

func main() {
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

	go startRabbitMQConsumer(ch)

	app := fiber.New()
	app.Use(cors.New())

	app.Post("/api/payment/start", func(c *fiber.Ctx) error {
		apiKey := os.Getenv("IYZICO_API_KEY")
		secretKey := os.Getenv("IYZICO_SECRET_KEY")
		if apiKey == "" {
			apiKey = "sandbox-V4iENvDCWnmFzA0GUERY7KMblwh7nuDU"
		}
		if secretKey == "" {
			secretKey = "sandbox-sdWJMAEftb1Gbw9y8fehGs0EaCZpPvWS"
		}

		baseURL := "https://sandbox-api.iyzipay.com"
		uriPath := "/payment/iyzipos/checkoutform/initialize/auth/ecom"

		payload := map[string]interface{}{
			"locale":         "tr",
			"conversationId": fmt.Sprintf("%d", time.Now().UnixMilli()),
			"price":          "150.0",
			"paidPrice":      "150.0",
			"currency":       "TRY",
			"basketId":       "B67832",
			"paymentGroup":   "PRODUCT",
			"callbackUrl":    "http://localhost:3000/payment-success",
			"buyer": map[string]string{
				"id":                  "BY789",
				"name":                "Musteri",
				"surname":             "Test",
				"gsmNumber":           "+905350000000",
				"email":               "test@example.com",
				"identityNumber":      "74300864791",
				"registrationAddress": "Cankaya Ankara",
				"ip":                  "85.34.78.112",
				"city":                "Ankara",
				"country":             "Turkey",
			},
			"shippingAddress": map[string]string{
				"contactName": "Musteri Test",
				"city":        "Ankara",
				"country":     "Turkey",
				"address":     "Cankaya Ankara",
			},
			"billingAddress": map[string]string{
				"contactName": "Musteri Test",
				"city":        "Ankara",
				"country":     "Turkey",
				"address":     "Cankaya Ankara",
			},
			"basketItems": []map[string]interface{}{
				{
					"id":        "BI101",
					"name":      "Urun",
					"category1": "Elektronik",
					"itemType":  "PHYSICAL",
					"price":     "150.0",
				},
			},
		}

		// JSON encode (HTML escape kapalı)
		buffer := new(bytes.Buffer)
		encoder := json.NewEncoder(buffer)
		encoder.SetEscapeHTML(false)
		encoder.Encode(payload)
		bodyBytes := bytes.TrimSuffix(buffer.Bytes(), []byte("\n"))

		randomKey := fmt.Sprintf("%d", time.Now().UnixNano())
		authHeader := generateAuth(apiKey, secretKey, randomKey, uriPath, string(bodyBytes))

		log.Printf("📦 URI: %s", uriPath)
		log.Printf("📦 RandomKey: %s", randomKey)

		req, err := http.NewRequest("POST", baseURL+uriPath, bytes.NewBuffer(bodyBytes))
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "HTTP isteği oluşturulamadı"})
		}

		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", authHeader)
		req.Header.Set("x-iyzi-rnd", randomKey)

		client := &http.Client{Timeout: 30 * time.Second}
		resp, err := client.Do(req)
		if err != nil {
			log.Printf("❌ Iyzico HTTP Hatası: %v", err)
			return c.Status(500).JSON(fiber.Map{"error": "Iyzico'ya bağlanılamadı", "details": err.Error()})
		}
		defer resp.Body.Close()

		respBody, _ := io.ReadAll(resp.Body)
		log.Printf("📨 IYZICO YANITI (HTTP %d): %s", resp.StatusCode, string(respBody))

		var result map[string]interface{}
		json.Unmarshal(respBody, &result)

		return c.JSON(result)
	})

	app.Post("/api/payment/callback", func(c *fiber.Ctx) error {
		token := c.FormValue("token")
		log.Printf("📩 Callback alındı. Token: %s", token)
		return c.JSON(fiber.Map{"message": "OK", "token": token})
	})

	log.Println("🚀 Payment Service 5003 portunda çalışıyor!")
	log.Fatal(app.Listen(":5003"))
}

func startRabbitMQConsumer(ch *amqp.Channel) {
	q, _ := ch.QueueDeclare("order_created", true, false, false, false, nil)
	msgs, _ := ch.Consume(q.Name, "", true, false, false, false, nil)
	log.Printf("⏳ RabbitMQ 'order_created' dinleniyor...")
	for d := range msgs {
		log.Printf("📦 YENİ SİPARİŞ: %s", d.Body)
		ch.Publish("", "payment_completed", false, false, amqp.Publishing{
			ContentType: "application/json",
			Body:        d.Body,
		})
	}
}
