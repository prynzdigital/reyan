/* =========================================================
   SITE DATA — edit this file to update the website.
   No coding knowledge needed: change the text between quotes.
   ========================================================= */
window.SITE = {
  ministryName: "Richard Engmann Ministries",
  tagline: "Preaching Christ · Reaching Nations",
  email: "info@richardengmannministries.org",
  phone: "+000 000 0000",
  address: "Ministry Headquarters, Your City",

  /* ---------- YouTube ----------
     channelId: find it at youtube.com → your channel → About → Share → Copy channel ID
     (it starts with "UC..."). The live player will show your current live stream,
     or your latest stream when you're offline. */
  youtube: {
    channelId: "",                 // e.g. "UCxxxxxxxxxxxxxxxxxxxxxx"
    handle: "@RichardEngmannMinistries",    // your @handle
  },

  /* ---------- Links ---------- */
  links: {
    spotify: "https://open.spotify.com/",
    applePodcasts: "https://podcasts.apple.com/",
    givingLink: "#give",           // e.g. your PayPal / Stripe / church giving page
  },

  socials: {
    youtube: "https://youtube.com/@RichardEngmannMinistries",
    facebook: "https://facebook.com/",
    instagram: "https://instagram.com/",
    tiktok: "https://tiktok.com/",
    x: "https://x.com/",
  },

  /* ---------- Service times ----------
     day: 0=Sunday, 1=Monday … 6=Saturday. time: 24h "HH:MM" (visitor's local time).
     The hero countdown and "LIVE NOW" badge use these. */
  services: [
    { name: "Sunday Celebration", day: 0, time: "10:00", durationMins: 120, note: "Live on YouTube" },
    { name: "Midweek Bible Study", day: 3, time: "18:30", durationMins: 90, note: "Live on YouTube" },
    { name: "Friday Prayer Night", day: 5, time: "21:00", durationMins: 120, note: "Live on YouTube" },
  ],

  weeklyMessage: {
    title: "“Fire on the Altar” — Leviticus 6:13",
    desc: "A call to keep our devotion burning in a cold world. Bring your Bible and a hungry heart.",
  },

  /* ---------- Verses (one is chosen per day) ---------- */
  verses: [
    { text: "Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost.", ref: "Matthew 28:19" },
    { text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.", ref: "John 3:16" },
    { text: "Thy word is a lamp unto my feet, and a light unto my path.", ref: "Psalm 119:105" },
    { text: "I can do all things through Christ which strengtheneth me.", ref: "Philippians 4:13" },
    { text: "For I am not ashamed of the gospel of Christ: for it is the power of God unto salvation to every one that believeth.", ref: "Romans 1:16" },
    { text: "But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles.", ref: "Isaiah 40:31" },
    { text: "Ye are the light of the world. A city that is set on an hill cannot be hid.", ref: "Matthew 5:14" },
  ],

  /* ---------- Sermons ----------
     youtubeId: the part after "v=" in a YouTube link. Leave empty to show a styled card. */
  sermons: [
    { title: "Fire on the Altar", ref: "Leviticus 6:13", series: "Revival", date: "2026-10-11", length: "54 min", desc: "Keeping the flame of devotion burning when the world grows cold.", youtubeId: "", word: "Fire" },
    { title: "The Power of the Name", ref: "Philippians 2:9–11", series: "Faith", date: "2026-10-04", length: "48 min", desc: "Why every knee will bow — and what that means for your Monday.", youtubeId: "", word: "The Name" },
    { title: "Beautiful Feet", ref: "Romans 10:13–15", series: "Missions", date: "2026-09-27", length: "51 min", desc: "Every believer is sent. Discover your place in the Great Commission.", youtubeId: "", word: "Sent" },
    { title: "Prayer That Moves Heaven", ref: "James 5:16", series: "Prayer", date: "2026-09-20", length: "46 min", desc: "Lessons from Elijah on fervent, effective, righteous prayer.", youtubeId: "", word: "Pray" },
    { title: "Dry Bones, Live!", ref: "Ezekiel 37:1–10", series: "Revival", date: "2026-09-13", length: "57 min", desc: "When hope looks dead, God still speaks life by His Word and Spirit.", youtubeId: "", word: "Live" },
    { title: "Walking on Water", ref: "Matthew 14:22–33", series: "Faith", date: "2026-09-06", length: "43 min", desc: "Faith that steps out of the boat and keeps its eyes on Jesus.", youtubeId: "", word: "Faith" },
  ],

  /* ---------- Podcast ----------
     audio: link to an .mp3 file. If empty, the play button opens Spotify instead. */
  podcast: [
    { title: "Hearing God in a Noisy World", desc: "Practical ways to recognise the voice of the Shepherd.", date: "2026-10-09", length: "32 min", audio: "" },
    { title: "Missions Is Not Optional", desc: "Why the Great Commission is for every believer — not just missionaries.", date: "2026-10-02", length: "28 min", audio: "" },
    { title: "When Prayers Seem Unanswered", desc: "Trusting God in the waiting season.", date: "2026-09-25", length: "35 min", audio: "" },
    { title: "Raising Godly Leaders", desc: "Conversation with pastors from the field on discipleship.", date: "2026-09-18", length: "41 min", audio: "" },
    { title: "Fasting: The Forgotten Discipline", desc: "What Scripture teaches and how to begin.", date: "2026-09-11", length: "30 min", audio: "" },
  ],

  /* ---------- Current mission project ---------- */
  project: {
    title: "Village Outreach & Bible Distribution",
    desc: "Help us reach 20 villages this year with the Gospel, 5,000 Bibles and free medical camps.",
    raised: 18450,
    goal: 30000,
    currency: "$",
  },

  /* ---------- Events ---------- */
  events: [
    { title: "Fire Conference 2026", date: "2026-11-14", time: "9:00 AM – 6:00 PM", place: "Main Auditorium & Online", desc: "Two days of worship, the Word and the move of the Spirit. Guest ministers to be announced.", cta: "Register" },
    { title: "Village Crusade — Outreach Week", date: "2026-12-02", time: "All week", place: "Northern Region", desc: "Open-air Gospel meetings, medical camp and Bible distribution. Volunteers welcome.", cta: "Volunteer" },
    { title: "Crossover Night Service", date: "2026-12-31", time: "10:00 PM", place: "Main Auditorium & YouTube Live", desc: "Cross into the new year in prayer, praise and prophetic declarations.", cta: "Save the date" },
  ],

  /* ---------- Testimonies ---------- */
  testimonies: [
    { text: "I watched the Friday prayer stream from my hospital bed. I believed, and within a week the doctors couldn't find the growth. All glory to Jesus!", name: "Grace A.", place: "Online family" },
    { text: "The podcast found me at my lowest point. Episode by episode, God rebuilt my faith. Today I'm serving in my local church.", name: "Daniel K.", place: "Podcast listener" },
    { text: "Richard's team brought Bibles and a medical camp to our village. Over 200 people gave their lives to Christ in three days.", name: "Pastor Samuel", place: "Mission partner" },
  ],

  /* Gift impact messages (shown in the Give box) */
  giveImpact: [
    { min: 0, text: "Every gift helps carry the Gospel further." },
    { min: 25, text: "{amt} feeds a family for a week during outreach." },
    { min: 50, text: "{amt} provides 10 Bibles for new believers." },
    { min: 100, text: "{amt} sponsors a pastor at our leadership training." },
    { min: 250, text: "{amt} funds a day of free medical camp in a village." },
    { min: 500, text: "{amt} helps power a full open-air Gospel crusade." },
  ],

  /* ---------- Forms ----------
     To receive form messages by email, create a free form at https://formspree.io
     and paste the endpoint here (e.g. "https://formspree.io/f/abcdwxyz").
     Leave empty and forms will open the visitor's email app instead. */
  formEndpoint: "",
};
