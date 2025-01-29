const TOKEN = '7531498113:AAGI-IFY6QPwhGM5UdHpzDwgjZPXNlnGHUw'; // Replace with your BotFather token
const WEBHOOK = '/endpoint';
// Made by https://t.me/Ashlynn_Repository
addEventListener('fetch', event => {
  const url = new URL(event.request.url);
// Made by https://t.me/Ashlynn_Repository
  if (url.pathname === WEBHOOK) {
    event.respondWith(handleWebhook(event));
  } else if (url.pathname === '/registerWebhook') {
    event.respondWith(registerWebhook(event, url));
  } else if (url.pathname === '/unRegisterWebhook') {
    event.respondWith(unRegisterWebhook());
  } else {
    event.respondWith(new Response('No handler for this request', { status: 404 }));
  }
});

// Made by https://t.me/Ashlynn_Repository
async function handleWebhook(event) {
  try {
    const update = await event.request.json();
    console.log("Received update:", JSON.stringify(update, null, 2));
// Made by https://t.me/Ashlynn_Repository
    if (update.message) {
      await handleMessage(update.message);
    }
    return new Response('OK');
  } catch (error) {
    console.error('Error handling webhook:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

// Made by https://t.me/Ashlynn_Repository
async function handleMessage(message) {
  console.log("Processing message:", JSON.stringify(message, null, 2));
// Made by https://t.me/Ashlynn_Repository
  const chatId = message.chat.id;
  const text = message.text?.trim();
// Made by https://t.me/Ashlynn_Repository
  if (!text) return;
// Made by https://t.me/Ashlynn_Repository
  if (text.startsWith('/start')) {
    await sendText(
      chatId,
      `👋 Hi! Welcome to ShortURL Bot.\n\n` +
      `🔗 **Commands:**\n` +
      `1️⃣ Send any URL directly to shorten it (default API).\n` +
      `2️⃣ Use **/arshort** command to shorten a URL with an optional slug (alternate API).\n` +
      `3️⃣ Type **/help** for detailed information.\n\n` +
      `💡 Let's get started!`
    );
  } else if (text.startsWith('/help')) {
    await sendText(
      chatId,
      `📖 **Help Menu**\n\n` +
      `1️⃣ Send any URL directly to shorten it using the default API.\n` +
      `2️⃣ Use **/arshort <URL> [slug]** to shorten a URL with the https://arshorturl.pages.dev/ API:\n` +
      `   - If only the URL is provided, it generates a random short link.\n` +
      `   - If a custom slug is provided, the link will include your slug.\n\n` +
      `3️⃣ Use **/unshorten <URL>** to expand a shortened URL to its original form:\n` +
      `   - Just provide the shortened URL after the command.\n` +
      `   - Example:\n` +
      `     /unshorten https://bit.ly/example\n\n` +
      `💡 Examples:\n` +
      `/arshort https://example.com my-custom-slug\n` +
      `/unshorten https://bit.ly/3xyzAb\n\n` +
      `⚡️ Made By [Ashlynn Repository](https://t.me/Ashlynn_Repository).`
    );
  } else if (text.startsWith('/arshort ')) {
    const args = text.replace('/arshort ', '').trim().split(' ');
    const url = args[0];
    const slug = args[1];

    if (!isValidUrl(url)) {
      await sendText(chatId, '❌ Please provide a valid URL.');
      return;
    }
// Made by https://t.me/Ashlynn_Repository
    await shortenWithAlternateAPI(chatId, url, slug);
  } else if (isValidUrl(text)) {
    await shortenWithDefaultAPI(chatId, text);
  } else if (text.startsWith("/unshorten")) { 
		const urlToUnshorten = text.split(" ")[1];
		await handleUnshortenRequest(chatId, urlToUnshorten);   
  } else {
    await sendText(chatId, '❓ Unknown command or invalid URL. Use /help for assistance.');
  }
}
// Made by https://t.me/Ashlynn_Repository
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Made by https://t.me/Ashlynn_Repository
async function shortenWithDefaultAPI(chatId, url) {
  const apiUrl = `https://url.ashlynn.workers.dev/api/short?url=${encodeURIComponent(url)}`;

// Made by https://t.me/Ashlynn_Repository
  const tempMessage = await sendText(chatId, '🔄 Shortening URL using the default API...');

  try {
    console.log(`Default API Request: ${apiUrl}`);
// Made by https://t.me/Ashlynn_Repository
    const response = await fetch(apiUrl);
    const data = await response.json();

// Made by https://t.me/Ashlynn_Repository
    await deleteMessage(chatId, tempMessage.message_id);

    if (data.shortUrl) {
      await sendText(chatId, `✅ Shortened URL: ${data.shortUrl}`);
    } else {
      await sendText(chatId, '❌ Failed to shorten the URL.');
    }
  } catch (error) {
    console.error('Error with Default API:', error);
    await sendText(chatId, '❌ An error occurred while shortening the URL.');
  }
}
// Made by https://t.me/Ashlynn_Repository
async function shortenWithAlternateAPI(chatId, url, slug) {
  const body = { url };
  if (slug) body.slug = slug;
// Made by https://t.me/Ashlynn_Repository
  const apiUrl = 'https://arshorturl.pages.dev/create';

// Made by https://t.me/Ashlynn_Repository
  const tempMessage = await sendText(chatId, '🔄 Shortening URL using the alternate API...');
// Made by https://t.me/Ashlynn_Repository
  try {
    console.log(`Alternate API Request Body:`, JSON.stringify(body, null, 2));

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
// Made by https://t.me/Ashlynn_Repository
    const data = await response.json();

// Made by https://t.me/Ashlynn_Repository
    await deleteMessage(chatId, tempMessage.message_id);

    if (data.link) {
      const responseMessage = 
        `✅ **Shortened URL**: [${data.link}](${data.link})\n` +
        `🔗 **Original URL**: [${data.url}](${data.url})\n` +
        `📅 **Date**: ${data.date}\n` +
        `🔑 **Slug**: \`${data.slug}\``;

      await sendText(chatId, responseMessage, 'Markdown');
    } else {
      await sendText(chatId, '❌ Failed to shorten the URL with the alternate API.');
    }
  } catch (error) {
    console.error('Error with Alternate API:', error);
    await sendText(chatId, '❌ An error occurred while shortening the URL.');
  }
}

// Made by https://t.me/Ashlynn_Repository
async function sendText(chatId, text, parseMode = 'Markdown') {
  const apiUrl = `https://api.telegram.org/bot${TOKEN}/sendMessage`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: parseMode
      })
    });
