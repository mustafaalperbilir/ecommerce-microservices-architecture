import amqp from 'amqplib';
import { PrismaClient } from '@prisma/client';

export const publishToQueue = async (queueName: string, data: any) => {
  try {
    const rabbitUrl = process.env.RABBITMQ_URL;
    if (!rabbitUrl) throw new Error('RABBITMQ_URL bulunamadı!');

    // 1. RabbitMQ'ya bağlan
    const connection = await amqp.connect(rabbitUrl);
    // 2. Bir kanal aç
    const channel = await connection.createChannel();
    
    // 3. Kuyruk yoksa oluştur (durable: true -> RabbitMQ çökse bile kuyruk silinmez)
    await channel.assertQueue(queueName, { durable: true });

    // 4. Veriyi Buffer'a çevirip kuyruğa fırlat
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)));
    
    console.log(`🐇 RabbitMQ'ya mesaj gönderildi -> Kuyruk: ${queueName}`);

    // İşimiz bitince bağlantıyı kapatıyoruz (Kaynak tüketmemek için)
    setTimeout(() => {
      channel.close();
      connection.close();
    }, 500);

  } catch (error) {
    console.error('RabbitMQ Bağlantı Hatası:', error);
  }
};


const prisma = new PrismaClient();
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://admin:Alper225116@rabbitmq:5672';

export const listenForPaymentCompletion = async () => {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();
        
        const queue = 'payment_completed';
        await channel.assertQueue(queue, { durable: true });

        console.log(`🎧 Order Service: '${queue}' kuyruğu dinleniyor...`);

       
        

        channel.consume(queue, async (msg) => {
            if (msg !== null) {
                const data = JSON.parse(msg.content.toString());
                
                // 1. GELEN VERİYİ TAMAMEN EKRANA BASALIM Kİ NE GELDİĞİNİ GÖRELİM
                console.log("📦 RabbitMQ'dan Gelen Ham Veri:", data);

                // 2. ID'yi tüm ihtimallere karşı güvenli bir şekilde çekelim
                const targetId = data.id || data.orderId || (data.order && data.order.id);

                console.log(`✅ ÖDEME ONAYI GELDİ! İşlenecek Sipariş ID: ${targetId}`);

                // Eğer ID gerçekten yoksa sistemi çökertmemesi için koruma
                if (!targetId) {
                    console.error("❌ HATA: JSON içinde geçerli bir sipariş ID'si bulunamadı. Mesaj atlanıyor.");
                    channel.ack(msg); // Hatalı mesajı kuyrukta takılı kalmasın diye siliyoruz
                    return;
                }

                // Prisma ile sipariş durumunu güncelle
                try {
                    await prisma.order.update({
                        where: { id: targetId }, 
                        data: { status: 'COMPLETED' } 
                    });
                    console.log("🎉 Veritabanı güncellendi: Sipariş durumu COMPLETED yapıldı!");
                } catch (dbError) {
                    console.error("Veritabanı güncellenirken hata:", dbError);
                }

                // Mesajı kuyruktan başarıyla sil
                channel.ack(msg);
            }
        });


    } catch (error) {
        console.error("RabbitMQ Dinleme Hatası:", error);
    }
};