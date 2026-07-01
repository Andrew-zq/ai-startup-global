delete from public.events;

insert into public.events (
  id, channel, title, title_zh, description, description_zh,
  event_type, event_type_zh, location, location_zh,
  starts_at, ends_at, registration_url, published
)
values (
  'luma-4ig5pzzb',
  'luma',
  'AI Workflow 101 : Build Your First AI Workflow',
  'AI Workflow 101：构建你的第一个 AI 工作流',
  'A beginner-friendly, no-code workshop hosted by Andrew Zhu. Learn how to turn everyday tasks into simple, repeatable AI workflows.',
  '由 Andrew Zhu 主办的零代码 AI 入门工作坊，帮助参与者把日常任务转化为简单、可重复的 AI 工作流。',
  'Beginner AI Workshop · Sold Out',
  'AI 入门工作坊 · 已售罄',
  'Vancouver, Canada',
  '加拿大温哥华',
  '2026-07-01T18:30:00-07:00',
  '2026-07-01T20:00:00-07:00',
  'https://luma.com/4ig5pzzb',
  true
)
on conflict (id) do update set
  channel = excluded.channel,
  title = excluded.title,
  title_zh = excluded.title_zh,
  description = excluded.description,
  description_zh = excluded.description_zh,
  event_type = excluded.event_type,
  event_type_zh = excluded.event_type_zh,
  location = excluded.location,
  location_zh = excluded.location_zh,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  registration_url = excluded.registration_url,
  published = excluded.published,
  updated_at = now();