// Made by https://t.me/Ashlynn_Repository
    const responseData = await response.json();
    console.log('sendText API Response:', JSON.stringify(responseData, null, 2));
// Made by https://t.me/Ashlynn_Repository
    return responseData.result; // Return the sent message details
  } catch (error) {
    console.error('Error in sendText:', error);
  }
}

// Made by https://t.me/Ashlynn_Repository
async function deleteMessage(chatId, messageId) {
  const apiUrl = `https://api.telegram.org/bot${TOKEN}/deleteMessage`;
// Made by https://t.me/Ashlynn_Repository
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId
      })
    });
// Made by https://t.me/Ashlynn_Repository
    const responseData = await response.json();
    console.log('deleteMessage API Response:', JSON.stringify(responseData, null, 2));
  } catch (error) {
    console.error('Error in deleteMessage:', error);
  }
}
// Made by https://t.me/Ashlynn_Repository
async function registerWebhook(event, requestUrl) {
  const webhookUrl = `${requestUrl.protocol}//${requestUrl.hostname}${WEBHOOK}`;
  const apiUrl = `https://api.telegram.org/bot${TOKEN}/setWebhook`;
// Made by https://t.me/Ashlynn_Repository
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: webhookUrl })
  });
// Made by https://t.me/Ashlynn_Repository
  const data = await response.json();
  console.log('Webhook Registration Response:', data);
// Made by https://t.me/Ashlynn_Repository
  return new Response(data.ok ? 'Webhook registered.' : `Failed to register webhook: ${data.description}`);
}

// Made by https://t.me/Ashlynn_Repository
async function unRegisterWebhook() {
  const apiUrl = `https://api.telegram.org/bot${TOKEN}/setWebhook`;
// Made by https://t.me/Ashlynn_Repository
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: '' })
  });
// Made by https://t.me/Ashlynn_Repository
  const data = await response.json();
  console.log('Webhook Unregistration Response:', data);
// Made by https://t.me/Ashlynn_Repository
  return new Response(data.ok ? 'Webhook unregistered.' : `Failed to unregister webhook: ${data.description}`);
}
// Made by https://t.me/Ashlynn_Repository
async function handleUnshortenRequest(chatId, urlToUnshorten) {
  if (!urlToUnshorten || !urlToUnshorten.trim()) {
    await sendText(chatId, "⚠️ Please provide a valid URL to unshorten!");
    return;
  }
// Made by https://t.me/Ashlynn_Repository
  try {
    const resolvedUrl = await resolveShortUrl(urlToUnshorten);
// Made by https://t.me/Ashlynn_Repository
    if (!resolvedUrl) {
      console.error("Unshortening failed: Could not resolve the URL");
      await sendText(
        chatId,
        "⚠️ Could not resolve the provided URL. Please ensure it is a valid short URL."
      );
      return;
    }
// Made by https://t.me/Ashlynn_Repository
    const message =
      `✅ *URL Unshortened Successfully!*\n\n` +
      `🔗 *Short URL:* [${urlToUnshorten}](${urlToUnshorten})\n` +
      `🔗 *Original URL:* [${resolvedUrl}](${resolvedUrl})\n` +
      `📅 *Unshortened On:* ${new Date().toISOString()}\n` +
      `🛠️ *Creator:* [Ashlynn Repository](https://t.me/Ashlynn_Repository)`;

    await sendText(chatId, message);
  } catch (error) {
    console.error("Error in URL unshortening:", error);
    await sendText(chatId, "⚠️ Unshortening failed. Please try again later.");
  }
}

// Made by https://t.me/Ashlynn_Repository
async function resolveShortUrl(shortUrl) {
  try {
    const response = await fetch(shortUrl, {
      method: "GET",
      redirect: "manual", // Prevent automatic redirects
    });
// Made by https://t.me/Ashlynn_Repository
    if (response.status >= 300 && response.status < 400 && response.headers.has("location")) {
      return response.headers.get("location");
    }
// Made by https://t.me/Ashlynn_Repository
    if (response.status === 200) {
      return shortUrl;
    }
// Made by https://t.me/Ashlynn_Repository
    return null;
  } catch (error) {
    console.error("Error resolving URL:", error);
    return null;
  }
}
// Made by https://t.me/Ashlynn_Repository
