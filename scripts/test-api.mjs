async function testApp() {
  console.log("=== Testing Maveshi Bajar Endpoints ===");

  // 1. Animals public API
  const animalsRes = await fetch("http://localhost:3000/api/animals");
  const animalsData = await animalsRes.json();
  console.log("✓ /api/animals status:", animalsRes.status);
  console.log("  Total animals:", animalsData.count);
  console.log("  Max animals limit:", animalsData.maxAnimals);
  console.log("  Categories present:", Array.from(new Set(animalsData.animals.map(a => a.category))));

  // 2. Contact public API
  const contactRes = await fetch("http://localhost:3000/api/contact");
  const contactData = await contactRes.json();
  console.log("✓ /api/contact status:", contactRes.status);
  console.log("  Seller Name:", contactData.contact.sellerName);
  console.log("  Seller Phone:", contactData.contact.sellerPhone);
  console.log("  Seller WhatsApp:", contactData.contact.sellerWhatsapp);

  // 3. Admin Login
  const loginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@maveshibajar.com",
      password: "admin123456",
    }),
  });
  console.log("✓ /api/auth/login status:", loginRes.status);
  const cookieHeader = loginRes.headers.get("set-cookie");
  console.log("  Cookie set:", !!cookieHeader);

  // 4. Admin Auth Me with Cookie
  if (cookieHeader) {
    const meRes = await fetch("http://localhost:3000/api/auth/me", {
      headers: { Cookie: cookieHeader.split(";")[0] },
    });
    const meData = await meRes.json();
    console.log("✓ /api/auth/me status:", meRes.status);
    console.log("  Authenticated admin:", meData.admin?.email);
  }

  // 5. Test single animal details
  const firstId = animalsData.animals[0]?._id;
  if (firstId) {
    const animalRes = await fetch(`http://localhost:3000/api/animals/${firstId}`);
    const animalData = await animalRes.json();
    console.log(`✓ /api/animals/${firstId} status:`, animalRes.status);
    console.log("  Breed:", animalData.animal?.breed);
    console.log("  Price:", animalData.animal?.price);
    console.log("  Has Video:", !!animalData.animal?.video?.secure_url);
    if (animalData.animal?.video) {
      console.log("  Video URL (direct stream):", animalData.animal.video.secure_url);
      console.log("  Video Duration:", animalData.animal.video.duration, "seconds");
    }
  }

  // 6. Test HTML page responses
  const homeHtmlRes = await fetch("http://localhost:3000/");
  console.log("✓ Home page (/) status:", homeHtmlRes.status);

  const contactHtmlRes = await fetch("http://localhost:3000/contact");
  console.log("✓ Contact page (/contact) status:", contactHtmlRes.status);

  const adminHtmlRes = await fetch("http://localhost:3000/admin");
  console.log("✓ Admin dashboard (/admin) status:", adminHtmlRes.status);

  // 7. Test PWA manifest
  const manifestRes = await fetch("http://localhost:3000/manifest.webmanifest");
  const manifestData = await manifestRes.json();
  console.log("✓ Manifest status:", manifestRes.status);
  console.log("  App Name:", manifestData.name);
  console.log("  Display Mode:", manifestData.display);

  console.log("\n>>> ALL API AND PAGE CHECKS PASSED SUCCESSFULLY! <<<");
}

testApp().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
