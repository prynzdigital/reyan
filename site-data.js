/* =========================================================
   SITE DATA — edit this file to update the website.
   No coding knowledge needed: change the text between quotes.
   Items marked PLACEHOLDER are examples — replace them with real details.
   ========================================================= */
window.SITE = {
  ministryName: "Richard Engmann Ministries",
  preacherName: "Richard Engmann",
  tagline: "The Word. The Spirit. The Nations.",
  email: "info@richardengmannministries.org",   // PLACEHOLDER
  phone: "+000 000 0000",                         // PLACEHOLDER
  address: "P.O. Box 000, Your City",             // PLACEHOLDER

  /* ---------- Photos ----------
     Put photos in the "images" folder and type the file name here, e.g. "images/hero.jpg".
     Leave empty to show the dark stand-in backgrounds. */
  photos: {
    hero: "",        // wide photo of Richard preaching (landscape, at least 1920px wide)
    about: "",       // portrait photo for the biography
    partner: "",     // crowd / outreach photo behind the partner section
  },

  /* ---------- YouTube ----------
     channelId: youtube.com → your channel → About → Share → Copy channel ID (starts with "UC").
     The live player shows the current live stream, or the latest one when offline. */
  youtube: {
    channelId: "",                              // e.g. "UCxxxxxxxxxxxxxxxxxxxxxx"
    handle: "@RichardEngmannMinistries",        // PLACEHOLDER — your @handle
  },

  links: {
    spotify: "https://open.spotify.com/",
    applePodcasts: "https://podcasts.apple.com/",
    givingLink: "#partner",       // your PayPal / Stripe / giving page
    store: "#resources",          // where books are sold (Amazon, Selar, your shop…)
    school: "#resources",         // training school sign-up page
  },

  socials: {
    youtube: "https://youtube.com/@RichardEngmannMinistries",
    facebook: "https://facebook.com/",
    instagram: "https://instagram.com/",
    tiktok: "https://tiktok.com/",
    x: "https://x.com/",
  },

  /* ---------- Biography ---------- */
  bio: [
    "Richard Engmann is a preacher, teacher and missionary with one burden: that every person would hear the Gospel of Jesus Christ and discover the life God has made available to them.",
    "Through Richard Engmann Ministries he leads conferences, Gospel outreaches and leadership training, and teaches believers to live by the Word and walk in the power of the Holy Spirit. His teaching is deep yet simple, rooted in Scripture and practical for everyday life.",
    "From local churches to open-air crusades, online broadcasts and the Faith Café Podcast, Richard is committed to strengthening the Church, raising leaders and reaching the nations.",
  ],

  /* ---------- What the ministry offers (big tiles) ----------
     image: optional photo for the tile, e.g. "images/books.jpg" */
  resources: [
    { title: "Books & Studies", text: "Books and small-group studies that ground believers in the Word and teach them to live it out every day.", link: "#new-release", cta: "View books", image: "" },
    { title: "School of Ministry", text: "Practical, Scripture-rich training courses for believers and leaders who want to grow in the Word and serve with power.", link: "#contact", cta: "Learn more", image: "" },  // PLACEHOLDER name
    { title: "Meetings & Conferences", text: "Gospel meetings, crusades and conferences where faith is built, lives are changed and the presence of God is known.", link: "#events", cta: "See schedule", image: "" },
    { title: "Faith Café Podcast", text: "Honest, faith-building conversations on the Word, prayer and missions. New episodes every week.", link: "#podcast", cta: "Listen", image: "" },
  ],

  /* ---------- New book spotlight ---------- */
  newRelease: {                                   // PLACEHOLDER — your latest book
    kicker: "New Release",
    title: "Fire on the Altar",
    subtitle: "Keeping Your Devotion Burning in a Cold World",
    text: "A practical call back to first love. Drawing from Scripture and years of ministry, Richard shows how prayer, the Word and obedience keep the fire of God alive in an ordinary life.",
    cta: "Get a copy",
    link: "#contact",
    cover: "",                                    // optional cover image, e.g. "images/book.jpg"
  },

  /* ---------- Partner program ---------- */
  partner: {
    title: "Partner with the mission",
    text: "Monthly partners make it possible to preach the Gospel in new places, train leaders and care for communities in need. Partners receive a monthly ministry report, prayer letters and invitations to partner gatherings.",
    project: { title: "Village Outreach & Bible Distribution", raised: 18450, goal: 30000 },  // PLACEHOLDER figures
    currency: "$",
  },

  giveImpact: [
    { min: 0, text: "Every gift helps carry the Gospel further." },
    { min: 25, text: "{amt} feeds a family for a week during outreach." },
    { min: 50, text: "{amt} provides 10 Bibles for new believers." },
    { min: 100, text: "{amt} sponsors a pastor at leadership training." },
    { min: 250, text: "{amt} funds a day of free medical camp in a village." },
    { min: 500, text: "{amt} helps power a full open-air Gospel crusade." },
  ],

  /* ---------- Live services ----------
     day: 0=Sunday … 6=Saturday. time: 24h "HH:MM" (visitor's local time). */
  services: [
    { name: "Sunday Service", day: 0, time: "10:00", durationMins: 120 },
    { name: "Midweek Bible Study", day: 3, time: "18:30", durationMins: 90 },
    { name: "Friday Prayer Night", day: 5, time: "21:00", durationMins: 120 },
  ],

  /* ---------- Popular videos ----------
     youtubeId: the part after "v=" in a YouTube link (shows the real thumbnail). */
  videos: [
    { title: "Fire on the Altar", place: "Accra, Ghana", youtubeId: "" },        // PLACEHOLDER
    { title: "The Power of the Name", place: "Kumasi, Ghana", youtubeId: "" },   // PLACEHOLDER
    { title: "Beautiful Feet", place: "Lagos, Nigeria", youtubeId: "" },        // PLACEHOLDER
    { title: "Prayer That Moves Heaven", place: "London, UK", youtubeId: "" },   // PLACEHOLDER
  ],

  /* ---------- Podcast ----------
     audio: link to an .mp3 file. If empty, the play button opens Spotify. */
  podcast: [
    { title: "Hearing God in a Noisy World", date: "2026-10-09", length: "32 min", audio: "" },
    { title: "Missions Is Not Optional", date: "2026-10-02", length: "28 min", audio: "" },
    { title: "When Prayers Seem Unanswered", date: "2026-09-25", length: "35 min", audio: "" },
    { title: "Raising Godly Leaders", date: "2026-09-18", length: "41 min", audio: "" },
  ],

  /* ---------- Schedule ----------
     endDate is optional (for multi-day events). link: registration or info page. */
  events: [                                                                       // PLACEHOLDER events
    { date: "2026-11-14", endDate: "2026-11-15", city: "Accra, Ghana", venue: "Fire Conference 2026", link: "#contact", cta: "Register" },
    { date: "2026-11-28", city: "Kumasi, Ghana", venue: "Living Word Church", link: "#contact", cta: "More info" },
    { date: "2026-12-02", endDate: "2026-12-06", city: "Northern Region, Ghana", venue: "Village Crusade & Medical Outreach", link: "#contact", cta: "Volunteer" },
    { date: "2026-12-31", city: "Accra, Ghana", venue: "Crossover Night — Live on YouTube", link: "#live", cta: "Watch live" },
    { date: "2027-02-20", endDate: "2027-02-21", city: "London, UK", venue: "Kingdom Life Conference", link: "#contact", cta: "More info" },
  ],

  /* ---------- Forms ----------
     Create a free form at https://formspree.io and paste the endpoint here
     (e.g. "https://formspree.io/f/abcdwxyz"). Leave empty and forms open the visitor's email app. */
  formEndpoint: "",
};
