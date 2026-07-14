(function(){
  const client=window.supabaseClient;

  function isMeetingUrl(url){
    if(!url)return false;
    try{
      const host=new URL(url).hostname.toLowerCase();
      return ['zoom.us','webex.com','meet.google.com','teams.microsoft.com','whereby.com','gotomeeting.com','bluejeans.com'].some(domain=>host===domain||host.endsWith('.'+domain));
    }catch{
      return false;
    }
  }

  const mapEvent=row=>{
    const materialIsMeeting=isMeetingUrl(row.ppt_url);
    return {
      id:row.id,
      channel:row.channel,
      title:row.title,
      titleZh:row.title_zh,
      description:row.description,
      descriptionZh:row.description_zh,
      type:row.event_type,
      typeZh:row.event_type_zh,
      location:row.location,
      locationZh:row.location_zh,
      date:row.starts_at,
      endDate:row.ends_at,
      url:row.registration_url||(materialIsMeeting?row.ppt_url:null),
      summary:row.summary,
      summaryZh:row.summary_zh,
      pptUrl:materialIsMeeting?null:row.ppt_url,
      published:row.published
    };
  };

  window.AISGData={
    enabled:!!client,
    async currentUser(){
      if(!client)return null;
      const {data}=await client.auth.getUser();
      return data.user||null;
    },
    async profile(){
      const user=await this.currentUser();
      if(!user)return null;
      const {data,error}=await client.from('profiles').select('*').eq('id',user.id).single();
      if(error)throw error;
      return data;
    },
    async events(channel){
      if(!client)return[];
      let query=client.from('events').select('*').eq('published',true).order('starts_at',{ascending:false});
      if(channel)query=query.eq('channel',channel);
      const {data,error}=await query;
      if(error)throw error;
      return(data||[]).map(mapEvent);
    },
    async event(id){
      if(!client||!id)return null;
      const {data,error}=await client.from('events').select('*').eq('id',id).maybeSingle();
      if(error)throw error;
      return data?mapEvent(data):null;
    },
    async myRegistrations(){
      const user=await this.currentUser();
      if(!user)return[];
      const {data,error}=await client.from('event_registrations').select('*,events(*)').eq('user_id',user.id).order('registered_at',{ascending:false});
      if(error)throw error;
      return(data||[]).map(row=>({...row,event:mapEvent(row.events)}));
    },
    async registrationFor(eventId){
      const user=await this.currentUser();
      if(!user||!eventId)return null;
      const {data,error}=await client.from('event_registrations').select('*').eq('user_id',user.id).eq('event_id',eventId).maybeSingle();
      if(error)throw error;
      return data||null;
    },
    async register(eventId){
      const user=await this.currentUser();
      if(!user)throw new Error('Please sign in first.');
      const {data,error}=await client.from('event_registrations').insert({event_id:eventId,user_id:user.id}).select().single();
      if(error)throw error;
      return data;
    },
    async unregister(eventId){
      const user=await this.currentUser();
      if(!user)throw new Error('Please sign in first.');
      const event=await this.event(eventId);
      if(!event||new Date(event.date)<=new Date())throw new Error('Registration can only be cancelled before the event starts.');
      const {error}=await client.from('event_registrations').delete().eq('event_id',eventId).eq('user_id',user.id);
      if(error)throw error;
      return true;
    },
    async requestMembership(){
      const user=await this.currentUser();
      if(!user)throw new Error('Please sign in first.');
      const {data,error}=await client.from('membership_requests').insert({user_id:user.id}).select().single();
      if(error)throw error;
      return data;
    }
  };
})();
