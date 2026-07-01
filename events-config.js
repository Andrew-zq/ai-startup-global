/* Add new events here. The events page sorts them by date, newest first.
   Replace each url with its corresponding Luma registration URL. */
window.EVENTS_CONFIG = {
  lumaUrl: "events.html",
  calendarUrl: "https://luma.com/",
  events: [
    {id:"luma-4ig5pzzb",date:"2026-07-01T18:30:00-07:00",title:"AI Workflow 101 : Build Your First AI Workflow",titleZh:"AI Workflow 101：构建你的第一个 AI 工作流",location:"Vancouver, Canada",locationZh:"加拿大温哥华",type:"Beginner AI Workshop · Sold Out",typeZh:"AI 入门工作坊 · 已售罄",description:"A beginner-friendly, no-code workshop hosted by Andrew Zhu. Learn how to turn everyday tasks into simple, repeatable AI workflows.",descriptionZh:"由 Andrew Zhu 主办的零代码 AI 入门工作坊，帮助参与者把日常任务转化为简单、可重复的 AI 工作流。",url:"https://luma.com/4ig5pzzb"}
  ],
  memberEvents: []
};

if (!window.supabaseClient) {
  document.write('<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"><\/script>');
  document.write('<script src="supabase-config.js"><\/script>');
  document.write('<script src="supabase-client.js"><\/script>');
  document.write('<script src="supabase-data.js"><\/script>');
} else if (!window.AISGData) {
  document.write('<script src="supabase-data.js"><\/script>');
}
