const ADMIN_EMAIL = 'anqizhu105@gmail.com';

function doPost(e) {
  try {
    const request = JSON.parse(e.postData.contents || '{}');
    if (!request.email || !request.id) throw new Error('Invalid request');

    const subject = 'AI Startup Global：新的付费会员升级申请';
    const body = [
      '有用户提交了付费会员升级申请。',
      '',
      '姓名：' + (request.name || '未填写'),
      '邮箱：' + request.email,
      '已确认参加活动：' + (request.attendedEvents || 0) + ' 场',
      '申请时间：' + (request.requestedAt || ''),
      '',
      '请进入管理员后台审核：',
      request.siteUrl || ''
    ].join('\n');

    GmailApp.sendEmail(ADMIN_EMAIL, subject, body);
    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: error.message })).setMimeType(ContentService.MimeType.JSON);
  }
}
