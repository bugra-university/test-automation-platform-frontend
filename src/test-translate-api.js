// Test script for LibreTranslate API
const testTranslateAPI = async () => {
  const text = "Merhaba dünya, bu bir test mesajıdır.";
  console.log("Original text:", text);

  try {
    // LibreTranslate API (using the public instance)
    const response = await fetch("https://libretranslate.com/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: text,
        source: "tr",
        target: "en",
        format: "text",
      }),
    });

    const data = await response.json();

    if (data.translatedText) {
      console.log("Translated text:", data.translatedText);
      console.log("✅ Translation API working correctly!");
    } else {
      console.error("Translation API error:", data);
      console.log("❌ Translation failed!");
    }
  } catch (error) {
    console.error("API request failed:", error);
    console.log(
      "❌ API request failed! Check if LibreTranslate is accessible."
    );
  }
};

// Run the test
testTranslateAPI();

// Note: If this test fails, you might need to use an API key or a different LibreTranslate instance
// Alternative instance: https://translate.argosopentech.com/translate
// You can test with that by changing the URL above
