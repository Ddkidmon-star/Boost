import { SMMService, SocialPlatform, PlatformConfig } from '../types';

export const PLATFORMS: PlatformConfig[] = [
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: 'Music2',
    color: '#00f2fe',
    badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    placeholder: 'https://www.tiktok.com/@username or video link',
    urlPatterns: [
      /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@([a-zA-Z0-9_.-]+)/i,
      /(?:https?:\/\/)?(?:vm|vt)\.tiktok\.com\/([a-zA-Z0-9]+)/i,
      /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@[a-zA-Z0-9_.-]+\/video\/(\d+)/i,
    ],
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: 'Instagram',
    color: '#e1306c',
    badgeBg: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    placeholder: 'https://instagram.com/username or /p/post_id',
    urlPatterns: [
      /(?:https?:\/\/)?(?:www\.)?instagram\.com\/([a-zA-Z0-9_.-]+)/i,
      /(?:https?:\/\/)?(?:www\.)?instagr\.am\/([a-zA-Z0-9_.-]+)/i,
    ],
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: 'Youtube',
    color: '#ff0000',
    badgeBg: 'bg-red-500/10 text-red-400 border-red-500/20',
    placeholder: 'https://youtube.com/@channel or watch?v=video_id',
    urlPatterns: [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|@)([a-zA-Z0-9_-]+)/i,
      /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]+)/i,
    ],
  },
  {
    id: 'telegram',
    name: 'Telegram',
    icon: 'Send',
    color: '#0088cc',
    badgeBg: 'bg-sky-600/10 text-sky-300 border-sky-600/20',
    placeholder: 'https://t.me/channel_name or group link',
    urlPatterns: [
      /(?:https?:\/\/)?(?:t\.me|telegram\.me)\/([a-zA-Z0-9_]+)/i,
    ],
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: 'Facebook',
    color: '#1877f2',
    badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    placeholder: 'https://facebook.com/page or profile link',
    urlPatterns: [
      /(?:https?:\/\/)?(?:www\.)?facebook\.com\/([a-zA-Z0-9_.-]+)/i,
      /(?:https?:\/\/)?fb\.watch\/([a-zA-Z0-9_.-]+)/i,
    ],
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    icon: 'Twitter',
    color: '#1da1f2',
    badgeBg: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    placeholder: 'https://x.com/username or tweet link',
    urlPatterns: [
      /(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)/i,
    ],
  },
  {
    id: 'spotify',
    name: 'Spotify',
    icon: 'Disc',
    color: '#1db954',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    placeholder: 'https://open.spotify.com/track/... or artist/...',
    urlPatterns: [
      /(?:https?:\/\/)?open\.spotify\.com\/(?:track|album|artist|playlist)\/([a-zA-Z0-9]+)/i,
    ],
  },
  {
    id: 'website',
    name: 'Website Traffic',
    icon: 'Globe',
    color: '#0284c7',
    badgeBg: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    placeholder: 'https://yourwebsite.com (Direct, Google SEO or Organic)',
    urlPatterns: [
      /https?:\/\/(?:www\.)?[a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b/i,
    ],
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: 'PhoneCall',
    color: '#25d366',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    placeholder: 'https://whatsapp.com/channel/... or group link',
    urlPatterns: [
      /(?:https?:\/\/)?(?:chat\.)?whatsapp\.com\/(?:channel|invite)?\/([a-zA-Z0-9_]+)/i,
      /(?:https?:\/\/)?wa\.me\/([0-9]+)/i,
    ],
  },
  {
    id: 'threads',
    name: 'Threads',
    icon: 'AtSign',
    color: '#000000',
    badgeBg: 'bg-slate-500/10 text-slate-700 border-slate-500/20',
    placeholder: 'https://threads.net/@username or post link',
    urlPatterns: [
      /(?:https?:\/\/)?(?:www\.)?threads\.net\/@?([a-zA-Z0-9_.-]+)/i,
    ],
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: 'Linkedin',
    color: '#0a66c2',
    badgeBg: 'bg-blue-600/10 text-blue-500 border-blue-600/20',
    placeholder: 'https://linkedin.com/in/username or company page',
    urlPatterns: [
      /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in|company)\/([a-zA-Z0-9_.-]+)/i,
    ],
  },
  {
    id: 'snapchat',
    name: 'Snapchat',
    icon: 'Ghost',
    color: '#fffc00',
    badgeBg: 'bg-amber-400/10 text-amber-500 border-amber-400/20',
    placeholder: 'https://snapchat.com/add/username or story link',
    urlPatterns: [
      /(?:https?:\/\/)?(?:www\.)?snapchat\.com\/add\/([a-zA-Z0-9_.-]+)/i,
    ],
  },
  {
    id: 'twitch',
    name: 'Twitch',
    icon: 'Tv',
    color: '#9146ff',
    badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    placeholder: 'https://twitch.tv/channel_name',
    urlPatterns: [
      /(?:https?:\/\/)?(?:www\.)?twitch\.tv\/([a-zA-Z0-9_]+)/i,
    ],
  },
  {
    id: 'kick',
    name: 'Kick',
    icon: 'Zap',
    color: '#53fc18',
    badgeBg: 'bg-emerald-400/10 text-emerald-500 border-emerald-400/20',
    placeholder: 'https://kick.com/username',
    urlPatterns: [
      /(?:https?:\/\/)?(?:www\.)?kick\.com\/([a-zA-Z0-9_]+)/i,
    ],
  },
  {
    id: 'discord',
    name: 'Discord',
    icon: 'MessageSquare',
    color: '#5865f2',
    badgeBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    placeholder: 'https://discord.gg/invitecode or server link',
    urlPatterns: [
      /(?:https?:\/\/)?(?:www\.)?discord\.(?:gg|com\/invite)\/([a-zA-Z0-9]+)/i,
    ],
  },
  {
    id: 'reddit',
    name: 'Reddit',
    icon: 'Flame',
    color: '#ff4500',
    badgeBg: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    placeholder: 'https://reddit.com/r/subreddit or post link',
    urlPatterns: [
      /(?:https?:\/\/)?(?:www\.)?reddit\.com\/(?:r|user)\/([a-zA-Z0-9_]+)/i,
    ],
  },
  {
    id: 'audiomack',
    name: 'Audiomack',
    icon: 'Headphones',
    color: '#ffa200',
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    placeholder: 'https://audiomack.com/artist/song/...',
    urlPatterns: [
      /(?:https?:\/\/)?(?:www\.)?audiomack\.com\/([a-zA-Z0-9_.-]+)/i,
    ],
  },
  {
    id: 'soundcloud',
    name: 'Soundcloud',
    icon: 'Music',
    color: '#ff5500',
    badgeBg: 'bg-orange-600/10 text-orange-500 border-orange-600/20',
    placeholder: 'https://soundcloud.com/artist/track',
    urlPatterns: [
      /(?:https?:\/\/)?(?:www\.)?soundcloud\.com\/([a-zA-Z0-9_.-]+)/i,
    ],
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    icon: 'Pin',
    color: '#e60023',
    badgeBg: 'bg-red-600/10 text-red-500 border-red-600/20',
    placeholder: 'https://pinterest.com/username or pin link',
    urlPatterns: [
      /(?:https?:\/\/)?(?:www\.)?pinterest\.com\/([a-zA-Z0-9_.-]+)/i,
    ],
  },
  {
    id: 'google',
    name: 'Google & Reviews',
    icon: 'Star',
    color: '#4285f4',
    badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    placeholder: 'https://maps.google.com/... or Google Business link',
    urlPatterns: [
      /(?:https?:\/\/)?(?:www\.)?google\.[a-z.]+\/maps/i,
      /(?:https?:\/\/)?g\.page\/([a-zA-Z0-9_.-]+)/i,
      /(?:https?:\/\/)?(?:www\.)?trustpilot\.com\/review\/([a-zA-Z0-9_.-]+)/i,
    ],
  },
  {
    id: 'applemusic',
    name: 'Apple Music',
    icon: 'Radio',
    color: '#fa243c',
    badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    placeholder: 'https://music.apple.com/...',
    urlPatterns: [
      /(?:https?:\/\/)?music\.apple\.com\/([a-zA-Z0-9_.-]+)/i,
    ],
  },
  {
    id: 'quora',
    name: 'Quora',
    icon: 'HelpCircle',
    color: '#b92b27',
    badgeBg: 'bg-red-700/10 text-red-600 border-red-700/20',
    placeholder: 'https://quora.com/profile/... or question link',
    urlPatterns: [
      /(?:https?:\/\/)?(?:www\.)?quora\.com\/([a-zA-Z0-9_.-]+)/i,
    ],
  },
  {
    id: 'other',
    name: 'Other Websites',
    icon: 'Layers',
    color: '#64748b',
    badgeBg: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
    placeholder: 'Enter profile link or target URL',
    urlPatterns: [],
  },
];

