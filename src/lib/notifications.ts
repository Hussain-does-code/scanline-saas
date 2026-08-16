import { Resend } from 'resend';
import { Finding } from '@/components/ui/finding-row';

const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');

export async function sendNewFindingAlert(email: string, repoName: string, finding: Finding) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[MOCK EMAIL] To: ${email} | Subject: New ${finding.severity} finding in ${repoName}`);
    return { id: "mock-id" };
  }

  return await resend.emails.send({
    from: 'Scanline <alerts@scanline.app>',
    to: email,
    subject: `New ${finding.severity} finding in ${repoName}`,
    html: `
      <h2>New security finding detected</h2>
      <p>Scanline found a new <strong>${finding.category}</strong> issue.</p>
      <p><strong>What this is:</strong> ${finding.plain_explanation}</p>
      <p><strong>The risk:</strong> ${finding.risk_scenario}</p>
      <p><a href="https://scanline.app/dashboard">View in dashboard</a> to get the fix prompt.</p>
    `
  });
}
