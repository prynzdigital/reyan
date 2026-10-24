/* =========================================================
   SITE DATA — edit this file to update the website.
   No coding knowledge needed: change the text between quotes.
   Items marked PLACEHOLDER are examples — replace them with real details.
   ========================================================= */
window.SITE = {
  ministryName: "Richard Engmann Ministries",
  preacherName: "Richard Engmann",            // how he is addressed across the site
  tagline: "The Word. The Spirit. The Nations.",
  email: "",                                      // add the ministry email when ready (hidden until then)
  phone: "+233 54 790 4882",
  whatsapp: "233547904882",                       // number for WhatsApp messages, digits only with country code
  address: "P.O. Box MC 1183, Market Circle, Takoradi",

  /* ---------- Photos ----------
     Put photos in the "images" folder and type the file name here.
     position: which part of the photo to keep in view when it is cropped
     ("left/right %" then "top/bottom %"), e.g. "45% 30%" keeps the face visible.
     The hero shows its photos as a slideshow, in this order. */
  photos: {
    hero: [
      { src: "images/pastor-1.jpg", position: "44% 28%" },
      { src: "images/pastor-2.jpg", position: "52% 30%" },
      { src: "images/pastor-3.jpg", position: "56% 32%" },
    ],
    about: { src: "images/pastor-portrait.jpg", position: "50% 22%" },
    partner: { src: "images/pastor-2.jpg", position: "50% 40%" },
  },

  /* ---------- YouTube ----------
     channelId: youtube.com → your channel → About → Share → Copy channel ID (starts with "UC").
     The live player shows the current live stream, or the latest one when offline. */
  youtube: {
    channelId: "UCBQGyj_QpL6vAyFEwE5TtOw",       // Richard Engmann Ministries
    handle: "@richardengmannministries",
  },

  links: {
    spotify: "",        // add the Faith Café Spotify link when ready (shows "Coming soon" until then)
    applePodcasts: "",  // add the Faith Café Apple Podcasts link when ready
    podcastTiktok: "https://www.tiktok.com/@richardengmann",
    podcastInstagram: "https://www.instagram.com/", // PLACEHOLDER — Faith Café Podcast Instagram page
    givingLink: "#partner",       // your PayPal / Stripe / giving page
    store: "#resources",          // where books are sold (Amazon, Selar, your shop…)
    school: "#resources",         // training school sign-up page
  },

  socials: {
    youtube: "https://www.youtube.com/@richardengmannministries",
    facebook: "https://facebook.com/",
    instagram: "https://instagram.com/",
    tiktok: "https://www.tiktok.com/@richardengmann",
    x: "https://x.com/",
  },

  /* ---------- Biography ---------- */
  bio: [
    "Richard Engmann is a pastor, teacher and missionary with one burden: that every person would hear the Gospel of Jesus Christ and discover the life God has made available to them.",
    "Through Richard Engmann Ministries he leads the Faith Café Conference and Healing Today, Gospel outreaches and leadership training, and teaches believers to live by the Word and walk in the power of the Holy Spirit. His teaching is deep yet simple, rooted in Scripture and practical for everyday life.",
    "From local churches to open-air crusades, online broadcasts and the Faith Café Podcast, Richard Engmann is committed to strengthening the Church, raising leaders and reaching the nations.",
  ],

  /* ---------- What the ministry offers (big tiles) ----------
     image: optional photo for the tile, e.g. "images/books.jpg"
     logo: optional logo shown instead of the title */
  resources: [
    { title: "Books & Studies", text: "Books and small-group studies that ground believers in the Word and teach them to live it out every day.", link: "#new-release", cta: "View books", image: "" },
    { title: "School of Ministry", text: "Practical, Scripture-rich training courses for believers and leaders who want to grow in the Word and serve with power.", link: "#contact", cta: "Learn more", image: "" },  // PLACEHOLDER name
    { title: "Meetings & Conferences", text: "From the Faith Café Conference to Healing Today: gatherings where faith is built, the sick are prayed for and lives are changed.", link: "#events", cta: "See schedule", image: "" },
    { title: "Faith Café Podcast", logo: "images/faith-cafe-logo.png", text: "Honest, faith-building conversations on the Word, prayer and missions. New episodes every week.", link: "#podcast", cta: "Listen", image: "" },
  ],

  /* ---------- New book spotlight ---------- */
  newRelease: {                                   // PLACEHOLDER — your latest book
    kicker: "New Release",
    title: "Fire on the Altar",
    subtitle: "Keeping Your Devotion Burning in a Cold World",
    text: "A practical call back to first love. Drawing from Scripture and years of ministry, Richard Engmann shows how prayer, the Word and obedience keep the fire of God alive in an ordinary life.",
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
     Leave empty while there are no regular live services: the Watch Live section
     then shows no schedule. To add one later, copy the example line without the //.
     day: 0=Sunday … 6=Saturday. time: 24h "HH:MM". durationMins: how long it runs. */
  services: [
    // { name: "Sunday Service", day: 0, time: "10:00", durationMins: 120 },
  ],

  /* ---------- Popular videos ----------
     youtubeId: the part after "v=" in a YouTube link (shows the real thumbnail).
     place: the small line under the title (a date or location). */
  videos: [
    { title: "The Word Is Medicine", place: "Sep 25, 2026", youtubeId: "-y6oYj-mpXc" },
    { title: "What Are You Saying?", place: "Jul 31, 2026", youtubeId: "WKa0W3pb9Nc" },
    { title: "Faith Is Of The Mouth", place: "Jul 13, 2026", youtubeId: "mXVJjDA9-1A" },
    { title: "Faith Is Not Of The Senses", place: "Jun 2, 2026", youtubeId: "AIaJetKec1w" },
  ],

  /* ---------- Podcast ----------
     audio: link to an .mp3 file. If empty, the play button opens Spotify. */
  podcast: [
    { title: "Hearing God in a Noisy World", date: "2026-10-09", length: "32 min", audio: "" },
    { title: "Missions Is Not Optional", date: "2026-10-02", length: "28 min", audio: "" },
    { title: "When Prayers Seem Unanswered", date: "2026-09-25", length: "35 min", audio: "" },
    { title: "Raising Godly Leaders", date: "2026-09-18", length: "41 min", audio: "" },
  ],

  /* ---------- Testimonies ----------
     Add real testimonies here (with the person's permission). Each one becomes a card.
     Until there are any, the section shows only the "Share your testimony" invitation.
     The two lines below are EXAMPLES of the format only (switched off with //).
     Copy the pattern for each real testimony, without the // at the start. */
  testimonies: [
    // { text: "Write the testimony here in the person's own words.", name: "First name + initial", place: "Town" },
    // { text: "Another testimony…", name: "Name", place: "Town" },
  ],

  /* ---------- Signature conferences (shown above the schedule) ----------
     link: registration or info page; cta: button text.
     kicker: small label above the name (default "Signature conference"); logo: optional logo image. */
  conferences: [
    { name: "Faith Café Conference", text: "A gathering around the Word where believers sit at the table of faith: worship, teaching and fellowship that leave you strengthened to believe God.", link: "#contact", cta: "Get updates" },
    { name: "Healing Today", kicker: "Healing service", logo: "images/healing-today-logo.png", text: "Jesus still heals today. A healing service of Bible teaching on divine healing, faith-filled worship and prayer for the sick.", link: "#contact", cta: "Get updates" },
  ],

  /* ---------- Schedule ----------
     endDate is optional (for multi-day events). link: registration or info page. */
  events: [                                                                       // PLACEHOLDER events
    { date: "2026-11-14", endDate: "2026-11-15", city: "Accra, Ghana", venue: "Revival Service", link: "#contact", cta: "Register" },
    { date: "2026-11-28", city: "Kumasi, Ghana", venue: "Living Word Church", link: "#contact", cta: "More info" },
    { date: "2026-12-02", endDate: "2026-12-06", city: "Northern Region, Ghana", venue: "Village Crusade & Medical Outreach", link: "#contact", cta: "Volunteer" },
    { date: "2026-12-31", city: "Accra, Ghana", venue: "Crossover Night — Live on YouTube", link: "#live", cta: "Watch live" },
    { date: "2027-02-20", endDate: "2027-02-21", city: "London, UK", venue: "Revival Meetings", link: "#contact", cta: "More info" },
  ],

  /* ---------- Forms ----------
     Create a free form at https://formspree.io and paste the endpoint here
     (e.g. "https://formspree.io/f/abcdwxyz"). Leave empty and forms open the visitor's email app (or WhatsApp if no email is set). */
  formEndpoint: "",
};
