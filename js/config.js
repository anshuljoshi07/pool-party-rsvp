/**
 * Configuration & Question Schema for Pool Party RSVP Website
 * Supports dual variants: 'friends' (9 questions) and 'office' (7 questions)
 */

const CONFIG = {
  // Google Maps Location URL for Opulent Farms, Gurugram
  mapsUrl: "https://www.google.com/maps/place/Opulent+Farms/@28.4193106,77.1217483,17z/data=!4m6!3m5!1s0x390d210016a8b1c1:0x4753ceb12f9d805f!8m2!3d28.4192178!4d77.1217516!16s%2Fg%2F11ynzt_nvx!18m1!1e1?entry=ttu&g_ep=EgoyMDI2MDcxNS4wIKXMDSoASAFQAw%3D%3D",
  
  // Target Google Form Endpoint URL
  formAction: "https://docs.google.com/forms/d/e/1FAIpQLSd-ONKxNzaPeInODnNGkj9Pn9RCahqG6YkQD85iAum7PcLRew/formResponse",

  // Google Form Entry Field Mappings
  entryIds: {
    interest: "entry.700043704",
    dates: "entry.2027061465",
    customDate: "entry.1561466137",
    availability: "entry.1009540157",
    bringingGuests: "entry.992017204",
    guestCount: "entry.1386035851",
    drinking: "entry.730930056",
    drinkChoices: "entry.219112724",
    activities: "entry.1115945639",
    stayingOver: "entry.2012413915",
    costSharing: "entry.1781488129",
    name: "entry.1514535530",
    whatsapp: "entry.793855845",
    specialRequests: "entry.2124164777"
  },

  // Hero Section content for both variants
  hero: {
    friends: {
      badge: "🎉 Friends Farewell Edition",
      title: "You're invited (maybe)",
      paragraphs: [
        "Okay, here's what I'm thinking. Before I'm out of here, I want to throw one proper party. Not the usual living-room hangout. A whole farmhouse for the night, out at Opulent Farms in Gurugram, the one in the photo with the pool. Cricket and football through the day, everyone in the pool, a proper beer session once it cools down, and karaoke to close it out.",
        "Here's the catch though. Pulling this off is a bit of a headache, and it only makes sense if enough of you actually show up. A farmhouse and a pool for six people is just sad. So I'm testing the waters first. If the numbers are there, I'll book it. If not, we'll do the usual chill thing at home like always, no big deal.",
        "Takes two minutes. Fill it in and tell me if you're in."
      ],
      ctaText: "Let's Test The Waters 🌊"
    },
    office: {
      badge: "👔 Office Farewell Edition",
      title: "You're invited",
      paragraphs: [
        "Before I move on from here, I'd like to mark the occasion properly rather than the usual after-work drinks. The plan is an afternoon at a farmhouse in Gurugram (Opulent Farms, the one in the photo, pool included). We'd head over around 4, spend a few hours by the pool with some games, snacks and drinks, and wrap up by 7 or 8 so everyone can still make their evening calls.",
        "It's a fair bit to organise, so it only really works if enough people are up for it. Before I lock anything in, I'd like to get a sense of who's genuinely interested. If the turnout's there, I'll go ahead and sort out the rest.",
        "It only takes a couple of minutes. Fill it in and let me know if you'd like to come along."
      ],
      ctaText: "Count Me In 🏊"
    }
  },

  // Complete Question Definitions
  questions: [
    {
      id: "interest",
      number: 1,
      title: "Would you be interested in coming?",
      subtitle: "First things first — tell me where you stand.",
      type: "single",
      required: true,
      options: [
        { label: "Yeah, I'm in", value: "Yeah, I'm in", icon: "🔥" },
        { label: "Maybe — tell me more first", value: "Maybe — tell me more first", icon: "🤔" },
        { label: "Not really my thing", value: "Not really my thing", icon: "😅" }
      ]
    },
    {
      id: "dates",
      number: 2,
      title: "Which of these dates work for you?",
      subtitle: "Pick a date option that fits your schedule.",
      type: "single_with_custom",
      required: true,
      options: [
        { label: "6th August (Thursday)", value: "6th August (Thursday)", icon: "📅" },
        { label: "7th August (Friday)", value: "7th August (Friday)", icon: "🎉" },
        { label: "12th August (Wednesday)", value: "12th August (Wednesday)", icon: "☀️" },
        { label: "None of these — suggest a better date", value: "custom", icon: "✍️" }
      ],
      customTriggerValue: "custom",
      customPlaceholder: "Type your preferred date..."
    },
    {
      id: "availability",
      number: 3,
      title: "Are you free that night, realistically?",
      subtitle: "No pressure, just being practical about timing.",
      type: "single",
      required: true,
      options: [
        { label: "Yes, fully free", value: "Yes, fully free", icon: "✅" },
        { label: "Free but might be late / leave early", value: "Free but might be late / leave early", icon: "⏳" },
        { label: "Not sure yet", value: "Not sure yet", icon: "❓" }
      ]
    },
    {
      id: "bringing_anyone",
      number: 4,
      title: "Bringing anyone along?",
      subtitle: "Plus-ones welcome if space permits!",
      type: "single_with_count",
      required: true,
      options: [
        { label: "No, just me", value: "No, just me", icon: "🚶" },
        { label: "Yes", value: "Yes", icon: "👥" }
      ],
      triggerValue: "Yes",
      countLabel: "How many guests?",
      minCount: 1,
      maxCount: 5
    },
    {
      id: "drinks",
      number: 5,
      title: "Will you be drinking?",
      subtitle: "Helps us plan beverage quantities.",
      type: "drinks_conditional",
      required: true,
      options: [
        { label: "Yes", value: "Yes", icon: "🍻" },
        { label: "No", value: "No", icon: "🥤" }
      ],
      triggerValue: "Yes",
      subQuestionTitle: "What's your poison? (Pick all that apply)",
      drinkOptions: [
        { label: "Vodka", value: "Vodka", icon: "🍸" },
        { label: "Beer", value: "Beer", icon: "🍺" },
        { label: "Whiskey", value: "Whiskey", icon: "🥃" },
        { label: "Gin", value: "Gin", icon: "🍸" },
        { label: "Rum", value: "Rum", icon: "🍹" }
      ]
    },
    {
      id: "activities",
      number: 6,
      title: "What are you up for?",
      subtitle: "Multi-select your favorite pool & lounge activities.",
      type: "multi",
      required: false,
      options: [
        { label: "Cricket", value: "Cricket", icon: "🏏" },
        { label: "Football", value: "Football", icon: "⚽" },
        { label: "Swimming", value: "Swimming", icon: "🏊" },
        { label: "Pool volleyball", value: "Pool volleyball", icon: "🏐" },
        { label: "PS5 / FIFA session", value: "PS5 / FIFA session", icon: "🎮" },
        { label: "Karaoke", value: "Karaoke", icon: "🎤" }
      ]
    },
    {
      id: "staying_over",
      number: 7,
      title: "Planning to stay the night, or head home after?",
      subtitle: "We've got around 5 good AC rooms in the house — separate arrangements for men and women. Location's totally Uber-friendly if you'd rather head back.",
      type: "single",
      required: true,
      friendsOnly: true, // Omitted in Office version
      options: [
        { label: "I'll stay over", value: "I'll stay over", icon: "🏡" },
        { label: "Nah, I'll party all night and head out early morning", value: "Nah, I'll party all night and head out early morning", icon: "🌅" },
        { label: "Not sure yet", value: "Not sure yet", icon: "🚗" }
      ]
    },
    {
      id: "cost_sharing",
      number: 8,
      title: "Would you be open to chipping in if needed?",
      subtitle: "I'll try to cover drinks, food, and stay all-in. But if it overspills a bit, would you be open to chipping in to share the load? (Won't go beyond ₹500.)",
      type: "single",
      required: true,
      friendsOnly: true, // Omitted in Office version
      options: [
        { label: "Yeah, happy to chip in", value: "Yeah, happy to chip in", icon: "🤝" },
        { label: "Sure, if it's needed", value: "Sure, if it's needed", icon: "👍" },
        { label: "Rather just come as your guest", value: "Rather just come as your guest", icon: "✨" }
      ]
    },
    {
      id: "contact",
      number: 9,
      title: "Almost done — how do I reach you?",
      subtitle: "So I know who's coming and can coordinate updates.",
      type: "contact_fields",
      required: true,
      fields: [
        { id: "name", label: "Your Name", placeholder: "e.g. Alex", required: true, type: "text" },
        { id: "whatsapp", label: "WhatsApp Number", placeholder: "e.g. +91 98765 43210", required: true, type: "tel" },
        { id: "specialRequests", label: "Special arrangements / Anything to bring?", placeholder: "Rummy cards, playlist requests, dietary preferences...", required: false, type: "textarea" }
      ]
    }
  ]
};
