/**
 * SMS Notification Service using Clickatell
 * Handles sending SMS notifications to agents and users
 */

interface SMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
  deliveryStatus?: string;
}

export class SMSService {
  private apiKey: string;
  private apiId: string;
  private baseUrl: string;
  private enabled: boolean;

  constructor() {
    this.apiKey = process.env.CLICKATELL_API_KEY || '';
    this.apiId = process.env.CLICKATELL_API_ID || '';
    this.baseUrl = process.env.CLICKATELL_BASE_URL || 'https://platform.clickatell.com/messages/http/send';
    this.enabled = process.env.ENABLE_SMS_NOTIFICATIONS === 'true';
  }

  /**
   * Send SMS to a phone number
   * @param to - Phone number (e.g., "260773962307")
   * @param message - SMS message content
   * @returns Promise<SMSResult>
   */
  async sendSMS(to: string, message: string): Promise<SMSResult> {
    if (!this.enabled) {
      console.log('[SMS] Notifications disabled. Would send:', { to, message });
      return { success: true, messageId: 'disabled' };
    }

    if (!this.apiKey || !this.apiId) {
      console.error('[SMS] Missing Clickatell credentials');
      return { success: false, error: 'SMS credentials not configured' };
    }

    try {
      // Clean phone number (remove spaces, dashes)
      const cleanPhone = to.replace(/[\s-]/g, '');

      // Build Clickatell HTTP API URL
      const url = `${this.baseUrl}?apiKey=${encodeURIComponent(this.apiKey)}&to=${encodeURIComponent(cleanPhone)}&content=${encodeURIComponent(message)}`;

      const response = await fetch(url, {
        method: 'GET', // Clickatell HTTP API uses GET
      });

      const data = await response.text();

      if (response.ok && data.includes('ID:')) {
        // Extract message ID from response (format: "ID: xxxxxxxx")
        const messageId = data.split('ID:')[1]?.trim() || 'unknown';
        console.log('[SMS] Sent successfully:', { to: cleanPhone, messageId });
        return { success: true, messageId, deliveryStatus: 'sent' };
      } else {
        console.error('[SMS] Failed to send:', data);
        return { success: false, error: data };
      }
    } catch (error) {
      console.error('[SMS] Error sending:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send agent notification SMS
   * @param phoneNumber - Agent phone number
   * @param title - Notification title
   * @param message - Notification message
   * @param actionUrl - Optional action URL
   */
  async sendAgentNotification(
    phoneNumber: string,
    title: string,
    message: string,
    actionUrl?: string
  ): Promise<SMSResult> {
    let smsContent = `${title}\n\n${message}`;

    if (actionUrl) {
      smsContent += `\n\nView: ${actionUrl}`;
    }

    smsContent += '\n\n- InterCity Bookings';

    return this.sendSMS(phoneNumber, smsContent);
  }

  /**
   * Send booking assignment notification to agent
   */
  async sendBookingAssignmentSMS(
    agentPhone: string,
    bookingRef: string,
    passengerName: string,
    passengerPhone: string,
    route: string,
    travelDate: string
  ): Promise<SMSResult> {
    const message = `🎫 New Booking Assigned!\n\nRef: ${bookingRef}\nPassenger: ${passengerName}\nPhone: ${passengerPhone}\nRoute: ${route}\nDate: ${travelDate}\n\nPlease respond within 30 minutes.\n\n- InterCity Bookings`;

    return this.sendSMS(agentPhone, message);
  }

  /**
   * Send new booking notification to agents
   */
  async sendNewBookingAlert(
    agentPhone: string,
    bookingRef: string,
    route: string,
    travelDate: string
  ): Promise<SMSResult> {
    const message = `📢 New Booking Available!\n\nRef: ${bookingRef}\nRoute: ${route}\nDate: ${travelDate}\n\nCheck dashboard for details.\n\n- InterCity Bookings`;

    return this.sendSMS(agentPhone, message);
  }

  /**
   * Send search notification with user contact (for independent agents with lifts)
   */
  async sendSearchNotificationWithContact(
    agentPhone: string,
    userPhone: string,
    searchQuery: string,
    destination: string,
    travelDate: string
  ): Promise<SMSResult> {
    const message = `🔍 New Search Alert!\n\nCustomer: ${userPhone}\nSearching: ${searchQuery}\nTo: ${destination}\nDate: ${travelDate}\n\nContact customer directly!\n\n- InterCity Bookings`;

    return this.sendSMS(agentPhone, message);
  }

  /**
   * Send escalation notification to admin
   */
  async sendEscalationAlert(
    adminPhone: string,
    bookingRef: string,
    agentName: string,
    reason: string
  ): Promise<SMSResult> {
    const message = `⚠️ Booking Escalated!\n\nRef: ${bookingRef}\nAgent: ${agentName}\nReason: ${reason}\n\nImmediate action required.\n\n- InterCity Bookings Admin`;

    return this.sendSMS(adminPhone, message);
  }

  /**
   * Send PIN to agent after approval
   */
  async sendPINNotification(
    agentPhone: string,
    agentName: string,
    tempPIN: string
  ): Promise<SMSResult> {
    const message = `🎉 Welcome ${agentName}!\n\nYour application has been approved!\n\nTemporary PIN: ${tempPIN}\n\nLogin and change your PIN immediately.\n\n- InterCity Bookings`;

    return this.sendSMS(agentPhone, message);
  }
}

// Singleton instance
export const smsService = new SMSService();
