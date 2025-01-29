import { batchApi } from '@/config';
import { useState, version } from 'react';

const WebhookForm = ({params}) => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [headers, setHeaders] = useState('');
  const [messages, setMessages] = useState(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        webhookUrl,
        headers: headers ? JSON.parse(headers) : {},
        messages,
        bridge_id:params.id,
        version_id:params.version
      };

      console.log('Submitting payload:', payload);

      const data = await batchApi({payload})

      if (response.ok) {
        alert('Webhook sent successfully!');
      } else {
        throw new Error('Failed to send webhook');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while sending the webhook.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-base-100 p-6 rounded-lg shadow-lg">
      <div className="form-control mb-4">
        <label htmlFor="webhookUrl" className="label">
          <span className="label-text text-lg font-semibold">Webhook URL</span>
        </label>
        <input
          type="url"
          id="webhookUrl"
          value={webhookUrl}
          placeholder="Enter Webhook URL"
          onChange={(e) => setWebhookUrl(e.target.value)}
          required
          className="input input-bordered w-full"
        />
      </div>

      <div className="form-control mb-4">
        <label htmlFor="headers" className="label">
          <span className="label-text text-lg font-semibold">Headers (JSON)</span>
        </label>
        <textarea
          id="headers"
          value={headers}
          onChange={(e) => setHeaders(e.target.value)}
          placeholder='Example: { "Authorization": "Bearer token" }'
          className="textarea textarea-bordered w-full"
          rows={4}
        />
      </div>

      <hr className="my-4 border-t border-gray-300" />

      <div className="form-control mb-4">
        <label className="label">
          <span className="label-text text-lg font-semibold">Messages</span>
        </label>
        <textarea
          onBlur={(e) => setMessages(e.target.value.split(',').filter(msg => msg !== ''))}
          placeholder="Enter messages separated by commas"
          className="textarea textarea-bordered w-full"
          rows={4}
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`btn ${isSubmitting ? 'btn-disabled' : 'btn-primary'}`}
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </button>
      </div>
    </form>
  );
};

export default WebhookForm;