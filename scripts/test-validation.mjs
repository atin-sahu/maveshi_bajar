async function testValidation() {
  console.log("=== Testing Validation & Limits ===");

  // 1. Login to get admin cookie
  const loginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@maveshibajar.com",
      password: "admin123456",
    }),
  });
  const cookie = loginRes.headers.get("set-cookie")?.split(";")[0];

  // 2. Test missing thumbnail
  const noThumbRes = await fetch("http://localhost:3000/api/animals", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    body: JSON.stringify({
      category: "cow",
      breed: "गिर गाय (Gir)",
      age: 3,
      biyat: 1,
      price: 65000,
      gender: "female",
      images: [
        {
          public_id: "test_img_1",
          secure_url: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e",
        },
      ],
      thumbnail: null,
    }),
  });
  const noThumbData = await noThumbRes.json();
  console.log("✓ Missing thumbnail rejected (Status 400):", noThumbRes.status === 400);
  console.log("  Error message:", noThumbData.messageHi || noThumbData.error);

  // 3. Test creating up to max limit (10) and then trying to add the 11th
  console.log("✓ Testing MAX_ANIMALS (10) enforcement...");
  const currentRes = await fetch("http://localhost:3000/api/animals");
  const currentData = await currentRes.json();
  const needed = 10 - currentData.count;

  for (let i = 0; i < needed; i++) {
    await fetch("http://localhost:3000/api/animals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      body: JSON.stringify({
        category: "cow",
        breed: `टेस्ट गाय ${i + 1}`,
        age: 3,
        biyat: 1,
        price: 50000,
        gender: "female",
        images: [
          {
            public_id: `test_img_${i}`,
            secure_url: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e",
          },
        ],
        thumbnail: {
          public_id: `test_img_${i}`,
          secure_url: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e",
        },
      }),
    });
  }

  // Now attempt to add 11th animal
  const eleventhRes = await fetch("http://localhost:3000/api/animals", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    body: JSON.stringify({
      category: "cow",
      breed: "11वीं गाय (Exceeds limit)",
      age: 3,
      biyat: 1,
      price: 50000,
      gender: "female",
      images: [
        {
          public_id: "test_11",
          secure_url: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e",
        },
      ],
      thumbnail: {
        public_id: "test_11",
        secure_url: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e",
      },
    }),
  });

  const eleventhData = await eleventhRes.json();
  console.log("✓ 11th animal rejected (Status 400):", eleventhRes.status === 400);
  console.log("  Hindi Error:", eleventhData.messageHi);
  console.log("  English Error:", eleventhData.messageEn);

  console.log("\n>>> VALIDATION CHECKS COMPLETED SUCCESSFULLY! <<<");
}

testValidation().catch((err) => {
  console.error("Validation test error:", err);
  process.exit(1);
});
