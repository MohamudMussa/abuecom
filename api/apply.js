// /apply form → Slack #leads.
// Fires when someone qualifies on /apply, before they pick a time,
// so we can WhatsApp them even if they never book.
// Needs env var SLACK_WEBHOOK (the same #leads webhook the cal.com hook uses).

const clean = (s, n = 200) => String(s == null ? '' : s).replace(/[<>&*_`~|]/g, '').trim().slice(0, n);
const digits = (s) => String(s || '').replace(/[^\d]/g, '').replace(/^00/, '').slice(0, 15);

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  let body = req.body || {};
  if (typeof body === 'string') { try { body = JSON.parse(body || '{}'); } catch (e) { body = {}; } }

  // Bots fill the hidden "company" field. Pretend it worked.
  if (body.company) return res.status(200).json({ ok: true });

  const name = clean(body.name, 80);
  const email = clean(body.email, 120);
  const phone = digits(body.phone);
  const site = clean(body.site, 120).replace(/^https?:\/\//i, '');
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || phone.length < 9) {
    return res.status(400).json({ error: 'missing fields' });
  }
  if (!process.env.SLACK_WEBHOOK) return res.status(200).json({ skipped: 'no SLACK_WEBHOOK' });

  const utm = body.utm && typeof body.utm === 'object' ? body.utm : {};
  const src = ['utm_campaign', 'utm_content', 'utm_source'].map((k) => clean(utm[k], 80)).filter(Boolean).join(' › ');
  const first = name.split(/\s+/)[0];
  const opener = `Salaam ${first}, it's Mussa from Abu Ecom. Saw your application for the Email Takeover for ${site || 'your store'}. When's good for a quick call today?`;

  const blocks = [
    { type: 'header', text: { type: 'plain_text', text: `:fire: Takeover application: ${name}`.slice(0, 150), emoji: true } },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: [
          `*${name}*${site ? `  ·  <https://${site}|${site}>` : ''}`,
          `:phone: +${phone}   :email: ${email}`,
          `• Revenue: *${clean(body.revenue, 40)}*`,
          `• Muslim: *${clean(body.muslim, 10)}*`,
          `• No photos of women okay: *${clean(body.imagery, 30)}*`,
          '_Qualified. Sent to the calendar. If no "New call booked" message follows, WhatsApp them._',
        ].join('\n'),
      },
    },
    {
      type: 'actions',
      elements: [
        { type: 'button', style: 'primary', text: { type: 'plain_text', text: 'WhatsApp them now' }, url: `https://wa.me/${phone}?text=${encodeURIComponent(opener)}` },
        { type: 'button', text: { type: 'plain_text', text: 'Email' }, url: `mailto:${email}` },
      ],
    },
    { type: 'context', elements: [{ type: 'mrkdwn', text: `abuecom.com/apply${src ? `  ·  ${src}` : ''}` }] },
  ];

  try {
    const r = await fetch(process.env.SLACK_WEBHOOK, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text: `Takeover application: ${name} +${phone}`, blocks }),
    });
    return res.status(200).json({ ok: r.ok });
  } catch (e) {
    return res.status(200).json({ ok: false });
  }
};