export const DEFAULT_SERVICES: SMMService[] = [
  // TikTok Services
  {
    service: 101,
    name: 'TikTok Followers [Instant - Real Looking - 30 Days Refill]',
    category: 'TikTok - Followers',
    rate: '2.80',
    min: 50,
    max: 100000,
    platform: 'tiktok',
    averageTime: '15 minutes',
    refill: true,
    description: 'High retention TikTok accounts with avatar and posts. Fast start within 5-15 mins.'
  },
  {
    service: 102,
    name: 'TikTok Likes [Fast Speed - Non Drop - High Quality]',
    category: 'TikTok - Likes',
    rate: '0.95',
    min: 100,
    max: 500000,
    platform: 'tiktok',
    averageTime: '5 minutes',
    refill: true,
    description: 'Instant start video likes from worldwide active profiles. Safe for algorithm boost.'
  },
  {
    service: 103,
    name: 'TikTok Views [Super Instant - 100M Max - FYP Booster]',
    category: 'TikTok - Views',
    rate: '0.08',
    min: 1000,
    max: 10000000,
    platform: 'tiktok',
    averageTime: 'Instant',
    refill: false,
    description: 'Instant delivery views to trigger TikTok For You Page (FYP) algorithm.'
  },
  {
    service: 104,
    name: 'TikTok Shares & Saves [Organic Engagement Boost]',
    category: 'TikTok - Engagement',
    rate: '0.45',
    min: 100,
    max: 200000,
    platform: 'tiktok',
    averageTime: '10 minutes',
    refill: true,
    description: 'Shares and saves are the highest weighted ranking signal on TikTok in 2026.'
  },

  // Instagram Services
  {
    service: 201,
    name: 'Instagram Followers [HQ Real - 365 Days Refill Button]',
    category: 'Instagram - Followers',
    rate: '1.95',
    min: 50,
    max: 250000,
    platform: 'instagram',
    averageTime: '20 minutes',
    refill: true,
    description: 'Top tier Instagram followers with profile pictures, bios, and highlights.'
  },
  {
    service: 202,
    name: 'Instagram Likes [Reels & Posts - Instant High Speed]',
    category: 'Instagram - Likes',
    rate: '0.65',
    min: 50,
    max: 1000000,
    platform: 'instagram',
    averageTime: '3 minutes',
    refill: true,
    description: 'Immediate delivery likes for Reels and carousel posts with high explore rate.'
  },
  {
    service: 203,
    name: 'Instagram Video / Reels Views [Organic Reach Booster]',
    category: 'Instagram - Views',
    rate: '0.12',
    min: 500,
    max: 10000000,
    platform: 'instagram',
    averageTime: 'Instant',
    refill: false,
    description: 'Ultra fast views for Instagram Reels to push onto Explore Feed.'
  },
  {
    service: 204,
    name: 'Instagram Custom Comments [Positive & Influencer Style]',
    category: 'Instagram - Comments',
    rate: '8.50',
    min: 10,
    max: 5000,
    platform: 'instagram',
    type: 'Custom Comments',
    averageTime: '30 minutes',
    refill: true,
    description: 'Relevant comments from verified & high-karma accounts.'
  },

  // YouTube Services
  {
    service: 301,
    name: 'YouTube Subscribers [Non Drop - 100% Monetizable Safe]',
    category: 'YouTube - Subscribers',
    rate: '14.20',
    min: 50,
    max: 50000,
    platform: 'youtube',
    averageTime: '1-3 hours',
    refill: true,
    description: 'Organic drip subscribers safe for channel monetization and partner program.'
  },
  {
    service: 302,
    name: 'YouTube Views [High Retention - Suggested Videos - 4K Safe]',
    category: 'YouTube - Views',
    rate: '2.40',
    min: 500,
    max: 2000000,
    platform: 'youtube',
    averageTime: '45 minutes',
    refill: true,
    description: 'High watch time views coming through YouTube search and suggested feeds.'
  },
  {
    service: 303,
    name: 'YouTube Shorts Views [Instant Algorithm Blast]',
    category: 'YouTube - Shorts',
    rate: '0.85',
    min: 1000,
    max: 5000000,
    platform: 'youtube',
    averageTime: 'Instant',
    refill: false,
    description: 'Rapid start views optimized for the Shorts shelf.'
  },
  {
    service: 304,
    name: 'YouTube Video Likes [Organic Accounts - Lifetime Warranty]',
    category: 'YouTube - Likes',
    rate: '3.10',
    min: 100,
    max: 100000,
    platform: 'youtube',
    averageTime: '15 minutes',
    refill: true,
    description: 'Gradual natural delivery to maintain high like-to-view ratio.'
  },

  // Twitter / X Services
  {
    service: 401,
    name: 'X (Twitter) Followers [Active Accounts - Fast Delivery]',
    category: 'Twitter - Followers',
    rate: '3.90',
    min: 50,
    max: 100000,
    platform: 'twitter',
    averageTime: '30 minutes',
    refill: true,
    description: 'Followers with real history, avatars, and tweets.'
  },
  {
    service: 402,
    name: 'X (Twitter) Retweets & Reposts [Speed 50k/day]',
    category: 'Twitter - Retweets',
    rate: '2.10',
    min: 50,
    max: 50000,
    platform: 'twitter',
    averageTime: '10 minutes',
    refill: true,
    description: 'Quickly boosts tweet visibility and viral algorithmic rank.'
  },
  {
    service: 403,
    name: 'X (Twitter) Likes / Favorites [Instant Start]',
    category: 'Twitter - Likes',
    rate: '1.40',
    min: 50,
    max: 100000,
    platform: 'twitter',
    averageTime: '5 minutes',
    refill: true,
    description: 'Immediate boost for any tweet or thread.'
  },

  // Spotify Services
  {
    service: 501,
    name: 'Spotify Track Plays [USA / Tier 1 Royalty Eligible]',
    category: 'Spotify - Plays',
    rate: '1.80',
    min: 1000,
    max: 1000000,
    platform: 'spotify',
    averageTime: '2 hours',
    refill: true,
    description: 'Streams from premium listeners with 90s+ average duration.'
  },
  {
    service: 502,
    name: 'Spotify Monthly Listeners & Artist Followers',
    category: 'Spotify - Followers',
    rate: '2.50',
    min: 250,
    max: 200000,
    platform: 'spotify',
    averageTime: '4 hours',
    refill: true,
    description: 'Improves algorithmic playlist additions (Discover Weekly, Release Radar).'
  },

  // Telegram Services
  {
    service: 601,
    name: 'Telegram Channel Members [Non Drop - 0% Drop Rate]',
    category: 'Telegram - Members',
    rate: '1.60',
    min: 100,
    max: 150000,
    platform: 'telegram',
    averageTime: '10 minutes',
    refill: true,
    description: 'Permanent members with zero drop, instant join.'
  },
  {
    service: 602,
    name: 'Telegram Post Views [Last 5 Posts Auto-View]',
    category: 'Telegram - Views',
    rate: '0.15',
    min: 500,
    max: 500000,
    platform: 'telegram',
    averageTime: 'Instant',
    refill: false,
    description: 'Rapid views delivered to your latest post or channel updates.'
  },

  // Facebook Services
  {
    service: 701,
    name: 'Facebook Page Likes & Followers [HQ Global Profiles]',
    category: 'Facebook - Pages',
    rate: '3.20',
    min: 100,
    max: 100000,
    platform: 'facebook',
    averageTime: '1 hour',
    refill: true,
    description: 'Increases authority and social proof for business or creator pages.'
  },
  {
    service: 702,
    name: 'Facebook Post / Video Likes & Reactions (Love, Wow, Care)',
    category: 'Facebook - Reactions',
    rate: '1.10',
    min: 100,
    max: 50000,
    platform: 'facebook',
    averageTime: '15 minutes',
    refill: true,
    description: 'Authentic emotion reactions for any public post or video.'
  }
];
