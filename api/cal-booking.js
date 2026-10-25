// cal.com webhook → Slack #leads.
// cal.com posts here on every booking event. We turn it into a Slack message
// with the booker's answers and a one-tap WhatsApp button.
// Needs env var SLACK_WEBHOOK (the same #leads incoming webhook the lead bot uses).

const EVENTS = {
  BOOKING_CREATED: { head: 'New call booked', icon: ':calendar:' },
  BOOKING_RESCHEDULED: { head: 'Call rescheduled', icon: ':arrows_counterclockwise:' },
  BOOKING_CANCELLED: { head: 'Call cancelled', icon: ':x:' },
};

const clean = (s) => String(s == null ? '' : s).replace(/[<>&]/g, '').slice(0, 300);
const digits = (s) => String(s || '').replace(/[^\d]/g, '').replace(/^00/, '');

function answer(v) {
  if (v == null) return '';
  if (typeof v === 'object') return v.value != null ? answer(v.value) : Array.isArray(v) ? v.map(answer).join(', ') : '';
  return String(v);
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(200).send('ok');
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const ev = EVENTS[body.triggerEvent];
  const p = body.payload || {};
  // Ignore anything that doesn't look like a cal.com booking event.
  if (!ev || !p.startTime) return res.status(200).json({ skipped: true });
  if (!process.env.SLACK_WEBHOOK) return res.status(200).json({ skipped: 'no SLACK_WEBHOOK' });

  const who = (p.attendees && p.attendees[0]) || {};
  const responses = p.responses || {};
  const name = clean(answer(responses.name) || who.name || 'Someone');
  const email = clean(answer(responses.email) || who.email);
  let phone = '';
  const lines = [];
  for (const [key, v] of Object.entries(responses)) {
    const val = clean(answer(v));
    if (!val || ['name', 'email', 'guests', 'rescheduleReason', 'notes'].includes(key)) continue;
    const label = clean((v && v.label) || key.replace(/[_-]/g, ' '));
    if (/phone|whatsapp|attendeePhone/i.test(key + label) && digits(val).length >= 9) phone = digits(val);
    lines.push(`• ${label}: *${val}*`);
  }
  if (!phone && who.phoneNumber) phone = digits(who.phoneNumber);
  if (responses.notes && answer(responses.notes)) lines.push(`• Notes: _${clean(answer(responses.notes))}_`);

  const when = new Date(p.startTime).toLocaleString('en-GB', {
    timeZone: 'Europe/London', weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });
  const first = name.split(/\s+/)[0];
  const opener = `Salaam ${first}, it's Mussa from Abu Ecom. Looking forward to our call on ${when}. Anything you'd like me to look at before we speak?`;

  const blocks = [
    { type: 'header', text: { type: 'plain_text', text: `${ev.head}: ${name}`.slice(0, 150) } },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: [`${ev.icon} *${clean(p.title || 'Call')}* · ${when} (UK time)`, `:email: ${email || 'no email'}   :phone: ${phone ? '+' + phone : 'no phone'}`, ...lines].join('\n'),
      },
    },
  ];
  const buttons = [];
  if (phone && body.triggerEvent !== 'BOOKING_CANCELLED') buttons.push({ type: 'button', style: 'primary', text: { type: 'plain_text', text: 'WhatsApp them now' }, url: `https://wa.me/${phone}?text=${encodeURIComponent(opener)}` });
  if (email) buttons.push({ type: 'button', text: { type: 'plain_text', text: 'Email' }, url: `mailto:${email}` });
  if (buttons.length) blocks.push({ type: 'actions', elements: buttons });

  const r = await fetch(process.env.SLACK_WEBHOOK, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ text: `${ev.head}: ${name} · ${when}`, blocks }),
  });
  return res.status(200).json({ posted: r.ok });
};
