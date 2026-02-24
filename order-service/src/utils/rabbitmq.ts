import amqp from 'amqplib';

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